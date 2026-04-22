import redis from "../../config/redis"
import { User } from "../../models/User"
import {
  generateRefreshToken,
  hashPassword,
  signToken,
  verifyPassword,
  verifyToken,
} from "../../utils/auth"
import { generateOtp, sendOtpMail } from "../../utils/mailer"
import {
  AuthResponseDto,
  LoginRequestDto,
  RegisterRequestDto,
  VerifyTokenRequestDto,
  VerifyTokenResponseDto,
} from "./auth.dto"

import { checkOtpLock, handleOtpFailure } from "../../middleware/rateLimiter"

export class AuthService {
  async getMe(userId: string) {
    const user = await User.findById(userId).select("-password")
    if (!user) throw new Error("User not found")
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      onboardingCompleted: user.onboardingCompleted
    }
  }

  async refreshToken(rt: string) {
    const userId = await redis.get(`refresh_token:${rt}`)
    if (!userId) throw new Error("Invalid or expired refresh token")

    await redis.del(`refresh_token:${rt}`)
    const tokens = await this.createTokenPair(userId)
    return tokens
  }

  async login(dto: LoginRequestDto) {
    const user = await User.findOne({ email: dto.email })
    if (!user || !(await verifyPassword(dto.password, user.password))) {
      throw new Error("Invalid credentials")
    }

    const { isLocked, remaining } = await checkOtpLock(dto.email)
    if (isLocked) {
      throw new Error(`Chức năng OTP đang bị khóa. Thử lại sau ${Math.ceil(remaining / 60)} phút.`)
    }

    const isTrusted =
      dto.deviceId && user.trustedDevices?.includes(dto.deviceId)

    if (user.requireOtp && !isTrusted) {
      const otp = generateOtp(6)
      await sendOtpMail(user.email, otp)
      await redis.set(`otp:${user.email}`, otp, "EX", 150)
      return { requireOtp: true, message: "OTP sent to email" }
    }
    const tokens = await this.createTokenPair(user._id.toString())
    return new AuthResponseDto({ ...tokens, user })
  }

  async register(dto: RegisterRequestDto) {
    const existingUser = await User.findOne({ email: dto.email })
    if (existingUser) throw new Error("Email already in use")

    const otpInRedis = await redis.get(`otp:${dto.email}`)
    if (!otpInRedis || otpInRedis !== dto.otp) {
      throw new Error(`OTP không hợp lệ hoặc đã hết hạn.`)
    }

    await redis.del(`otp:${dto.email}`)
    const hashedPassword = await hashPassword(dto.password)
    const fullName = `${dto.firstName} ${dto.lastName}`.trim()
    const newUser = await User.create({
      name: fullName,
      email: dto.email,
      password: hashedPassword,
      onboardingCompleted: true,
    })
    const tokens = await this.createTokenPair(newUser._id.toString())
    return new AuthResponseDto({ ...tokens, user: newUser })
  }

  async verifyToken(dto: VerifyTokenRequestDto) {
    const payload = verifyToken(dto.token)
    if (!payload.userId) throw new Error("Invalid token")

    // SINGLE DEVICE SESSION: Kiểm tra xem đây có phải mã Access Token mới nhất không
    const user = await User.findById(payload.userId)
    if (!user || user.lastAccessToken !== dto.token) {
      throw new Error("Session overwritten by newer login")
    }

    return new VerifyTokenResponseDto({ userId: payload.userId as string })
  }

  async logout(refreshToken: string) {
    const userId = await redis.get(`refresh_token:${refreshToken}`)
    if (userId) {
      await redis.del(`active_session:${userId}`)
    }
    await redis.del(`refresh_token:${refreshToken}`)
  }

  async sendForgotPasswordOtp(email: string) {
    const { isLocked, remaining } = await checkOtpLock(email)
    if (isLocked) {
      throw new Error(`Locked. Try again in ${Math.ceil(remaining / 60)} mins.`)
    }

    const user = await User.findOne({ email })
    if (!user) throw new Error("User not found")

    let otp = await redis.get(`forgot_otp:${email}`)
    if (!otp) {
      otp = generateOtp(6)
      await redis.set(`forgot_otp:${email}`, otp, "EX", 300)
    }
    await sendOtpMail(email, otp)
    return { success: true, message: "OTP sent" }
  }

  async verifyForgotPasswordOtpOnly(email: string, otp: string) {
    const { isLocked, remaining } = await checkOtpLock(email)
    if (isLocked) throw new Error(`Locked. Try again in ${Math.ceil(remaining / 60)} mins.`)

    const otpInRedis = await redis.get(`forgot_otp:${email}`)
    if (!otpInRedis || otpInRedis !== otp) {
      const { fails, isLocked: nowLocked } = await handleOtpFailure(email)
      if (nowLocked) {
        await redis.del(`forgot_otp:${email}`)
        throw new Error("Too many failures. Locked for 1 hour.")
      }
      throw new Error(`Invalid OTP. ${3 - fails} tries left.`)
    }

    await redis.del(`forgot_otp:${email}`)
    await redis.del(`otp_fails:${email}`)
    await redis.set(`forgot_verified:${email}`, "true", "EX", 300)
    return { success: true, message: "OTP valid" }
  }

  async resetPassword(email: string, newPassword: string) {
    const isVerified = await redis.get(`forgot_verified:${email}`)
    if (!isVerified) throw new Error("Please verify OTP first")

    const user = await User.findOne({ email })
    if (!user) throw new Error("User not found")

    const hashedPassword = await hashPassword(newPassword)
    user.password = hashedPassword
    await user.save()

    await redis.del(`forgot_verified:${email}`)
    return { success: true, message: "Password reset success" }
  }

  async verifyLoginOtp(email: string, otp: string) {
    const otpInRedis = await redis.get(`otp:${email}`)
    if (!otpInRedis || otpInRedis !== otp) throw new Error("Invalid or expired OTP")

    await redis.del(`otp:${email}`)
    const user = await User.findOne({ email })
    if (!user) throw new Error("User not found")

    const tokens = await this.createTokenPair(user._id.toString())
    return new AuthResponseDto({ ...tokens, user })
  }

  async trustDevice(email: string, deviceId: string) {
    const user = await User.findOne({ email })
    if (!user) throw new Error("User not found")

    if (!user.trustedDevices.includes(deviceId)) {
      user.trustedDevices.push(deviceId)
      await user.save()
    }
    return { success: true, trustedDevices: user.trustedDevices }
  }

  private async createTokenPair(userId: string) {
    // SINGLE DEVICE SESSION LOGIC
    const activeSessionKey = `active_session:${userId}`
    const oldTokenKey = await redis.get(activeSessionKey)
    if (oldTokenKey) {
      await redis.del(oldTokenKey)
    }

    const accessToken = signToken({ userId })
    await User.findByIdAndUpdate(userId, {
      $set: { lastAccessToken: accessToken },
    })

    const refreshSecret = generateRefreshToken()
    const refreshTokenKey = `refresh_token:${refreshSecret}`
    await redis.set(refreshTokenKey, userId.toString(), "EX", 30 * 24 * 60 * 60)
    
    // Cập nhật phiên đăng nhập mới
    await redis.set(activeSessionKey, refreshTokenKey, "EX", 30 * 24 * 60 * 60)

    return {
      accessToken,
      refreshToken: refreshSecret,
    }
  }
}
