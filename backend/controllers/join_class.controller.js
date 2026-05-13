import db from "../database/attendance.db.js";
import axios from 'axios'
import FormData from "form-data";

const MODEL_API_URL = "http://127.0.0.1:5000/generate_embeddings"


const joinClass = async (req, res) => {
    const files = req.files;
    const leftBuffer = files['left'] ? files['left'][0].buffer : null;
    const rightBuffer = files['right'] ? files['right'][0].buffer : null;
    const centreBuffer = files['centre'] ? files['centre'][0].buffer : null;

    const { name, classCode, email } = req.body;
    console.log(name, classCode, email);

    const formData = new FormData({ maxDataSize: 256 * 1024 * 1024 });

    formData.append("left", leftBuffer, {
        filename: "left.jpg",
        contentType: "image/jpeg"
    });
    formData.append("right", rightBuffer, {
        filename: "right.jpg",
        contentType: "image/jpeg"
    });
    formData.append("center", centreBuffer, {
        filename: "center.jpg",
        contentType: "image/jpeg"
    });

    console.log("Photos received:", { left: !!leftBuffer, right: !!rightBuffer, centre: !!centreBuffer });
    try {
        console.log("Here<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
        let result;
        try {
            result = await axios.post(MODEL_API_URL, formData, { headers: { ...formData.getHeaders() } });
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
            console.log(result.data.embeddings[0])
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
        }
        catch (err) {
            console.log("error ", err);
            res.status(400).json({ status: 'error', error: err.response.data.error })
            return;
        }
        await db.query("insert into students (student_id,name, class_id) values ($1, $2, $3)", [email, name, classCode])
        await db.query("update classes set students = students + 1 where class_id = $1", [classCode]);
        // await db.query("INSERT INTO attendance (student_id, class_id, date, status) VALUES ($1, $2, $3, $4) ON CONFLICT (student_id, class_id, date) DO UPDATE SET status = EXCLUDED.status", [email, classCode, new Date().toISOString().split('T')[0], "Absent"]);
        await db.query("insert into embeddings (student_id, class_id, left_embeddings, right_embeddings, center_embeddings) values ($1, $2, $3, $4, $5)", [email, classCode, result.data.embeddings[0], result.data.embeddings[1], result.data.embeddings[2]]);
        res.status(200).json({ status: 'success' })
    }
    catch (err) {
        console.log(err);
        res.status(400).json({ status: 'error', error: "Error in Joining the class" })
    }

}

export { joinClass };