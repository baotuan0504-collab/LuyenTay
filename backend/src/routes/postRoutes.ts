import express from "express"
import { protectRoute } from "../middleware/auth"
import {
  createPost,
  getPostById,
  getPosts,
} from "../modules/post/controller/post.controller"

const router = express.Router()

router.post("/", protectRoute, createPost)
router.get("/:id", protectRoute, getPostById)
router.get("/", protectRoute, getPosts)

export default router
