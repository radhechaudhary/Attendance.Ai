import { Router } from "express";
import { signup } from "../controllers/signup.controller.js";
import { login } from "../controllers/login.controller.js";
import { auth } from "../controllers/auth.controller.js";
import { studentSignup, studentLogin } from "../controllers/studentAuth.controller.js";
import { joinClass } from "../controllers/join_class.controller.js";
import upload from "../middleware/multer.middleware.js";
import verifyTokenMiddleware from "../middleware/verifyToken.middleware.js";
import requireRole from "../middleware/requireRole.middleware.js";
import logout from "../controllers/logout.controller.js";

const router = Router();


router.post('/teacher-signup', signup);
router.post('/teacher-login', login);
router.post('/student-signup', studentSignup);
router.post('/student-login', studentLogin);
router.post('/auth', auth);
router.post('/join_class', verifyTokenMiddleware, requireRole('student'), upload.fields([
    { name: 'left', maxCount: 1 },
    { name: 'right', maxCount: 1 },
    { name: 'centre', maxCount: 1 }
]), joinClass)

router.post('/logout', logout)

export default router;