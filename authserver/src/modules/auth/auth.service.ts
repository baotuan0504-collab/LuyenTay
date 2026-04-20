import { RefreshToken } from "../../models/RefreshToken"
import { User } from "../../models/User"
import {
  generateRefreshToken,
  hashPassword,
  hashRefreshToken,
  signToken,
  verifyPassword,
  verifyToken,
} from "../../utils/auth"
import {
  AuthResponseDto,
  LoginRequestDto,
  RegisterRequestDto,
  VerifyTokenRequestDto,
  VerifyTokenResponseDto,
} from "./auth.dto"

const REFRESH_TOKEN_EXPIRE_MS = 30 * 24 * 60 * 60 * 1000

export class AuthService {
  async login(dto: LoginRequestDto) {
    const user = await User.findOne({ email: dto.email })
    if (!user || !(await verifyPassword(dto.password, user.password))) {
      throw new Error("Invalid credentials")
    }
    // Kiểm tra nếu thiết bị hiện tại đã được trust thì không cần OTP
    const isTrusted = dto.deviceId && user.trustedDevices?.includes(dto.deviceId)

    // Nếu requireOtp true VÀ thiết bị chưa được trust, gửi OTP và trả về requireOtp:true
    if (user.requireOtp && !isTrusted) {
      const { generateOtp, sendOtpMail } = await import("../../utils/mailer")
      const otp = generateOtp(6)
      await sendOtpMail(user.email, otp)
      // TODO: Lưu OTP vào DB/cache
      return { requireOtp: true, message: "OTP sent to email" }
    }
    const tokens = await this.createTokenPair(user._id.toString())
    return new AuthResponseDto({ ...tokens, user })
  }

  async register(dto: RegisterRequestDto) {
    const existingUser = await User.findOne({ email: dto.email })
    if (existingUser) throw new Error("Email already in use")
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
    const refreshSecret = generateRefreshToken()
    const refreshTokenHash = await hashRefreshToken(refreshSecret)
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRE_MS)
    const refreshTokenDoc = await RefreshToken.create({
      user: userId,
      tokenHash: refreshTokenHash,
      expiresAt,
    })
    return {
      accessToken,
      refreshToken: `${refreshTokenDoc._id.toString()}:${refreshSecret}`,
    }
  }
}
