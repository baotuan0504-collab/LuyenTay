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
  async login(dto: LoginRequestDto) {
    const user = await User.findOne({ email: dto.email })
    if (!user || !(await verifyPassword(dto.password, user.password))) {
      throw new Error("Invalid credentials")
    }

    // Kiểm tra khóa OTP
    const { isLocked, remaining } = await checkOtpLock(dto.email)
    if (isLocked) {
      throw new Error(`Chức năng OTP đang bị khóa. Thử lại sau ${Math.ceil(remaining / 60)} phút.`)
    }

    // Kiểm tra nếu thiết bị hiện tại đã được trust thì không cần OTP
    const isTrusted =
      dto.deviceId && user.trustedDevices?.includes(dto.deviceId)

    // Nếu requireOtp true VÀ thiết bị chưa được trust, gửi OTP và trả về requireOtp:true
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
    // Kiểm tra OTP trong Redis
    const { isLocked, remaining } = await checkOtpLock(dto.email)
    if (isLocked) {
      throw new Error(`Chức năng OTP đang bị khóa. Thử lại sau ${Math.ceil(remaining / 60)} phút.`)
    }

    const otpInRedis = await redis.get(`otp:${dto.email}`)
    if (!otpInRedis || otpInRedis !== dto.otp) {
      const { fails, isLocked: nowLocked } = await handleOtpFailure(dto.email)
      if (nowLocked) {
        await redis.del(`otp:${dto.email}`)
        throw new Error("Bạn đã nhập sai quá 3 lần. Chức năng OTP đã bị khóa trong 1 giờ.")
      }
      throw new Error(`OTP không hợp lệ. Bạn còn ${3 - fails} lần thử.`)
    }
    // Xoá OTP và bộ đếm sai sau khi dùng
    await redis.del(`otp:${dto.email}`)
    await redis.del(`otp_fails:${dto.email}`)
    const hashedPassword = await hashPassword(dto.password)
    const fullName = `${dto.firstName} ${dto.lastName}`.trim()
    const newUser = await User.create({
      name: fullName,
      email: dto.email,
      password: hashedPassword,
      onboardingCompleted: true, // Đánh dấu đã hoàn thành onboarding sau khi xác minh OTP
      // Optionally store birthDate and gender in user schema if needed
    })
    const tokens = await this.createTokenPair(newUser._id.toString())
    return new AuthResponseDto({ ...tokens, user: newUser })
  }

  async verifyToken(dto: VerifyTokenRequestDto) {
    const payload = verifyToken(dto.token)
    if (!payload.userId) throw new Error("Invalid token")
    return new VerifyTokenResponseDto({ userId: payload.userId })
  }

  private async createTokenPair(userId: string) {
    const accessToken = signToken({ userId })
    // Lưu accessToken vào database (User model)
    await User.findByIdAndUpdate(userId, {
      $set: { lastAccessToken: accessToken },
    })

    // Lưu refreshToken vào Redis: Key là token secret để O(1) lookup
    const refreshSecret = generateRefreshToken()
    const refreshTokenKey = `refresh_token:${refreshSecret}`
    await redis.set(refreshTokenKey, userId, "EX", 30 * 24 * 60 * 60)
    return {
      accessToken,
      refreshToken: refreshSecret,
    }
  }
}
