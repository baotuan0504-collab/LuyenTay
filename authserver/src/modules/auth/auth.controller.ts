// Xác thực OTP khi login
import { Request, Response } from "express"
import { User } from "../../models/User"
import { generateOtp, sendOtpMail } from "../../utils/mailer"
import {
  AuthResponseDto,
  RegisterRequestDto,
  VerifyTokenRequestDto,
} from "./auth.dto"
import { AuthService } from "./auth.service"

const service = new AuthService()

// Login controller for /login route
export const login = async (req: Request, res: Response) => {
  try {
    const dto = req.body // Should match LoginRequestDto
    const result = await service.login(dto)
    return res.json(result)
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
}

export const verifyLoginOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp, trustDevice } = req.body
    // TODO: Kiểm tra OTP với email (DB/cache)
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: "User not found" })
    // TODO: So sánh otp với otp đã lưu
    // Nếu đúng, cập nhật requireOtp=false nếu trustDevice
    if (trustDevice) {
      user.requireOtp = false
      await user.save()
    }
    // Trả về token như login thường
    // Đổi createTokenPair thành public nếu cần
    const tokens = await service["createTokenPair"](user._id.toString())
    return res.json(new AuthResponseDto({ ...tokens, user }))
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
}

// Multi-step registration controller
export const register = async (req: Request, res: Response) => {
  try {
    const { step } = req.body
    if (step === 1) {
      // Step 1: Save basic info to session or temp storage (simulate for now)
      return res.json({ success: true, step: 1, data: req.body })
    } else if (step === 2) {
      // Step 2: Sinh OTP, gửi mail, lưu OTP tạm thời (ở đây chỉ trả về OTP cho FE demo, thực tế lưu DB/cache)
      const { email } = req.body
      if (!email) return res.status(400).json({ message: "Missing email" })
      // Kiểm tra email đã tồn tại chưa
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, message: "Tài khoản đã tồn tại!" })
      }
      const otp = generateOtp(6)
      try {
        await sendOtpMail(email, otp)
      } catch (e: any) {
        return res
          .status(500)
          .json({ message: "Send mail failed", error: e.message })
      }
      // TODO: Lưu OTP vào DB/cache với email, demo trả về OTP cho FE
      return res.json({
        success: true,
        step: 2,
        message: "OTP sent to email",
        otp,
      })
    } else if (step === 3) {
      // Step 3: Finalize registration, kiểm tra OTP, tạo user
      // TODO: Kiểm tra OTP với email, nếu đúng mới cho tạo user
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
