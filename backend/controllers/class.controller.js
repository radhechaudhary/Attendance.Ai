import db from "../database/attendance.db.js";
import axios from 'axios'
import FormData from "form-data";

const addClass = async (req, res) => {
    const { subject, section, schedule } = req.body
    const query = `Insert into classes (class_id, subject, section, students, teacher_id) values ($1, $2, $3, $4, $5)`
    const classId = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const values = [classId, subject, section, 0, req.user.email]
    try {
        await db.query(query, values)
        res.json({ status: 'success', classId }).status(200);
    }
    catch (err) {
        console.log(err);
        res.json({ status: 'error' }).status(400);
    }
}

const fetchClassesList = async (req, res) => {
    const query = 'select class_id, subject, section, students from classes where teacher_id = $1';
    try {
        const data = await db.query(query, [req.user.email])
        // console.log(data.rows)
        res.json({ status: 'success', classes: data.rows }).status(200);
    }
    catch (err) {
        console.log(err);
        res.json({ status: 'error' }).status(400);
    }

}

const getStudents = async (req, res) => {
    const { classId } = req.body
    const query = 'select * from students where class_id = $1'
    try {
        const data = await db.query(query, [classId])
        res.json({ status: 'success', students: data.rows }).status(200);
    }
    catch (err) {
        console.log(err);
        res.json({ status: 'error' }).status(400);
    }
}

const markAttendance = async (req, res) => {
    const { attendanceRecords } = req.body;
    try {
        const query = 'INSERT INTO attendance (student_id, class_id, date, status) VALUES ($1, $2, $3, $4) ON CONFLICT (student_id, class_id, date) DO UPDATE SET status = EXCLUDED.status';
        for (const record of attendanceRecords) {
            await db.query(query, [record.student_id, record.class_id, record.date, record.status]);
        }
        res.json({ status: 'success' }).status(200);
    } catch (err) {
        console.log(err);
        res.json({ status: 'error' }).status(400);
    }
}

const photoAttendance = async (req, res) => {
    const { classId } = req.body
    const formData = new FormData();
    // console.log(req.files)
    for (let file of req.files) {
        formData.append(
            "images",
            file.buffer,
            {
                filename: file.originalname,
                contentType: file.mimetype
            }
        );
    }
    let embeddings = []
    try {
        const embeddingsData = await db.query("select student_id,left_embeddings,right_embeddings,center_embeddings from embeddings where class_id = $1", [classId])
        embeddings = embeddingsData.rows;
    }
    catch (err) {
        console.log("error");
        res.json({ status: 'error' }).status(400);
    }
    // console.log(embeddings)
    formData.append("embeddings", JSON.stringify(embeddings));
    try {
        let result = await axios.post("http://localhost:5000/match_embeddings", formData, { headers: { ...formData.getHeaders() } })
        console.log(result.data)
        res.json({ status: 'success', attendance: result.data }).status(200);
    }
    catch (err) {
        console.log("error");
        res.json({ status: 'error' }).status(400);
    }
}

export { addClass, fetchClassesList, getStudents, markAttendance, photoAttendance };
