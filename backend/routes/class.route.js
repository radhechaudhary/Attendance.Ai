import { Router } from "express";
import { addClass, fetchClassesList } from '../controllers/class.controller.js';
import verifyTokenMiddleware from "../middleware/verifyToken.middleware.js";

const router = Router();

router.post('/addClass', verifyTokenMiddleware, addClass)

router.get('/fetchClassesList', verifyTokenMiddleware, fetchClassesList)

export default router;