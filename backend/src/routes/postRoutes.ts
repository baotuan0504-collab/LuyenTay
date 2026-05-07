import express from "express"
import { protectRoute } from "../middleware/auth"
import {
  createPost,
  getPostById,
  getPosts,
  updatePost,
  deletePost,
} from "../modules/post/controller/post.controller"

const router = express.Router()

router.post("/", protectRoute, createPost)
router.get("/:id", protectRoute, getPostById)
router.get("/", protectRoute, getPosts)
router.put("/:id", protectRoute, updatePost)
router.delete("/:id", protectRoute, deletePost)

export default router
