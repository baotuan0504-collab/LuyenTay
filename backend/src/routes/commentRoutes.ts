import { Router } from "express"
import { protectRoute } from "../middleware/auth"
import { CommentController } from "../modules/comment/comment.controller"

const router = Router()
const commentController = new CommentController()

// Tạo comment cha hoặc reply (parentId trong body)
router.post("/", protectRoute, commentController.createComment)
// Update comment
router.put("/:id", protectRoute, commentController.updateComment)
// Delete comment
router.delete("/:id", protectRoute, commentController.deleteComment)
// Lấy danh sách comment cha (có phân trang)
router.get("/", commentController.getComments)
// Lấy reply cho 1 comment cha
router.get("/:id/replies", commentController.getReplies)
// Lấy danh sách comment dạng nested (aggregate)
router.get("/nested", commentController.getNestedComments)

export default router
