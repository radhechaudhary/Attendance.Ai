import { Router } from "express";
import { addClass, fetchClassesList, getStudents, markAttendance, photoAttendance } from '../controllers/class.controller.js';
import verifyTokenMiddleware from "../middleware/verifyToken.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = Router();

router.post('/addClass', verifyTokenMiddleware, addClass)

router.get('/fetchClassesList', verifyTokenMiddleware, fetchClassesList)

router.post('/getStudents', verifyTokenMiddleware, getStudents)

router.post('/photoAttendance', verifyTokenMiddleware, upload.array('photos', 15), photoAttendance)

router.post('/markAttendance', verifyTokenMiddleware, markAttendance)

export default router;