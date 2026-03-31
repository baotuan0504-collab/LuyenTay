import express from "express";
import { createStory, getStories } from "../controllers/storyController";
import { protectRoute } from "../middleware/auth";

const router = express.Router();

router.post("/", protectRoute, createStory);
router.get("/", protectRoute, getStories);

export default router;