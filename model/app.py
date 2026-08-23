import os
import numpy as np
from PIL import Image
import io
from flask import Flask, jsonify, request
from flask_cors import CORS
import cv2
import insightface
from insightface.app import FaceAnalysis
import json


app = Flask(__name__)

app.config['MAX_CONTENT_LENGTH'] = 48 * 1024 * 1024

CORS(app, resources={r"/*": {"origins": "*"}}, methods=["POST", "GET"])

# ──────────────────────────────────────────────
# Initialize InsightFace (RetinaFace + ArcFace)
# ──────────────────────────────────────────────
# buffalo_l model pack: RetinaFace (detection) + ArcFace (recognition)
# Face alignment is handled automatically by InsightFace.
face_app = FaceAnalysis(
    name="buffalo_l",
    providers=["CUDAExecutionProvider", "CPUExecutionProvider"]
)
# det_size controls the detection resolution — (640,640) is a good balance
# of speed and accuracy for classroom photos on a GTX 1650.
face_app.prepare(ctx_id=0, det_size=(640, 640))


# ──────────────────────────────────────────────
# Helper: Blur detection via Laplacian variance
# ──────────────────────────────────────────────
def get_laplace(file):
    """Compute the Laplacian variance of the full image as a blur indicator."""
    file_bytes = file.read()

    np_arr = np.frombuffer(
        file_bytes,
        np.uint8
    )

    image = cv2.imdecode(
        np_arr,
        cv2.IMREAD_COLOR
    )

    if image is None:
        return True

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    laplacian_var = cv2.Laplacian(
        gray,
        cv2.CV_64F
    ).var()

    file.seek(0)

    return laplacian_var


# ──────────────────────────────────────────────
# Helper: Blur check on the face region only
# ──────────────────────────────────────────────
def get_face_laplace(image, bbox):
    """
    Compute the Laplacian variance on the cropped face region only.
    A blurry background doesn't matter — only the face sharpness counts.
    """
    x1, y1, x2, y2 = [int(v) for v in bbox]
    face_crop = image[y1:y2, x1:x2]

    if face_crop.size == 0:
        return 0

    gray = cv2.cvtColor(face_crop, cv2.COLOR_BGR2GRAY)
    return cv2.Laplacian(gray, cv2.CV_64F).var()


# ──────────────────────────────────────────────
# Helper: CLAHE preprocessing for lighting normalization
# ──────────────────────────────────────────────
def apply_clahe(image):
    """
    Apply Contrast Limited Adaptive Histogram Equalization (CLAHE)
    to normalize lighting across the image. This ensures students
    sitting in shadows or near bright windows are encoded consistently
    with their registration photos.
    """
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab)

    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l_channel = clahe.apply(l_channel)

    lab = cv2.merge((l_channel, a_channel, b_channel))
    return cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)


# ──────────────────────────────────────────────
# Helper: Load image from file upload into OpenCV BGR numpy array
# ──────────────────────────────────────────────
def load_image_from_file(file):
    """Read an uploaded file into an OpenCV BGR image (numpy array)."""
    file_bytes = file.read()
    np_arr = np.frombuffer(file_bytes, np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    file.seek(0)
    return image


# ──────────────────────────────────────────────
# Helper: Check if detected face occupies enough space
# ──────────────────────────────────────────────
def check_face_area(image, bbox):
    """
    Ensure the face occupies at least 10% of the image area.
    Uses InsightFace's bounding box output.
    """
    x1, y1, x2, y2 = [int(v) for v in bbox]
    face_area = (x2 - x1) * (y2 - y1)
    img_height, img_width = image.shape[:2]
    image_area = img_width * img_height

    ratio = face_area / image_area
    return ratio >= 0.10


# ──────────────────────────────────────────────
# Helper: Cosine similarity between two embeddings
# ──────────────────────────────────────────────
def cosine_similarity(emb1, emb2):
    """Compute cosine similarity between two L2-normalized embedding vectors."""
    return float(np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2)))


# ──────────────────────────────────────────────
# Routes
# ──────────────────────────────────────────────
@app.route('/', methods=["GET"])
def get():
    return {
        "message": "Welcome to the Smart AI Attendance Model (v2 — InsightFace)"
    }, 200


@app.route('/generate_embeddings', methods=["POST"])
def generate_embeddings():
    """
    Accepts 3 profile photos (left, right, center), validates quality,
    and returns 512-dimensional ArcFace embeddings for each.
    
    InsightFace automatically performs face alignment before encoding.
    """
    left = request.files.getlist("left")
    right = request.files.getlist("right")
    center = request.files.getlist("center")

    left = left[0]
    right = right[0]
    center = center[0]

    # ── Blur check on the full image ──
    if get_laplace(left) < 30:
        print("Left image is blurred")
        return {"error": "Left Image is blurred"}, 400

    if get_laplace(right) < 30:
        print("Right image is blurred")
        return {"error": "Right Image is blurred"}, 400

    if get_laplace(center) < 30:
        print("Center image is blurred")
        return {"error": "Center Image is blurred"}, 400

    # ── Load images ──
    left_image = load_image_from_file(left)
    right_image = load_image_from_file(right)
    center_image = load_image_from_file(center)

    # ── Apply CLAHE for lighting normalization ──
    left_image = apply_clahe(left_image)
    right_image = apply_clahe(right_image)
    center_image = apply_clahe(center_image)

    # ── Detect + Align + Encode with InsightFace ──
    # face_app.get() returns a list of Face objects, each containing:
    #   - bbox: bounding box [x1, y1, x2, y2]
    #   - embedding: 512-d ArcFace vector (already aligned internally)
    #   - det_score: detection confidence
    left_faces = face_app.get(left_image)
    right_faces = face_app.get(right_image)
    center_faces = face_app.get(center_image)

    # ── Validate: exactly one face per image ──
    if len(left_faces) != 1 or len(right_faces) != 1 or len(center_faces) != 1:
        return {
            "error": "Each image must contain exactly one face"
        }, 400

    # ── Check face area ──
    if (not check_face_area(left_image, left_faces[0].bbox) or
            not check_face_area(right_image, right_faces[0].bbox) or
            not check_face_area(center_image, center_faces[0].bbox)):
        return {
            "error": "Move closer to the camera."
        }, 400

    # ── Check face-region sharpness ──
    FACE_BLUR_THRESHOLD = 20
    if (get_face_laplace(left_image, left_faces[0].bbox) < FACE_BLUR_THRESHOLD or
            get_face_laplace(right_image, right_faces[0].bbox) < FACE_BLUR_THRESHOLD or
            get_face_laplace(center_image, center_faces[0].bbox) < FACE_BLUR_THRESHOLD):
        return {
            "error": "Face region is too blurry. Please retake the photo."
        }, 400

    # ── Return 512-d embeddings ──
    embeddings = [
        left_faces[0].embedding.tolist(),
        right_faces[0].embedding.tolist(),
        center_faces[0].embedding.tolist()
    ]

    return {
        "embeddings": embeddings
    }


@app.route("/match_embeddings", methods=["POST"])
def match_embeddings():
    """
    Accepts classroom photos and stored student embeddings.
    
    Matching logic improvements:
    1. Averaged Embeddings: Computes mean of left+right+center → single robust vector per student.
    2. Cosine Similarity: Uses cosine similarity instead of Euclidean distance (mathematically
       appropriate for ArcFace's L2-normalized hypersphere embeddings).
    3. CLAHE preprocessing on classroom images for lighting normalization.
    """
    print("--------------------------------------------------------------")

    files = request.files.getlist("images")
    saved_embeddings = json.loads(
        request.form["embeddings"]
    )

    # ── Pre-compute averaged embeddings for each student ──
    # Instead of comparing against 3 separate vectors, we create a single
    # mean embedding per student. This is more robust and 3x faster.
    student_profiles = []
    for saved_embedding in saved_embeddings:
        left_emb = np.array(saved_embedding['left_embeddings'], dtype=np.float64)
        right_emb = np.array(saved_embedding['right_embeddings'], dtype=np.float64)
        center_emb = np.array(saved_embedding['center_embeddings'], dtype=np.float64)

        # Average the 3 pose embeddings and L2-normalize
        mean_emb = (left_emb + right_emb + center_emb) / 3.0
        mean_emb = mean_emb / np.linalg.norm(mean_emb)

        student_profiles.append({
            'student_id': saved_embedding['student_id'],
            'mean_embedding': mean_emb
        })

    # ── Extract face embeddings from classroom photos ──
    detected_embeddings = []

    for file in files:
        print(file)

        if get_laplace(file) < 30:
            print("Image is blurred, skipping")
            continue

        image = load_image_from_file(file)

        # Apply CLAHE for consistent lighting
        image = apply_clahe(image)

        # InsightFace: detect + align + encode all faces in one call
        faces = face_app.get(image)
        print(f"{len(faces)} Face(s) Detected ------------------------------------")

        for face in faces:
            # Only consider faces with good detection confidence
            if face.det_score < 0.5:
                print(f"  Skipping low-confidence detection (score={face.det_score:.2f})")
                continue

            # Check face-region sharpness
            if get_face_laplace(image, face.bbox) < 15:
                print(f"  Skipping blurry face region")
                continue

            detected_embeddings.append(
                face.embedding.astype(np.float64)
            )

    print(f"{len(detected_embeddings)} valid embeddings ------------------------------------")

    # ── Match detected faces against student profiles ──
    status = {}
    confidence = {}

    # Cosine distance threshold (1 - cosine_similarity)
    # ArcFace embeddings are designed for cosine comparison.
    # Lower = stricter. 0.35 is a good starting point.
    COSINE_DISTANCE_THRESHOLD = 0.35

    for embedding in detected_embeddings:

        best_similarity = -1.0
        matched_student = None

        for profile in student_profiles:
            sim = cosine_similarity(embedding, profile['mean_embedding'])

            if sim > best_similarity:
                best_similarity = sim
                matched_student = profile['student_id']

        # cosine_distance = 1 - cosine_similarity
        cosine_distance = 1.0 - best_similarity

        if cosine_distance < COSINE_DISTANCE_THRESHOLD and matched_student is not None:
            print(f"  Matched: {matched_student} (similarity={best_similarity:.4f})")
            status[matched_student] = "Present"

            # Report confidence as cosine similarity percentage
            confidence_score = best_similarity * 100
            if confidence.get(matched_student, 0) < confidence_score:
                confidence[matched_student] = confidence_score

    return jsonify({
        'status': status,
        'confidence': confidence
    })


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        debug=True,
        port=5000
    )
