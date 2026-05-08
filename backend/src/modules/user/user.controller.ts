import type { NextFunction, Response } from "express"
import type { AuthRequest } from "../../middleware/auth"
import { ApiResponse } from "../../utils/ApiResponse"
import { UpdateUserDto } from "./user.dto"
import { IUserService } from "./user.interface"
import { UserService } from "./user.service"

export class UserController {
  private userService: IUserService

  constructor(userService: IUserService = new UserService()) {
    this.userService = userService
  }

  searchUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { q } = req.query
      if (!q || typeof q !== "string") {
        return res.status(400).json(ApiResponse.error("Missing search query"))
      }
      const users = await this.userService.searchUsers(q)
      res.json(ApiResponse.success(users))
    } catch (error) {
      next(error)
    }
  }

  getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const users = await this.userService.getUsers(req.userId)
      res.json(ApiResponse.success(users))
    } catch (error) {
      next(error)
    }
  }

  updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const dto = new UpdateUserDto(req.body)
      const user = await this.userService.updateProfile(req.userId!, dto)
      res.json(ApiResponse.success(user))
    } catch (error: any) {
      const status = error.message === "User not found" ? 404 : 400
      res.status(status).json(ApiResponse.error(error.message))
    }
  }

  checkUsername = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { username } = req.params
      const available = await this.userService.checkUsername(username as string, req.userId)
      res.json(ApiResponse.success({ available }))
    } catch (error) {
      next(error)
    }
  }

  updatePublicKey = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { publicKey } = req.body
      if (!publicKey) {
        return res.status(400).json(ApiResponse.error("Missing publicKey"))
      }
      const dto = new UpdateUserDto({ publicKey })
      const user = await this.userService.updateProfile(req.userId!, dto)
      res.json(ApiResponse.success(user))
    } catch (error: any) {
      const status = error.message === "User not found" ? 404 : 400
      res.status(status).json(ApiResponse.error(error.message))
    }
  }

  getUserById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params
      const user = await this.userService.getUserById(userId as string)
      res.json(ApiResponse.success(user))
    } catch (error: any) {
      const status = error.message === "User not found" ? 404 : 500
      res.status(status).json(ApiResponse.error(error.message))
    }
  }
}
