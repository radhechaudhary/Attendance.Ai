import { Router } from "express";
import { signup } from "../controllers/signup.controller.js";
import { login } from "../controllers/login.controller.js";
import { auth } from "../controllers/auth.controller.js";
import { joinClass } from "../controllers/join_class.controller.js";
import upload from "../middleware/multer.middleware.js";
import logout from "../controllers/logout.controller.js";

const router = Router();


router.post('/teacher-signup', signup);
router.post('/teacher-login', login);
router.post('/auth', auth);
router.post('/join_class', upload.fields([
    { name: 'left', maxCount: 1 },
    { name: 'right', maxCount: 1 },
    { name: 'centre', maxCount: 1 }
]), joinClass)

router.post('/logout', logout)

export default router;