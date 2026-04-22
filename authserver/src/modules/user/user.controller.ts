import { Response } from "express"
import { AuthRequest } from "../../middleware/auth"
import { UpdateProfileDto } from "./user.dto"
import { UserService } from "./user.service"

const userService = new UserService()

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const result = await userService.getAllExcept(req.userId!)
    res.json(result)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const dto = new UpdateProfileDto(req.body)
    const result = await userService.updateProfile(req.userId!, dto)
    res.json(result)
  } catch (error: any) {
    const status = error.message === "User not found" ? 404 : 500
    res.status(status).json({ message: error.message })
  }
}

export const checkUsername = async (req: AuthRequest, res: Response) => {
  try {
    const { username } = req.params
    const available = await userService.checkUsernameAvailability(
      username,
      req.userId,
    )
    res.json({ available })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params
    const result = await userService.findById(userId)
    res.json(result)
  } catch (error: any) {
    const status = error.message === "User not found" ? 404 : 500
    res.status(status).json({ message: error.message })
  }
}

export const searchUsers = async (req: AuthRequest, res: Response) => {
  try {
    const q = (req.query.q as string) || ""
    const result = await userService.searchUsers(q, req.userId!)
    res.json(result)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
