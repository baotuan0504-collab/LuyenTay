import { Router } from "express"
import { protectRoute } from "../middleware/auth"
import { ChatController } from "../modules/chat/controller/chat.controller"

const router = Router()

console.log("[DEBUG] ChatRoutes loaded")

router.get("/", protectRoute, ChatController.getChatsByUser)
router.get("/:chatId", protectRoute, ChatController.getChatById)
router.post("/with/:participantId", protectRoute, ChatController.getOrCreateChat)

export default router
