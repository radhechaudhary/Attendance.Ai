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
        // console.log(decoded)
        res.json({ name: decoded.name, collegeName: decoded.collegeName, email: decoded.emails }).status(200);
    } catch (err) {
        console.log(err);
        res.json({ status: 'error' }).status(400);
    }
};

export { auth };