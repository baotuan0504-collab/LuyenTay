import express from "express"
import { protectRoute } from "../middleware/auth"
import {
  createStory,
  getStories,
  getArchivedStories,
} from "../modules/story/controller/story.controller"

const router = express.Router()

router.post("/", protectRoute, createStory)
router.get("/archive", protectRoute, getArchivedStories)
router.get("/", protectRoute, getStories)

export default router
