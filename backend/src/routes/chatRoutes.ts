import { Router } from "express"
import { protectRoute } from "../middleware/auth"
import { ChatController } from "../modules/chat/controller/chat.controller"

const router = Router()

router.use(protectRoute)

router.get("/", ChatController.getChatsByUser)
// If you have a getOrCreateChat method in the new ChatController, map it here:
// router.post("/with/:participantId", ChatController.getOrCreateChat);

export default router
