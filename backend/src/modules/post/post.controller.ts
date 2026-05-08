import type { NextFunction, Response } from "express"
import type { AuthRequest } from "../../middleware/auth"
import { ApiResponse } from "../../utils/ApiResponse"
import { CreatePostDto, UpdatePostDto } from "./post.dto"
import { IPostService } from "./post.interface"
import { PostService } from "./post.service"

export class PostController {
  private postService: IPostService

  constructor(postService: IPostService = new PostService()) {
    this.postService = postService
  }

  createPost = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const dto = new CreatePostDto(req.body)
      const result = await this.postService.createPost(req.userId!, dto)
      res.status(201).json(ApiResponse.success(result))
    } catch (error: any) {
      res.status(400)
      next(error)
    }
  }

  getPosts = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const targetUserId = req.query.userId as string | undefined
      const result = await this.postService.getPosts(req.userId!, targetUserId)
      res.json(ApiResponse.success(result))
    } catch (error: any) {
      res.status(500)
      next(error)
    }
  }

  getPostById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string
      const result = await this.postService.getPostById(id)
      res.json(ApiResponse.success(result))
    } catch (error: any) {
      const status = error.message === "Post not found" ? 404 : 500
      res.status(status).json(ApiResponse.error(error.message))
    }
  }

  updatePost = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string
      const dto = new UpdatePostDto(req.body)
      const result = await this.postService.updatePost(req.userId!, id, dto)
      res.json(ApiResponse.success(result))
    } catch (error: any) {
      const status = error.message.includes("Unauthorized") ? 403 :
        error.message === "Post not found" ? 404 : 400
      res.status(status).json(ApiResponse.error(error.message))
    }
  }

  deletePost = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string
      await this.postService.deletePost(req.userId!, id)
      res.json(ApiResponse.success({ message: "Post deleted successfully" }))
    } catch (error: any) {
      const status = error.message.includes("Unauthorized") ? 403 :
        error.message === "Post not found" ? 404 : 500
      res.status(status).json(ApiResponse.error(error.message))
    }
  }
}