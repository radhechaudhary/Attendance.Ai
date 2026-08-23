import { Router } from "express";
import { addRoomTeacher, fetchRoomsListTeacher, deleteRoomTeacher } from "../controllers/room.controller.js";
import verifyTokenMiddleware from "../middleware/verifyToken.middleware.js";
import requireRole from "../middleware/requireRole.middleware.js";

const router = Router();

router.use(verifyTokenMiddleware, requireRole('teacher'));

router.post('/addRoomTeacher', addRoomTeacher)

router.get('/fetchRoomsListTeacher', fetchRoomsListTeacher)

router.post('/deleteRoomTeacher', deleteRoomTeacher)

export default router;
