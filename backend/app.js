import express from "express";
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();
app.use(cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true                // allow cookies
}));
app.use(cookieParser());
app.use(express.json());

import userRouter from './routes/user.route.js';

app.use('/user', userRouter);

import classRoute from './routes/class.route.js';
app.use('/classes', classRoute)

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});