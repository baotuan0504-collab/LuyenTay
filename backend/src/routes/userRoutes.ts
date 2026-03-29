import { Router } from "express";
import { checkUsername, getUserById, getUsers, updateProfile } from "../controllers/userController";
import { protectRoute } from "../middleware/auth";

const router = Router();

router.get("/", protectRoute, getUsers);
router.get("/check-username/:username", protectRoute, checkUsername);
router.put("/profile", protectRoute, updateProfile);
router.get("/:userId", protectRoute, getUserById);


export default router;
