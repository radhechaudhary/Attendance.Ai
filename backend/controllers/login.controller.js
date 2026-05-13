import db from "../database/attendance.db.js";
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();


const login = async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password)
    try {

        const query = `SELECT * FROM teachers WHERE mail = $1`;
        const values = [email];
        let result = [];
        try {
            result = await db.query(query, values);
        }
        catch (err) {
            console.log(err);
        }
        if (result.rowCount === 0) {
            res.json({ status: 'error', message: "User not found" });
            return;
        }

        const user = result.rows[0];
        // console.log(result.rows)
        const hashedPassword = user.password;
        const isPasswordValid = await bcrypt.compare(password, hashedPassword);

        if (!isPasswordValid) {
            res.json({ status: 'error', message: 'Incorrect password' });
            return;
        }

        const token = jsonwebtoken.sign({ email, name: user.name, collegeName: user.college_name }, process.env.SECRET_KEY)
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: true,    // true only for HTTPS
            sameSite: 'none', // 👈 allows cross-site cookies
            path: '/',
        });
        res.status(200).json({ name: user.name, collegeName: user.collegeName, email, status: 'success' });
    }
    catch (err) {
        console.log(err);
        res.status(400).json({ status: 'error' });
    }
}

export { login }