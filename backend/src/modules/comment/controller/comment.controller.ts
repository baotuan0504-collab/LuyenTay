import type { Response } from "express"
import type { AuthRequest } from "../../../middleware/auth"
import CommentService from "../service/comment.service"

export default class CommentController {
  static async createComment(req: AuthRequest, res: Response) {
    try {
      const { targetId, targetType, content, parentId } = req.body
      const user = req.userId || String(req.body.user || "")
      if (!user) {
        return res.status(400).json({ error: "User is required" })
      }
      const comment = await CommentService.createComment({
        user,
        targetId,
        targetType,
        content,
        parentId,
      })
      res.status(201).json(comment)
    } catch (err: any) {
      res
        .status(500)
        .json({ error: err instanceof Error ? err.message : String(err) })
    }
  }

  static async replyComment(req: AuthRequest, res: Response) {
    try {
      const { targetId, targetType, parentComment, content } = req.body
      const user = req.userId || String(req.body.user || "")
      if (!user) {
        return res.status(400).json({ error: "User is required" })
      }
      const comment = await CommentService.replyComment({
        user,
        targetId,
        targetType,
        parentComment,
        content,
      })
      res.status(201).json(comment)
    } catch (err: any) {
      res
        .status(500)
        .json({ error: err instanceof Error ? err.message : String(err) })
    }
  }

  static async updateComment(req: AuthRequest, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      if (!id) {
        return res.status(400).json({ error: "Comment id is required" })
      }
      const { content } = req.body
      const updated = await CommentService.updateComment(id, content)
      res.status(200).json(updated)
    } catch (err: any) {
      res
        .status(500)
        .json({ error: err instanceof Error ? err.message : String(err) })
    }
  }

  // ... (other methods can be moved similarly)
}
