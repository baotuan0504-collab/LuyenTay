// Xác thực OTP khi login
import { Request, Response } from "express"
import redis from "../../config/redis"
import { IUser, User } from "../../models/User"
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
    const deviceId = req.headers["x-device-id"] as string
    const dto = { ...req.body, deviceId }
    const result = await service.login(dto)
    return res.json(result)
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
}

// OTP verification endpoint: only checks OTP, returns tokens, does NOT handle trust device
export const verifyLoginOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body
    console.log("[verifyLoginOtp] email:", email, "otp:", otp)
    const otpInRedis = await redis.get(`otp:${email}`)
    console.log("[verifyLoginOtp] otpInRedis:", otpInRedis)
    if (!otpInRedis || otpInRedis !== otp) {
      console.log("[verifyLoginOtp] OTP không hợp lệ hoặc đã hết hạn")
      return res
        .status(400)
        .json({ message: "OTP không hợp lệ hoặc đã hết hạn" })
    }
    // Xoá OTP sau khi dùng
    await redis.del(`otp:${email}`)
    const user = (await User.findOne({ email })) as IUser | null
    console.log("[verifyLoginOtp] user:", user)
    if (!user) return res.status(400).json({ message: "User not found" })
    // Trả về token như login thường
    const tokens = await service["createTokenPair"](user._id.toString())
    console.log("[verifyLoginOtp] Trả về tokens:", tokens)
    return res.json(new AuthResponseDto({ ...tokens, user }))
  } catch (err: any) {
    console.log("[verifyLoginOtp] ERROR:", err)
    res.status(400).json({ message: err.message })
  }
}

// Trust device endpoint: FE calls this after OTP is verified, only needs email + deviceId
export const trustDevice = async (req: Request, res: Response) => {
  try {
    const { email } = req.body
    const deviceId = req.headers["x-device-id"] as string
    if (!email || !deviceId) {
      return res.status(400).json({ message: "Missing email or deviceId" })
    }
    const user = (await User.findOne({ email })) as IUser | null
    if (!user) return res.status(400).json({ message: "User not found" })
    if (!user.trustedDevices.includes(deviceId)) {
      user.trustedDevices.push(deviceId)
      await user.save()
      console.log(
        "[trustDevice] Đã thêm deviceId vào trustedDevices:",
        user.trustedDevices,
      )
    } else {
      console.log("[trustDevice] deviceId đã tồn tại hoặc không hợp lệ")
    }
    return res.json({ success: true, trustedDevices: user.trustedDevices })
  } catch (err: any) {
    console.log("[trustDevice] ERROR:", err)
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
      // Step 2: Sinh OTP, gửi mail, lưu OTP vào Redis nếu chưa có, không ghi đè OTP đang sống
      const { email } = req.body
      if (!email) return res.status(400).json({ message: "Missing email" })
      // Kiểm tra email đã tồn tại chưa
      const existingUser = (await User.findOne({ email })) as IUser | null
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, message: "Tài khoản đã tồn tại!" })
      }
      let otp = await redis.get(`otp:${email}`)
      if (!otp) {
        otp = generateOtp(6)
        try {
          await redis.set(`otp:${email}`, otp, "EX", 150)
        } catch (e: any) {
          return res
            .status(500)
            .json({ message: "Redis set OTP failed", error: e.message })
        }
      }
      try {
        await sendOtpMail(email, otp)
      } catch (e: any) {
        return res
          .status(500)
          .json({ message: "Send mail failed", error: e.message })
      }
      // Không trả về OTP cho FE
      return res.json({
        success: true,
        step: 2,
        message: "OTP sent to email",
      })
    } else if (step === 3) {
      // Step 3: Finalize registration, kiểm tra OTP, tạo user
      // TODO: Kiểm tra OTP với email, nếu đúng mới cho tạo user
      const dto = new RegisterRequestDto(req.body)
      const result = await service.register(dto)
      // Nếu cần truy cập newUser._id, ép kiểu trong service.register tương tự
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
