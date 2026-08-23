import { Router } from "express";
import { addClass, fetchClassesList, getStudents, markAttendance, photoAttendance, getClassStudentStats } from '../controllers/class.controller.js';
import verifyTokenMiddleware from "../middleware/verifyToken.middleware.js";
import requireRole from "../middleware/requireRole.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = Router();

router.use(verifyTokenMiddleware, requireRole('teacher'));

router.post('/addClass', addClass)

router.get('/fetchClassesList', fetchClassesList)

router.post('/getStudents', getStudents)

router.post('/photoAttendance', upload.array('photos', 15), photoAttendance)

router.post('/markAttendance', markAttendance)

router.post('/getClassStudentStats', getClassStudentStats)

export default router;