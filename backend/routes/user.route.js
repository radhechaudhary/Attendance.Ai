import { Router } from "express";
import { signup } from "../controllers/signup.controller.js";
import { login } from "../controllers/login.controller.js";
import { auth } from "../controllers/auth.controller.js";
import { joinClass } from "../controllers/join_class.controller.js";
import upload from "../middleware/multer.middleware.js";

const router = Router();


router.post('/teacher-signup', signup);
router.post('/teacher-login', login);
router.post('/auth', auth);
router.post('/join_class', upload.single("image"), joinClass)

export default router;