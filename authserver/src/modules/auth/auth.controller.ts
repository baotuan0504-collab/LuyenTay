import { Request, Response } from "express"
import {
  LoginRequestDto,
  RegisterRequestDto,
  VerifyTokenRequestDto,
} from "./auth.dto"
import { AuthService } from "./auth.service"

const service = new AuthService()

export const login = async (req: Request, res: Response) => {
  try {
    const dto = new LoginRequestDto(req.body)
    const result = await service.login(dto)
    res.json(result)
  } catch (err: any) {
    res.status(401).json({ message: err.message })
  }
}

export const register = async (req: Request, res: Response) => {
  try {
    const dto = new RegisterRequestDto(req.body)
    const result = await service.register(dto)
    res.json(result)
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
}

export const verifyToken = async (req: Request, res: Response) => {
  try {
    const dto = new VerifyTokenRequestDto(req.body)
    const result = await service.verifyToken(dto)
    res.json(result)
  } catch (err: any) {
    res.status(401).json({ message: err.message })
  }
}
