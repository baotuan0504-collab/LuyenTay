import { Router } from "express"
import { protectRoute } from "../middleware/auth"
import CommentController from "../modules/comment/controller/comment.controller"

const router = Router()

// Tạo comment cha
router.post("/", protectRoute, CommentController.createComment)
// Reply comment
router.post("/reply", protectRoute, CommentController.replyComment)
// Update comment
router.put("/:id", protectRoute, CommentController.updateComment)
// Delete comment
router.delete("/:id", protectRoute, CommentController.deleteComment)
// Lấy danh sách comment cha (simple)
router.get("/", CommentController.getParentComments)
// Lấy reply comment cho 1 comment cha
router.get("/replies", CommentController.getReplies)
// Lấy danh sách comment dạng nested (aggregate)
router.get("/nested", CommentController.getNestedComments)

export default router
