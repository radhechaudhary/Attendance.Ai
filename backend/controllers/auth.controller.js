import jsonwebtoken from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const auth = (req, res) => {
    const token = req.cookies.authToken;
    const secretKey = process.env.SECRET_KEY;
    console.log(token);
    console.log("-----------------------");

    if (!token) return res.status(403).json({
        msg: "No token present"
    });
    try {
        const decoded = jsonwebtoken.verify(token, secretKey);
        const role = decoded.role || 'teacher';
        res.status(200).json({
            role,
            name: decoded.name,
            email: decoded.email,
            collegeName: role === 'teacher' ? decoded.collegeName : undefined,
        });
    } catch (err) {
        console.log(err);
        res.json({ status: 'error' }).status(400);
    }
};

export { auth };