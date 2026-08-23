import db from "../database/attendance.db.js";

const addRoomTeacher = async (req, res) => {
    const { room_id, camera_password, room_name } = req.body;
    try {
        const result = await db.query(
            `select camera_password from rooms where room_id = $1`,
            [room_id]
        );
        if (result.rows.length === 0) {
            return res.status(400).json({ status: 'error', message: 'Room not found' });
        }
        if (camera_password !== result.rows[0].camera_password) {
            return res.status(400).json({ status: 'error', message: 'Incorrect password' });
        }

        await db.query(
            `insert into room_access (teacher_id, room_id, room_name) values ($1, $2, $3)
             on conflict (teacher_id, room_id) do update set room_name = excluded.room_name`,
            [req.user.email, room_id, room_name]
        );
        res.status(200).json({ status: 'success' });

    }
    catch (err) {
        console.log(err);
        res.status(400).json({ status: 'error' });
    }
}

const fetchRoomsListTeacher = async (req, res) => {
    try {
        const data = await db.query(
            'SELECT room_id, room_name FROM room_access WHERE teacher_id = $1',
            [req.user.email]
        );
        res.status(200).json({ status: 'success', rooms: data.rows });
    }
    catch (err) {
        console.log(err);
        res.status(400).json({ status: 'error' });
    }
}

const deleteRoomTeacher = async (req, res) => {
    const { roomId } = req.body;
    try {
        await db.query('DELETE FROM room_access WHERE room_id = $1 AND teacher_id = $2', [roomId, req.user.email]);
        res.status(200).json({ status: 'success' });
    }
    catch (err) {
        console.log(err);
        res.status(400).json({ status: 'error' });
    }
}

export { addRoomTeacher, fetchRoomsListTeacher, deleteRoomTeacher };
