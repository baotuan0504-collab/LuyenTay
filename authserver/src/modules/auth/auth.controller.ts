import { Request, Response } from "express"
import {
  ForgotPasswordSendOtpDto,
  ForgotPasswordVerifyOtpDto,
  LoginRequestDto,
  RegisterRequestDto,
  ResetPasswordDto,
  VerifyLoginOtpDto,
  VerifyTokenRequestDto,
} from "./auth.dto"
import { AuthService } from "./auth.service"

const authService = new AuthService()

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const result = await authService.getMe(userId)
    res.json(result)
  } catch (err: any) {
    const status = err.message === "User not found" ? 404 : 500
    res.status(status).json({ message: err.message })
  }
}

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: rt } = req.body
    if (!rt) return res.status(400).json({ message: "Missing refreshToken" })
    const result = await authService.refreshToken(rt)
    res.json(result)
  } catch (err: any) {
    res.status(401).json({ message: err.message })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string
    const dto = new LoginRequestDto({ ...req.body, deviceId })
    const result = await authService.login(dto)
    res.json(result)
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
}

export const register = async (req: Request, res: Response) => {
  try {
    const { step } = req.body
    if (step === 3) {
      const dto = new RegisterRequestDto(req.body)
      const result = await authService.register(dto)
      res.json(result)
    } else {
      const { email } = req.body
      if (step === 2) {
        const result = await authService.sendForgotPasswordOtp(email)
        res.json({ ...result, step: 2 })
      } else {
        res.json({ success: true, step: 1 })
      }
    }
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
}

export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.body.refreshToken || req.headers["x-refresh-token"]
    if (!token) return res.status(400).json({ message: "Missing token" })
    await authService.logout(token)
    res.json({ success: true, message: "Logged out" })
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}

export const verifyToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body
    console.log("[AuthServer] Verifying token:", token?.substring(0, 20) + "...")
    
    const dto = new VerifyTokenRequestDto(req.body)
    const result = await authService.verifyToken(dto)
    
    console.log("[AuthServer] Verify Success for userId:", result.userId)
    res.json(result)
  } catch (err: any) {
    console.error("[AuthServer] Verify Failed:", err.message)
    res.status(401).json({ message: err.message })
  }
}

export const forgotPasswordSendOtp = async (req: Request, res: Response) => {
  try {
    const dto = new ForgotPasswordSendOtpDto(req.body)
    const result = await authService.sendForgotPasswordOtp(dto.email)
    res.json(result)
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
}

export const forgotPasswordVerifyOtpOnly = async (req: Request, res: Response) => {
  try {
    const dto = new ForgotPasswordVerifyOtpDto(req.body)
    const result = await authService.verifyForgotPasswordOtpOnly(dto.email, dto.otp)
    res.json(result)
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
}

export const forgotPasswordVerifyOtp = async (req: Request, res: Response) => {
  try {
    const dto = new ResetPasswordDto(req.body)
    const result = await authService.resetPassword(dto.email, dto.newPassword)
    res.json(result)
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
}

export const verifyLoginOtp = async (req: Request, res: Response) => {
  try {
    const dto = new VerifyLoginOtpDto(req.body)
    const result = await authService.verifyLoginOtp(dto.email, dto.otp)
    res.json(result)
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
}

export const trustDevice = async (req: Request, res: Response) => {
  try {
    const { email } = req.body
    const deviceId = req.headers["x-device-id"] as string
    const result = await authService.trustDevice(email, deviceId)
    res.json(result)
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
}
