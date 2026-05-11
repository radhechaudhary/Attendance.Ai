import db from "../database/attendance.db.js";
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();

const signup = async (req, res) => {
    const name = req.body.name;
    console.log(name)
    const email = req.body.email;
    const collegeName = req.body.collegeName;
    const password = req.body.password;
    try {
        console.log(name);
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);
        const query = `INSERT INTO teachers (name, mail, college_name, password) VALUES ($1, $2, $3, $4)`;
        const values = [name, email, collegeName, hashedPassword];

        await db.query(query, values);

        const token = jsonwebtoken.sign({ email, name, collegeName }, process.env.SECRET_KEY)
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: true,    // true only for HTTPS
            sameSite: 'none', // 👈 allows cross-site cookies
            path: '/',
        });
        res.json({ status: 'success' }).status(200);
    }
    catch (err) {
        console.log(err);
        res.json({ status: 'error' }).status(400);
    }
}

export { signup }