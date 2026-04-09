import { Router } from "express"
import CommentController from "../controllers/commentController"


const router = Router()


// Tạo comment cha
router.post("/", /*authMiddleware,*/ CommentController.createComment)
// Reply comment
router.post("/reply", /*authMiddleware,*/ CommentController.replyComment)
// Update comment
router.put("/:id", /*authMiddleware,*/ CommentController.updateComment)
// Delete comment
router.delete("/:id", /*authMiddleware,*/ CommentController.deleteComment)
// Lấy danh sách comment cha (simple)
router.get("/", CommentController.getParentComments)
// Lấy reply comment cho 1 comment cha
router.get("/replies", CommentController.getReplies)
// Lấy danh sách comment dạng nested (aggregate)
router.get("/nested", CommentController.getNestedComments)


export default router



