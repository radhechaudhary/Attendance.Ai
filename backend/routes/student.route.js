import { Router } from "express";
import { fetchClassesList, getClassDetails } from "../controllers/student.controller.js";
import verifyTokenMiddleware from "../middleware/verifyToken.middleware.js";
import requireRole from "../middleware/requireRole.middleware.js";

const router = Router();

router.use(verifyTokenMiddleware, requireRole('student'));

router.get('/fetchClassesList', fetchClassesList)

router.post('/getClassDetails', getClassDetails)

export default router;
