import type { NextFunction, Response } from "express"
import type { AuthRequest } from "../../middleware/auth"
import { ApiResponse } from "../../utils/ApiResponse"
import { UpsertReactionDto } from "./reaction.dto"
import { IReactionService } from "./reaction.interface"
import { ReactionService } from "./reaction.service"

export class ReactionController {
  private reactionService: IReactionService

  constructor(reactionService: IReactionService = new ReactionService()) {
    this.reactionService = reactionService
  }

  getMyReaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { targetId, targetType } = req.query
      if (!targetId || !targetType) {
        return res.status(400).json(ApiResponse.error("targetId and targetType are required"))
      }
      const result = await this.reactionService.getMyReaction(req.userId!, targetId as string, targetType as string)
      res.json(ApiResponse.success(result))
    } catch (error) {
      next(error)
    }
  }

  getReactionCounts = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { targetId, targetType } = req.query
      if (!targetId || !targetType) {
        return res.status(400).json(ApiResponse.error("targetId and targetType are required"))
      }
      const result = await this.reactionService.getReactionCounts(targetId as string, targetType as string)
      res.json(ApiResponse.success(result))
    } catch (error) {
      next(error)
    }
  }

  getReactionUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { targetId, targetType, reactionType } = req.query
      if (!targetId || !targetType) {
        return res.status(400).json(ApiResponse.error("targetId and targetType are required"))
      }
      const result = await this.reactionService.getReactionUsers(
        targetId as string,
        targetType as string,
        reactionType as string | undefined
      )
      res.json(ApiResponse.success(result))
    } catch (error) {
      next(error)
    }
  }

  upsertReaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const dto = new UpsertReactionDto(req.body)
      const result = await this.reactionService.upsertReaction(req.userId!, dto)
      res.json(ApiResponse.success(result))
    } catch (error) {
      next(error)
    }
  }

  removeReaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const targetId = (req.query.targetId || req.body.targetId) as string
      const targetType = (req.query.targetType || req.body.targetType) as string

      if (!targetId || !targetType) {
        return res.status(400).json(ApiResponse.error("targetId and targetType are required"))
      }

      await this.reactionService.removeReaction(req.userId!, targetId, targetType)
      res.json(ApiResponse.success({ message: "Reaction removed" }))
    } catch (error) {
      next(error)
    }
  }
}
