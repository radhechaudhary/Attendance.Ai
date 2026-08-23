import db from "../database/attendance.db.js";
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();

const COOKIE_OPTS = {
    httpOnly: false,
    secure: false,    // true only for HTTPS
    sameSite: 'lax', // 👈 allows cross-site cookies
    path: '/',
};

const studentSignup = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            `INSERT INTO student_accounts (email, name, password) VALUES ($1, $2, $3)`,
            [email, name, hashedPassword]
        );

        const token = jsonwebtoken.sign({ email, name, role: 'student' }, process.env.SECRET_KEY)
        res.cookie('authToken', token, COOKIE_OPTS);
        res.status(200).json({ status: 'success', name, email, role: 'student' });
    }
    catch (err) {
        console.log(err);
        if (err.code === '23505') {
            return res.status(409).json({ status: 'error', message: 'Email already registered' });
        }
        res.status(400).json({ status: 'error' });
    }
}

const studentLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const query = `SELECT * FROM student_accounts WHERE email = $1`;
        const result = await db.query(query, [email]);

        if (result.rowCount === 0) {
            res.json({ status: 'error', message: 'User not found' });
            return;
        }

        const user = result.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            res.json({ status: 'error', message: 'Incorrect password' });
            return;
        }

        const token = jsonwebtoken.sign({ email, name: user.name, role: 'student' }, process.env.SECRET_KEY)
        res.cookie('authToken', token, COOKIE_OPTS);
        res.status(200).json({ status: 'success', name: user.name, email, role: 'student' });
    }
    catch (err) {
        console.log(err);
        res.status(400).json({ status: 'error' });
    }
}

export { studentSignup, studentLogin };
