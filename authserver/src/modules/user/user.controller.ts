import { Request, Response } from "express"
import { AuthRequest } from "../../middleware/auth"
import { ApiResponse } from "../../utils/ApiResponse"
import { UpdateProfileDto } from "./user.dto"
import { IUserService } from "./user.interface"
import { UserService } from "./user.service"

export class UserController {
  private userService: IUserService

  constructor(userService: IUserService = new UserService()) {
    this.userService = userService
  }

  getUsers = async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthRequest
      const result = await this.userService.getAllExcept(authReq.userId!)
      res.json(ApiResponse.success(result))
    } catch (error: any) {
      res.status(500).json(ApiResponse.error(error.message))
    }
  }

  updateProfile = async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthRequest
      const dto = new UpdateProfileDto(authReq.body)
      const result = await this.userService.updateProfile(authReq.userId!, dto)
      res.json(ApiResponse.success(result))
    } catch (error: any) {
      const status = error.message === "User not found" ? 404 : 500
      res.status(status).json(ApiResponse.error(error.message))
    }
  }

  checkUsername = async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthRequest
      const usernameParam = authReq.params.username
      if (typeof usernameParam !== "string") {
        return res.status(400).json(ApiResponse.error("Invalid username"))
      }
      const available = await this.userService.checkUsernameAvailability(
        usernameParam,
        authReq.userId,
      )

      res.json(ApiResponse.success({ available }))
    } catch (error: any) {
      res.status(500).json(ApiResponse.error(error.message))
    }
  }

  getUserById = async (req: Request, res: Response) => {
    try {
      const userIdParam = req.params.userId
      if (typeof userIdParam !== "string") {
        return res.status(400).json(ApiResponse.error("Invalid userId"))
      }

      const result = await this.userService.findById(userIdParam)
      res.json(ApiResponse.success(result))
    } catch (error: any) {
      const status = error.message === "User not found" ? 404 : 500
      res.status(status).json(ApiResponse.error(error.message))
    }
  }

  searchUsers = async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthRequest
      const q = (authReq.query.q as string) || ""
      const result = await this.userService.searchUsers(q, authReq.userId!)
      res.json(ApiResponse.success(result))
    } catch (error: any) {
      res.status(500).json(ApiResponse.error(error.message))
    }
  }
}