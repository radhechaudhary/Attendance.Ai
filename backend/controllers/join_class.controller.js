import db from "../database/attendance.db.js";
const joinClass = async (req, res) => {
    const imageBuffer = req.file.buffer;
    const { name, classCode, email } = req.body;
    console.log(name, classCode, email);
    try {
        await db.query("insert into students (student_id,name, class_id) values ($1, $2, $3)", [classCode, name, email])
        await db.query("update classes set students = students + 1 where class_id = $1", [classCode]);
        res.status(200).json({ status: 'success' })
    }
    catch (err) {
        console.log(err);
        res.status(400).json({ status: 'error' })
    }

}

export { joinClass };