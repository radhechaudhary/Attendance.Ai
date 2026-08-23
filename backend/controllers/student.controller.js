import db from "../database/attendance.db.js";

const fetchClassesList = async (req, res) => {
    const studentId = req.user.email;
    const query = `
        SELECT
            s.class_id,
            c.subject,
            c.section,
            c.students,
            COALESCE(sess.total_sessions, 0)::int AS total_sessions,
            COALESCE(pres.present_count, 0)::int AS present_count
        FROM students s
        JOIN classes c ON c.class_id = s.class_id
        LEFT JOIN (
            SELECT class_id, COUNT(DISTINCT date) AS total_sessions
            FROM attendance GROUP BY class_id
        ) sess ON sess.class_id = s.class_id
        LEFT JOIN (
            SELECT class_id, student_id, COUNT(*) FILTER (WHERE status = 'Present') AS present_count
            FROM attendance GROUP BY class_id, student_id
        ) pres ON pres.class_id = s.class_id AND pres.student_id = s.student_id
        WHERE s.student_id = $1
        ORDER BY c.subject;
    `;
    try {
        const data = await db.query(query, [studentId]);
        const classes = data.rows.map(row => ({
            ...row,
            percentage: row.total_sessions > 0
                ? ((row.present_count / row.total_sessions) * 100).toFixed(2)
                : "0.00",
        }));
        res.status(200).json({ status: 'success', classes });
    } catch (err) {
        console.error(err);
        res.status(400).json({ status: 'error' });
    }
};

const getClassDetails = async (req, res) => {
    const { classId } = req.body;
    const studentId = req.user.email;
    try {
        const enrollment = await db.query(
            `SELECT s.name, s.roll_no, c.subject, c.section, c.students
             FROM students s JOIN classes c ON c.class_id = s.class_id
             WHERE s.student_id = $1 AND s.class_id = $2`,
            [studentId, classId]
        );
        if (enrollment.rowCount === 0) {
            return res.status(403).json({ status: 'error', message: 'Not enrolled in this class' });
        }
        const info = enrollment.rows[0];

        const sessionsData = await db.query(
            'SELECT COUNT(DISTINCT date) AS total_sessions FROM attendance WHERE class_id = $1',
            [classId]
        );
        const totalSessions = parseInt(sessionsData.rows[0].total_sessions) || 0;

        const historyData = await db.query(
            'SELECT date, status FROM attendance WHERE student_id = $1 AND class_id = $2 ORDER BY date DESC',
            [studentId, classId]
        );
        const presentCount = historyData.rows.filter(r => r.status === 'Present').length;
        const percentage = totalSessions > 0 ? ((presentCount / totalSessions) * 100).toFixed(2) : "0.00";

        res.status(200).json({
            status: 'success',
            class: { class_id: classId, subject: info.subject, section: info.section, students: info.students },
            student: { student_id: studentId, name: info.name, roll_no: info.roll_no },
            stats: { total_sessions: totalSessions, present_count: presentCount, percentage },
            recent_attendance: historyData.rows,
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ status: 'error' });
    }
};

export { fetchClassesList, getClassDetails };
