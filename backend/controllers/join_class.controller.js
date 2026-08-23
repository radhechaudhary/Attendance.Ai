import db from "../database/attendance.db.js";
import axios from 'axios'
import FormData from "form-data";
import dotenv from "dotenv";
dotenv.config();

const MODEL_API_URL = process.env.MODEL_API_URL
console.log("MODEL_API_URL", MODEL_API_URL)


const joinClass = async (req, res) => {
    const files = req.files;
    const leftBuffer = files['left'] ? files['left'][0].buffer : null;
    const rightBuffer = files['right'] ? files['right'][0].buffer : null;
    const centreBuffer = files['centre'] ? files['centre'][0].buffer : null;

    const { classCode } = req.body;
    const email = req.user.email;
    const name = req.user.name;
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
        const classCheck = await db.query("select class_id from classes where class_id = $1", [classCode]);
        if (classCheck.rowCount === 0) {
            res.status(404).json({ status: 'error', error: 'Invalid class code' });
            return;
        }

        console.log("Here<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
        let result;
        try {
            result = await axios.post(`${MODEL_API_URL}/generate_embeddings`, formData, { headers: { ...formData.getHeaders() } });
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
            console.log(result.data.embeddings[0])
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
        }
        catch (err) {
            console.log("error ", err);
            res.status(400).json({ status: 'error', error: err.response.data.error })
            return;
        }

        const existingEnrollment = await db.query(
            "select 1 from students where student_id = $1 and class_id = $2",
            [email, classCode]
        );
        if (existingEnrollment.rowCount === 0) {
            await db.query("insert into students (student_id,name, class_id, roll_no) values ($1, $2, $3, $4)", [email, name, classCode, 123])
            await db.query("update classes set students = students + 1 where class_id = $1", [classCode]);
        }

        await db.query(
            `insert into embeddings (student_id, class_id, left_embeddings, right_embeddings, center_embeddings)
             values ($1, $2, $3, $4, $5)
             on conflict (student_id, class_id) do update set
               left_embeddings = excluded.left_embeddings,
               right_embeddings = excluded.right_embeddings,
               center_embeddings = excluded.center_embeddings`,
            [email, classCode, result.data.embeddings[0], result.data.embeddings[1], result.data.embeddings[2]]
        );
        res.status(200).json({ status: 'success' })
    }
    catch (err) {
        console.log(err);
        res.status(400).json({ status: 'error', error: "Error in Joining the class" })
    }

}

export { joinClass };