import express from "express"
import { protectRoute } from "../middleware/auth"
import {
  createStory,
  getStories,
} from "../modules/story/controller/story.controller"

const router = express.Router()

router.post("/", protectRoute, createStory)
router.get("/", protectRoute, getStories)

export default router
