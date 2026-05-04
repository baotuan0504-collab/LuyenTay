import type { Response } from "express"
import type { AuthRequest } from "../../../middleware/auth"
import CommentService from "../service/comment.service"
import { Post } from "../../post/model/post.model"
import { Comment } from "../model/comment.model"
import { Notification } from "../../notification/model/notification.model"
import { getIO } from "../../../utils/socket"

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

      // Emit Notification
      let recipientId;
      if (targetType === "post" || targetType === "POST") {
        const post = await Post.findById(targetId);
        if (post) recipientId = post.user;
      } else if (targetType === "comment" || targetType === "COMMENT") {
        const parentCom = await Comment.findById(targetId);
        if (parentCom) recipientId = parentCom.user;
      }

      if (recipientId && recipientId.toString() !== user) {
        const notification = new Notification({
          recipient: recipientId,
          sender: user,
          type: "COMMENT",
          referenceId: comment._id,
          referenceType: "COMMENT",
        });
        await notification.save();
        await notification.populate("sender", "name username avatar");

        try {
          const io = getIO();
          io.to(`user:${recipientId.toString()}`).emit("new-notification", notification);
        } catch (e) {
          console.error("Socket emit failed", e);
        }
      }

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

      // Emit Notification
      let recipientId;
      const parentCom = await Comment.findById(parentComment);
      if (parentCom) recipientId = parentCom.user;

      if (recipientId && recipientId.toString() !== user) {
        const notification = new Notification({
          recipient: recipientId,
          sender: user,
          type: "COMMENT",
          referenceId: comment._id,
          referenceType: "COMMENT",
        });
        await notification.save();
        await notification.populate("sender", "name username avatar");

        try {
          const io = getIO();
          io.to(`user:${recipientId.toString()}`).emit("new-notification", notification);
        } catch (e) {
          console.error("Socket emit failed", e);
        }
      }

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

  static async deleteComment(req: AuthRequest, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      if (!id) {
        return res.status(400).json({ error: "Comment id is required" })
      }
      const deleted = await CommentService.deleteComment(id)
      if (!deleted) {
        return res.status(404).json({ error: "Comment not found" })
      }
      res.status(200).json({ success: true })
    } catch (err: any) {
      res
        .status(500)
        .json({ error: err instanceof Error ? err.message : String(err) })
    }
  }

  static async getParentComments(req: AuthRequest, res: Response) {
    try {
      const { targetId, targetType, skip = 0, limit = 20 } = req.query
      if (!targetId || !targetType) {
        return res
          .status(400)
          .json({ error: "targetId and targetType are required" })
      }
      const comments = await CommentService.getParentComments({
        targetId: String(targetId),
        targetType: String(targetType),
        skip: Number(skip),
        limit: Number(limit),
      })
      res.json(comments)
    } catch (err: any) {
      res
        .status(500)
        .json({ error: err instanceof Error ? err.message : String(err) })
    }
  }

  static async getReplies(req: AuthRequest, res: Response) {
    try {
      const { parentComment } = req.query
      if (!parentComment) {
        return res.status(400).json({ error: "parentComment is required" })
      }
      const replies = await CommentService.getReplies(String(parentComment))
      res.json(replies)
    } catch (err: any) {
      res
        .status(500)
        .json({ error: err instanceof Error ? err.message : String(err) })
    }
  }

  static async getNestedComments(req: AuthRequest, res: Response) {
    try {
      const { targetId, targetType } = req.query
      if (!targetId || !targetType) {
        return res
          .status(400)
          .json({ error: "targetId and targetType are required" })
      }
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
