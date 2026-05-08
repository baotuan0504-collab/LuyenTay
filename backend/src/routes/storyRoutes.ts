import express from "express"
import { protectRoute } from "../middleware/auth"
import { StoryController } from "../modules/story/story.controller"

const router = express.Router()
const storyController = new StoryController()

router.post("/", protectRoute, storyController.createStory)
router.get("/", protectRoute, storyController.getStories)
router.get("/archived", protectRoute, storyController.getArchivedStories)

export default router
