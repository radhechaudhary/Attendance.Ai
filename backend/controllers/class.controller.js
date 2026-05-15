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

const getClassStudentStats = async (req, res) => {
    const { classId } = req.body;
    try {
        const sessionsQuery = 'SELECT COUNT(DISTINCT date) as total_sessions FROM attendance WHERE class_id = $1';
        const sessionsData = await db.query(sessionsQuery, [classId]);
        const totalSessions = parseInt(sessionsData.rows[0].total_sessions) || 0;

        const query = `
            SELECT 
            s.student_id, 
            s.name,
            COUNT(a.status) FILTER (WHERE a.status = 'Present') AS present_count,

            ARRAY(
                SELECT status 
                FROM attendance 
                WHERE student_id = s.student_id 
                AND class_id = s.class_id
                ORDER BY date DESC 
            ) AS recent_attendance

        FROM students s

        LEFT JOIN attendance a 
        ON s.student_id = a.student_id 
        AND s.class_id = a.class_id

        WHERE s.class_id = $1

        GROUP BY s.student_id, s.name, s.class_id;
        `;

        const data = await db.query(query, [classId]);

        const students = data.rows.map(student => {
            const presentCount = parseInt(student.present_count);
            const percentage = totalSessions > 0 ? ((presentCount / totalSessions) * 100).toFixed(2) : "0.00";
            return {
                ...student,
                present_count: presentCount,
                total_sessions: totalSessions,
                percentage: percentage
            };
        });

        res.json({ status: 'success', students }).status(200);
    } catch (err) {
        console.error(err);
        res.json({ status: 'error' }).status(400);
    }
}

export { addClass, fetchClassesList, getStudents, markAttendance, photoAttendance, getClassStudentStats };

