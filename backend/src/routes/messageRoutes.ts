import { Router } from "express";
import { getMessages, sendMessage } from "../controllers/messageController";
import { protectRoute } from "../middleware/auth";

const router = Router();

router.get("/chat/:chatId", protectRoute, getMessages);
router.post("/chat/:chatId", protectRoute, sendMessage);
export default router;
