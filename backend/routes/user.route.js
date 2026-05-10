import { Router } from "express";
import { signup } from "../controllers/signup.controller.js";
import { login } from "../controllers/login.controller.js";
import { auth } from "../controllers/auth.controller.js";

const router = Router();


router.post('/teacher-signup', signup);
router.post('/teacher-login', login);
router.post('/auth', auth);

export default router;