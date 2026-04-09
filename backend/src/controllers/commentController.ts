import type { Request, Response } from "express"
import type { AuthRequest } from "../middleware/auth"
import CommentService from "../services/comment.service"


export default class CommentController {
  // Tạo comment cha
  static async createComment(req: AuthRequest, res: Response) {
    try {
      const { targetId, targetType, content } = req.body
      const user = req.userId || String(req.body.user || "")
      if (!user) {
        return res.status(400).json({ error: "User is required" })
      }
      const comment = await CommentService.createComment({
        user,
        targetId,
        targetType,
        content,
      })
      res.status(201).json(comment)
    } catch (err: any) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) })
    }
  }


  // Reply comment
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
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) })
    }
  }


  // Update comment
  static async updateComment(req: AuthRequest, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      if (!id) {
        return res.status(400).json({ error: "Comment id is required" })
      }
      const { content } = req.body
      const updated = await CommentService.updateComment(id, content)
      if (!updated) return res.status(404).json({ error: "Comment not found" })
      res.json(updated)
    } catch (err: any) {
      res.status(500).json({ error: err.message })
    }
  }


  // Delete comment
  static async deleteComment(req: AuthRequest, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      if (!id) {
        return res.status(400).json({ error: "Comment id is required" })
      }
      const deleted = await CommentService.deleteComment(id)
      if (!deleted) return res.status(404).json({ error: "Comment not found" })
      res.json({ success: true })
    } catch (err: any) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) })
    }
  }


  // Lấy danh sách comment cha (simple)
  static async getParentComments(req: Request, res: Response) {
    try {
      const { targetId, targetType } = req.query
      const comments = await CommentService.getParentComments({
        targetId: String(targetId),
        targetType: String(targetType),
      })
      res.json(comments)
    } catch (err: any) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) })
    }
  }


  // Lấy reply comment cho 1 comment cha
  static async getReplies(req: Request, res: Response) {
    try {
      const { parentComment } = req.query
      const replies = await CommentService.getReplies(String(parentComment))
      res.json(replies)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      res.status(500).json({ error: message })
    }
  }


  // Lấy danh sách comment dạng nested (aggregate)
  static async getNestedComments(req: Request, res: Response) {
    try {
      const { targetId, targetType } = req.query
      const comments = await CommentService.getNestedComments({
        targetId: String(targetId),
        targetType: String(targetType),
      })
      res.json(comments)
    } catch (err: any) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) })
    }
  }
}



