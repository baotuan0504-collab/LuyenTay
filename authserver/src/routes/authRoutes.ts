import { Router } from "express";
import { getMe, login, refreshToken, register } from "../controllers/authController";
import { protectRoute } from "../middleware/auth";

const router = Router();

router.get("/me", protectRoute, getMe);
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);

export default router;
