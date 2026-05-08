import type { NextFunction, Response } from "express"
import type { AuthRequest } from "../../middleware/auth"
import { ApiResponse } from "../../utils/ApiResponse"
import { CreateStoryDto } from "./story.dto"
import { IStoryService } from "./story.interface"
import { StoryService } from "./story.service"

export class StoryController {
  private storyService: IStoryService

  constructor(storyService: IStoryService = new StoryService()) {
    this.storyService = storyService
  }

  createStory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const dto = new CreateStoryDto(req.body)
      const result = await this.storyService.createStory(req.userId!, dto)
      res.status(201).json(ApiResponse.success(result))
    } catch (error: any) {
      res.status(400).json(ApiResponse.error(error.message))
    }
  }

  getStories = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const targetUserId = req.query.userId as string | undefined
      const result = await this.storyService.getStories(targetUserId)
      res.json(ApiResponse.success(result))
    } catch (error: any) {
      res.status(500)
      next(error)
    }
  }

  getArchivedStories = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.storyService.getArchivedStories(req.userId!)
      res.json(ApiResponse.success(result))
    } catch (error: any) {
      res.status(500)
      next(error)
    }
  }
}
