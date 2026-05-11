import db from "../database/attendance.db.js";

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

export { addClass, fetchClassesList, getStudents };
