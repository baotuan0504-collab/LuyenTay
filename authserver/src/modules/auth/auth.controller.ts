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

// Multi-step registration controller
export const register = async (req: Request, res: Response) => {
  try {
    const { step } = req.body
    if (step === 1) {
      // Step 1: Save basic info to session or temp storage (simulate for now)
      // In production, use Redis or DB, here just echo back
      // Optionally, validate fields
      return res.json({ success: true, step: 1, data: req.body })
    } else if (step === 2) {
      // Step 2: Save email/password, combine with previous info
      // In production, merge with step 1 data from session/temp
      return res.json({ success: true, step: 2, data: req.body })
    } else if (step === 3) {
      // Step 3: Finalize registration, create user
      // Combine all data, create user, send OTP, etc.
      const dto = new RegisterRequestDto(req.body)
      const result = await service.register(dto)
      return res.json(result)
    } else {
      return res.status(400).json({ message: "Invalid registration step" })
    }
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
