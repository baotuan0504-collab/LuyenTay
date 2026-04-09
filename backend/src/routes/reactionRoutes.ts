import express from "express";
import {
    getMyReaction,
    getReactionCounts,
    removeReaction,
    upsertReaction,
} from "../controllers/reactionController";

import { protectRoute } from "../middleware/auth";

const router = express.Router();

//tha or update reaction
router.post("/", protectRoute, upsertReaction);

//bo  reaction
router.delete("/", protectRoute, removeReaction);

//dem reaction theo type
router.get("/counts", getReactionCounts);

//lay reaction cua user
router.get("/my", protectRoute, getMyReaction);

export default router;