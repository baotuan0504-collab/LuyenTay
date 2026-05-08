import express from "express"
import { protectRoute } from "../middleware/auth"
import { ReactionController } from "../modules/reaction/reaction.controller"

const router = express.Router()
const reactionController = new ReactionController()

router.post("/", protectRoute, reactionController.upsertReaction)
router.delete("/", protectRoute, reactionController.removeReaction)
router.get("/counts", reactionController.getReactionCounts)
router.get("/my", protectRoute, reactionController.getMyReaction)
router.get("/users", reactionController.getReactionUsers)

export default router
