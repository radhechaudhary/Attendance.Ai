import db from "../database/attendance.db.js";
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();


const login = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    try {

        const query = `SELECT * FROM teachers WHERE mail = $1`;
        const values = [email];
        const result = await db.query(query, values);

        if (result.rows.length === 0) {
            res.json({ status: 'error' }).status(400);
        }

        const user = result.rows[0];
        const hashedPassword = user.password;
        const isPasswordValid = await bcrypt.compare(password, hashedPassword);

        if (!isPasswordValid) {
            res.json({ status: 'error' }).status(400);
        }

        const token = jsonwebtoken.sign({ email, name: user.name, collegeName }, process.env.SECRET_KEY)
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: true,    // true only for HTTPS
            sameSite: 'none', // 👈 allows cross-site cookies
            path: '/',
        });
        res.json({ name: user.name, collegeName: user.collegeName, email, status: 'success' }).status(200);
    }
    catch (err) {
        console.log(err);
        res.json({ status: 'error' }).status(400);
    }
}

export { login }