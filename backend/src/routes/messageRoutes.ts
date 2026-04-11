import { Router } from "express"
import { protectRoute } from "../middleware/auth"
import { MessageController } from "../modules/message/controller/message.controller"

const router = Router()

router.get("/chat/:chatId", protectRoute, MessageController.getMessages)
router.post("/chat/:chatId", protectRoute, MessageController.sendMessage)
export default router
