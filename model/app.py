import os
# import pandas as pd
# pyrefly: ignore [missing-import]
import numpy as np
from PIL import Image
import io
import re
# pyrefly: ignore [missing-import]
from flask import Flask, jsonify, request
from flask_cors import CORS
# pyrefly: ignore [missing-import]
import cv2
# pyrefly: ignore [missing-import]
import face_recognition
import json


app = Flask(__name__)

app.config['MAX_CONTENT_LENGTH'] = 48 * 1024 * 1024

CORS(app, resources={r"/*": {"origins": "*"}}, methods=["POST", "GET"])


def get_laplace(file):

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

    print(laplacian_var)

    # IMPORTANT
    file.seek(0)

    return laplacian_var

@app.route('/', methods=["GET"])
def get():
    return {
        "message": "Welcome to the Smart AI Attendance Model"
    }, 200

@app.route('/generate_embeddings', methods=["POST"])
def query():
    left = request.files.getlist("left")    
    right = request.files.getlist("right")   
    center = request.files.getlist("center")
    print(left)
    left = left[0]
    right = right[0]
    center = center[0]

    if(get_laplace(left) < 80):
        return {
            "error": "Image is blurred"
        }, 400

    if(get_laplace(right) < 80):
        return {
            "error": "Image is blurred"
        }, 400

    if(get_laplace(center) < 80):
        return {
            "error": "Image is blurred"
        }, 400


    left_image = face_recognition.load_image_file(left)
    right_image = face_recognition.load_image_file(right)
    center_image = face_recognition.load_image_file(center)

    left_encodings = face_recognition.face_encodings(left_image, face_recognition.face_locations(left_image, model="hog"))
    right_encodings = face_recognition.face_encodings(right_image, face_recognition.face_locations(right_image, model="hog"))
    center_encodings = face_recognition.face_encodings(center_image, face_recognition.face_locations(center_image, model="hog"))

    # Validation
    if (
        len(left_encodings) != 1 or
        len(right_encodings) != 1 or
        len(center_encodings) != 1
    ):
        return {
            "error": "Each image must contain exactly one face"
        }, 400

    embeddings = [
        left_encodings[0].tolist(),
        right_encodings[0].tolist(),
        center_encodings[0].tolist()
    ]

    return {
        "embeddings": embeddings
    }

@app.route("/match_embeddings", methods=["POST"])
def match_embeddings():

    print("--------------------------------------------------------------")
    # print(request.files)

    files = request.files.getlist("images")
    # print(files)
    saved_embeddings = json.loads(
        request.form["embeddings"]
    )
    # print(saved_embeddings)

    embeddings = []

    for file in files:
        print(type(file))
        image = face_recognition.load_image_file(file)
        
        print(">..........>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
        # print(type(image))
        # print(image.shape)
        # print(image.dtype)
        print(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
        locations = face_recognition.face_locations(
            image,
            model="hog"
        )
        
        encodings = face_recognition.face_encodings(image, locations)
        print(len(encodings), " Face Detected ------------------------------------")

        for encoding in encodings:
            embeddings.append(
                np.array(
                    encoding,
                    dtype=np.float64
                )
            )
    print(len(embeddings), "embeddings------------------------------------")
    print(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    if len(embeddings) > 0:
        print(embeddings[0].shape)
        print(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    

    status = {}

    THRESHOLD = 0.55


    for embedding in embeddings:

        best_distance = 999
        matched_student = None

        for saved_embedding in saved_embeddings:

            left_embedding = np.array(
                saved_embedding['left_embeddings'],
                dtype=np.float64
            )

            right_embedding = np.array(
                saved_embedding['right_embeddings'],
                dtype=np.float64
            )

            center_embedding = np.array(
                saved_embedding['center_embeddings'],
                dtype=np.float64
            )

            left_distance = face_recognition.face_distance(
                [left_embedding],
                embedding
            )[0]

            right_distance = face_recognition.face_distance(
                [right_embedding],
                embedding
            )[0]

            center_distance = face_recognition.face_distance(
                [center_embedding],
                embedding
            )[0]

            current_best = min(
                left_distance,
                right_distance,
                center_distance
            )

            if current_best < best_distance:

                best_distance = current_best
                matched_student = saved_embedding['student_id']

            if best_distance < THRESHOLD:

                status[matched_student] = "Present"

    return jsonify(status)
    


