import type { NextFunction, Response } from "express"
import type { AuthRequest } from "../../middleware/auth"
import { ApiResponse } from "../../utils/ApiResponse"
import { CreateCommentDto, UpdateCommentDto } from "./comment.dto"
import { ICommentService } from "./comment.interface"
import { CommentService } from "./comment.service"

export class CommentController {
  private commentService: ICommentService

  constructor(commentService: ICommentService = new CommentService()) {
    this.commentService = commentService
  }

  createComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const dto = new CreateCommentDto(req.body)
      const result = await this.commentService.createComment(req.userId!, dto)
      res.status(201).json(ApiResponse.success(result))
    } catch (error) {
      next(error)
    }
  }

  updateComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string
      const dto = new UpdateCommentDto(req.body)
      const result = await this.commentService.updateComment(id, dto)
      res.json(ApiResponse.success(result))
    } catch (error: any) {
      const status = error.message === "Comment not found" ? 404 : 400
      res.status(status).json(ApiResponse.error(error.message))
    }
  }

  deleteComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string
      const success = await this.commentService.deleteComment(id)
      if (!success) {
        return res.status(404).json(ApiResponse.error("Comment not found"))
      }
      res.json(ApiResponse.success({ message: "Comment deleted successfully" }))
    } catch (error) {
      next(error)
    }
  }

  getComments = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { targetId, targetType } = req.query
      if (!targetId || !targetType) {
        return res.status(400).json(ApiResponse.error("targetId and targetType are required"))
      }

      // Luôn trả về nested comments để hiển thị đủ cấp 2, 3
      const comments = await this.commentService.getNestedComments(targetId as string, targetType as string)
      
      // Trả về trực tiếp array để tương thích với Frontend cũ
      res.json(comments)
    } catch (error) {
      next(error)
    }
  }

  getReplies = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string
      const result = await this.commentService.getReplies(id)
      res.json(ApiResponse.success(result))
    } catch (error) {
      next(error)
    }
  }

  getNestedComments = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { targetId, targetType } = req.query
      if (!targetId || !targetType) {
        return res.status(400).json(ApiResponse.error("targetId and targetType are required"))
      }
      const result = await this.commentService.getNestedComments(targetId as string, targetType as string)
      res.json(ApiResponse.success(result))
    } catch (error) {
      next(error)
    }
  }
}
