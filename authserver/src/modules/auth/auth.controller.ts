import { Request, Response } from "express"
import { ApiResponse } from "../../utils/ApiResponse"
import {
  ForgotPasswordSendOtpDto,
  ForgotPasswordVerifyOtpDto,
  LoginRequestDto,
  RefreshTokenDto,
  RegisterRequestDto,
  ResetPasswordDto,
  TrustDeviceDto,
  VerifyLoginOtpDto,
  VerifyTokenRequestDto,
} from "./auth.dto"
import { IAuthService } from "./auth.interface"
import { AuthService } from "./auth.service"

interface AuthRequest extends Request {
  userId: string
}

export class AuthController {
  private authService: IAuthService

  constructor(authService: IAuthService = new AuthService()) {
    this.authService = authService
  }

  getMe = async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthRequest
      const userId = authReq.userId
      const result = await this.authService.getMe(userId)
      res.json(ApiResponse.success(result))
    } catch (err: Error | unknown) {
      const message = err instanceof Error ? err.message : "Unknown error"
      const status = message === "User not found" ? 404 : 500
      res.status(status).json(ApiResponse.error(message))
    }
  }

  refreshToken = async (req: Request, res: Response) => {
    try {
      const dto = new RefreshTokenDto(req.body as Record<string, string>)
      const result = await this.authService.refreshToken(dto)
      res.json(ApiResponse.success(result))
    } catch (err: Error | unknown) {
      const message = err instanceof Error ? err.message : "Unknown error"
      res.status(401).json(ApiResponse.error(message))
    }
  }

  login = async (req: Request, res: Response) => {
    try {
      const deviceId = (req.headers["x-device-id"] as string) || ""
      const dto = new LoginRequestDto({
        ...(req.body as Record<string, string>),
        deviceId,
      })
      const result = await this.authService.login(dto)
      res.json(ApiResponse.success(result))
    } catch (err: Error | unknown) {
      const message = err instanceof Error ? err.message : "Unknown error"
      res.status(400).json(ApiResponse.error(message))
    }
  }

  register = async (req: Request, res: Response) => {
    try {
      const body = req.body as Record<string, string>
      const step = parseInt(body.step || "0")
      if (step === 3) {
        const dto = new RegisterRequestDto(body)
        const result = await this.authService.register(dto)
        res.json(ApiResponse.success(result, "Registration successful"))
      } else {
        const email = body.email
        if (step === 2) {
          const dto = new ForgotPasswordSendOtpDto({ email })
          const result = await this.authService.sendForgotPasswordOtp(dto)
          res.json(ApiResponse.success({ ...result, step: 2 }))
        } else {
          res.json(ApiResponse.success({ step: 1 }))
        }
      }
    } catch (err: Error | unknown) {
      const message = err instanceof Error ? err.message : "Unknown error"
      res.status(400).json(ApiResponse.error(message))
    }
  }

  logout = async (req: Request, res: Response) => {
    try {
      const body = req.body as Record<string, string>
      const refreshToken =
        body.refreshToken || (req.headers["x-refresh-token"] as string)
      const dto = new RefreshTokenDto({ refreshToken })
      await this.authService.logout(dto)
      res.json(ApiResponse.success(null, "Logged out successfully"))
    } catch (err: Error | unknown) {
      const message = err instanceof Error ? err.message : "Unknown error"
      res.status(500).json(ApiResponse.error(message))
    }
  }

  verifyToken = async (req: Request, res: Response) => {
    try {
      const dto = new VerifyTokenRequestDto(req.body as Record<string, string>)
      const result = await this.authService.verifyToken(dto)
      res.json(ApiResponse.success(result))
    } catch (err: Error | unknown) {
      const message = err instanceof Error ? err.message : "Unknown error"
      res.status(401).json(ApiResponse.error(message))
    }
  }

  forgotPasswordSendOtp = async (req: Request, res: Response) => {
    try {
      const dto = new ForgotPasswordSendOtpDto(
        req.body as Record<string, string>,
      )
      const result = await this.authService.sendForgotPasswordOtp(dto)
      res.json(ApiResponse.success(result))
    } catch (err: Error | unknown) {
      const message = err instanceof Error ? err.message : "Unknown error"
      res.status(400).json(ApiResponse.error(message))
    }
  }

  forgotPasswordVerifyOtpOnly = async (req: Request, res: Response) => {
    try {
      const dto = new ForgotPasswordVerifyOtpDto(
        req.body as Record<string, string>,
      )
      const result = await this.authService.verifyForgotPasswordOtpOnly(dto)
      res.json(ApiResponse.success(result))
    } catch (err: Error | unknown) {
      const message = err instanceof Error ? err.message : "Unknown error"
      res.status(400).json(ApiResponse.error(message))
    }
  }

  forgotPasswordVerifyOtp = async (req: Request, res: Response) => {
    try {
      const dto = new ResetPasswordDto(req.body as Record<string, string>)
      const result = await this.authService.resetPassword(dto)
      res.json(ApiResponse.success(result))
    } catch (err: Error | unknown) {
      const message = err instanceof Error ? err.message : "Unknown error"
      res.status(400).json(ApiResponse.error(message))
    }
  }

  verifyLoginOtp = async (req: Request, res: Response) => {
    try {
      const dto = new VerifyLoginOtpDto(req.body as Record<string, string>)
      const result = await this.authService.verifyLoginOtp(dto)
      res.json(ApiResponse.success(result))
    } catch (err: Error | unknown) {
      const message = err instanceof Error ? err.message : "Unknown error"
      res.status(400).json(ApiResponse.error(message))
    }
  }

  trustDevice = async (req: Request, res: Response) => {
    try {
      const body = req.body as Record<string, string>
      const email = body.email
      const deviceId = (req.headers["x-device-id"] as string) || ""
      const dto = new TrustDeviceDto({ email, deviceId })
      const result = await this.authService.trustDevice(dto)
      res.json(ApiResponse.success(result))
    } catch (err: Error | unknown) {
      const message = err instanceof Error ? err.message : "Unknown error"
      res.status(400).json(ApiResponse.error(message))
    }
  }
}


