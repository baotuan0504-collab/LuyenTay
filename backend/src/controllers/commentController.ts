import type { Request, Response } from "express"
import type { AuthRequest } from "../middleware/auth"
import CommentService from "../services/comment.service"


export default class CommentController {
  // Tạo comment cha hoặc reply
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
      res
        .status(500)
        .json({ error: err instanceof Error ? err.message : String(err) })
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
      // Lấy comment để kiểm tra quyền
      const comment = await CommentService.getCommentById(id)
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" })
      }
      // Nếu là chủ bình luận hoặc chủ bài post mới được xóa
      const userId = req.userId
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" })
      }
      // Nếu là chủ bình luận
      const isCommentOwner = comment.user.toString() === userId
      let isPostOwner = false
      if (comment.targetType === "post") {
        // Lấy post để kiểm tra chủ post
        const post = await CommentService.getPostById(
          comment.targetId.toString(),
        )
        if (post && post.user.toString() === userId) {
          isPostOwner = true
        }
      }
      if (!isCommentOwner && !isPostOwner) {
        return res
          .status(403)
          .json({ error: "Bạn không có quyền xóa bình luận này" })
      }
      const deleted = await CommentService.deleteComment(id)
      if (!deleted) return res.status(404).json({ error: "Comment not found" })
      res.json({ success: true })
    } catch (err: any) {
      res
        .status(500)
        .json({ error: err instanceof Error ? err.message : String(err) })
    }
  }


  // Lấy danh sách comment cha (simple)
  static async getParentComments(req: Request, res: Response) {
    try {
      const { targetId, targetType, page = 1, limit = 20 } = req.query
      const pageNum = parseInt(String(page), 10)
      const limitNum = parseInt(String(limit), 10)
      const skip = (pageNum - 1) * limitNum


      const comments = await CommentService.getParentComments({
        targetId: String(targetId),
        targetType: String(targetType),
        skip,
        limit: limitNum,
      })


      // Đếm tổng số comment để tính hasMore
      const totalComments = await CommentService.countParentComments({
        targetId: String(targetId),
        targetType: String(targetType),
      })


      res.json({
        comments,
        hasMore: skip + comments.length < totalComments,
        total: totalComments,
        page: pageNum,
        limit: limitNum,
      })
    } catch (err: any) {
      res
        .status(500)
        .json({ error: err instanceof Error ? err.message : String(err) })
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
      res
        .status(500)
        .json({ error: err instanceof Error ? err.message : String(err) })
    }
  }
}



