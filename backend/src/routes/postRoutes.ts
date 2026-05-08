import express from "express"
import { protectRoute } from "../middleware/auth"
import { PostController } from "../modules/post/post.controller"

const router = express.Router()
const postController = new PostController()

router.post("/", protectRoute, postController.createPost)
router.get("/", protectRoute, postController.getPosts)
router.get("/:id", protectRoute, postController.getPostById)
router.put("/:id", protectRoute, postController.updatePost)
router.delete("/:id", protectRoute, postController.deletePost)

export default router
