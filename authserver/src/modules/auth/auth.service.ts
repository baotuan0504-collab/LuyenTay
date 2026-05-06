import crypto from "crypto"
import redis from "../../config/redis"
import { IUserRepository, UserRepository } from "../../repositories/UserRepository"
import {
  hashPassword,
  signToken,
  verifyPassword,
  verifyToken
} from "../../utils/auth"
import { generateOtp, sendOtpMail } from "../../utils/mailer"
import {
  AuthResponseDto,
  ForgotPasswordSendOtpDto,
  ForgotPasswordVerifyOtpDto,
  GeneralResponseDto,
  GetMeResponseDto,
  LoginOtpResponseDto,
  LoginRequestDto,
  RefreshTokenDto,
  RegisterRequestDto,
  ResetPasswordDto,
  TrustDeviceDto,
  VerifyLoginOtpDto,
  VerifyTokenRequestDto,
  VerifyTokenResponseDto,
} from "./auth.dto"

import { checkOtpLock, handleOtpFailure } from "../../middleware/rateLimiter"
import { IAuthService } from "./auth.interface"

export class AuthService implements IAuthService {
  private userRepository: IUserRepository

  constructor(userRepository: IUserRepository = new UserRepository()) {
    this.userRepository = userRepository
  }

  async getMe(userId: string): Promise<GetMeResponseDto> {
    try {
      const user = await this.userRepository.findById(userId)
      if (!user) throw new Error("User not found")
      return new GetMeResponseDto(user)
    } catch (error: Error | unknown) {
      throw error
    }
  }

  async refreshToken(dto: RefreshTokenDto): Promise<AuthResponseDto> {
    try {
      const userId = await redis.get(`refresh_token:${dto.refreshToken}`)
      if (!userId) throw new Error("Invalid or expired refresh token")

      await redis.del(`refresh_token:${dto.refreshToken}`)
      const tokens = await this.createTokenPair(userId)
      const user = await this.userRepository.findById(userId)
      if (!user) throw new Error("User not found")

      return new AuthResponseDto({ ...tokens, user })
    } catch (error: Error | unknown) {
      throw error
    }
  }

  async login(
    dto: LoginRequestDto,
  ): Promise<AuthResponseDto | LoginOtpResponseDto> {
    try {
      const user = await this.userRepository.findByEmail(dto.email)
      if (!user || !(await verifyPassword(dto.password, user.password))) {
        throw new Error("Invalid credentials")
      }

      const { isLocked, remaining } = await checkOtpLock(dto.email)
      if (isLocked) {
        throw new Error(
          `Chức năng OTP đang bị khóa. Thử lại sau ${Math.ceil(remaining / 60)} phút.`,
        )
      }

      const isTrusted =
        dto.deviceId && user.trustedDevices.includes(dto.deviceId)

      if (user.requireOtp && !isTrusted) {
        const otp = generateOtp(6)
        await sendOtpMail(user.email, otp)
        await redis.set(`otp:${user.email}`, otp, "EX", 150)
        return new LoginOtpResponseDto({
          email: user.email,
          message: "OTP sent to email"
        })
      }
      const tokens = await this.createTokenPair(user._id.toString())
      return new AuthResponseDto({ ...tokens, user })
    } catch (error: Error | unknown) {
      throw error
    }
  }

  async register(dto: RegisterRequestDto): Promise<AuthResponseDto> {
    try {
      const existingUser = await this.userRepository.findByEmail(dto.email)
      if (existingUser) throw new Error("Email already in use")

      const otpInRedis = await redis.get(`otp:${dto.email}`)
      if (!otpInRedis || otpInRedis !== dto.otp) {
        throw new Error(`OTP không hợp lệ hoặc đã hết hạn.`)
      }

      await redis.del(`otp:${dto.email}`)
      const hashedPassword = await hashPassword(dto.password)
      const fullName = `${dto.firstName} ${dto.lastName}`.trim()
      const newUser = await this.userRepository.create({
        name: fullName,
        email: dto.email,
        password: hashedPassword,
        onboardingCompleted: true,
      })
      const tokens = await this.createTokenPair(newUser._id.toString())
      return new AuthResponseDto({ ...tokens, user: newUser })
    } catch (error: Error | unknown) {
      throw error
    }
  }

  async verifyToken(
    dto: VerifyTokenRequestDto,
  ): Promise<VerifyTokenResponseDto> {
    try {
      const payload = verifyToken(dto.token)
      if (!payload.userId) throw new Error("Invalid token")

      const user = await this.userRepository.findById(payload.userId as string)
      if (!user || user.lastAccessToken !== dto.token) {
        throw new Error("Session overwritten by newer login")
      }

      return new VerifyTokenResponseDto({ userId: payload.userId as string })
    } catch (error: Error | unknown) {
      throw error
    }
  }

  async logout(dto: RefreshTokenDto): Promise<void> {
    try {
      const userId = await redis.get(`refresh_token:${dto.refreshToken}`)
      if (userId) {
        await redis.del(`active_session:${userId}`)
      }
      await redis.del(`refresh_token:${dto.refreshToken}`)
    } catch (error: Error | unknown) {
      throw error
    }
  }

  async sendForgotPasswordOtp(
    dto: ForgotPasswordSendOtpDto,
  ): Promise<GeneralResponseDto> {
    try {
      const { isLocked, remaining } = await checkOtpLock(dto.email)
      if (isLocked) {
        throw new Error(
          `Locked. Try again in ${Math.ceil(remaining / 60)} mins.`,
        )
      }

      const user = await this.userRepository.findByEmail(dto.email)
      if (!user) throw new Error("User not found")

      let otp = await redis.get(`forgot_otp:${dto.email}`)
      if (!otp) {
        otp = generateOtp(6)
        await redis.set(`forgot_otp:${dto.email}`, otp, "EX", 300)
      }
      await sendOtpMail(dto.email, otp)
      return new GeneralResponseDto(true, "OTP sent")
    } catch (error: Error | unknown) {
      throw error
    }
  }

  async verifyForgotPasswordOtpOnly(
    dto: ForgotPasswordVerifyOtpDto,
  ): Promise<GeneralResponseDto> {
    try {
      const { isLocked, remaining } = await checkOtpLock(dto.email)
      if (isLocked)
        throw new Error(
          `Locked. Try again in ${Math.ceil(remaining / 60)} mins.`,
        )

      const otpInRedis = await redis.get(`forgot_otp:${dto.email}`)
      if (!otpInRedis || otpInRedis !== dto.otp) {
        const { fails, isLocked: nowLocked } = await handleOtpFailure(dto.email)
        if (nowLocked) {
          await redis.del(`forgot_otp:${dto.email}`)
          throw new Error("Too many failures. Locked for 1 hour.")
        }
        throw new Error(`Invalid OTP. ${3 - fails} tries left.`)
      }

      await redis.del(`forgot_otp:${dto.email}`)
      await redis.del(`otp_fails:${dto.email}`)
      await redis.set(`forgot_verified:${dto.email}`, "true", "EX", 300)
      return new GeneralResponseDto(true, "OTP valid")
    } catch (error: Error | unknown) {
      throw error
    }
  }

  async resetPassword(dto: ResetPasswordDto): Promise<GeneralResponseDto> {
    try {
      const isVerified = await redis.get(`forgot_verified:${dto.email}`)
      if (!isVerified) throw new Error("Please verify OTP first")

      const user = await this.userRepository.findByEmail(dto.email)
      if (!user) throw new Error("User not found")

      const hashedPassword = await hashPassword(dto.newPassword)
      user.password = hashedPassword
      await this.userRepository.save(user)

      await redis.del(`forgot_verified:${dto.email}`)
      return new GeneralResponseDto(true, "Password reset success")
    } catch (error: Error | unknown) {
      throw error
    }
  }

  async verifyLoginOtp(dto: VerifyLoginOtpDto): Promise<AuthResponseDto> {
    try {
      const otpInRedis = await redis.get(`otp:${dto.email}`)
      if (!otpInRedis || otpInRedis !== dto.otp)
        throw new Error("Invalid or expired OTP")

      await redis.del(`otp:${dto.email}`)
      const user = await this.userRepository.findByEmail(dto.email)
      if (!user) throw new Error("User not found")

      const tokens = await this.createTokenPair(user._id.toString())
      return new AuthResponseDto({ ...tokens, user })
    } catch (error: Error | unknown) {
      throw error
    }
  }

  async trustDevice(dto: TrustDeviceDto): Promise<GeneralResponseDto> {
    try {
      const user = await this.userRepository.findByEmail(dto.email)
      if (!user) throw new Error("User not found")

      if (!user.trustedDevices.includes(dto.deviceId)) {
        user.trustedDevices.push(dto.deviceId)
        await this.userRepository.save(user)
      }
      return new GeneralResponseDto(true, "Device trusted", {
        trustedDevices: user.trustedDevices,
      })
    } catch (error: Error | unknown) {
      throw error
    }
  }

  private async createTokenPair(userId: string): Promise<{
    accessToken: string
    refreshToken: string
  }> {
    const accessToken = signToken({ userId })
    const refreshToken = crypto.randomBytes(64).toString("hex")

    // Lưu vào Redis để quản lý session
    await redis.set(`refresh_token:${refreshToken}`, userId, "EX", 7 * 24 * 60 * 60)
    await redis.set(`active_session:${userId}`, accessToken, "EX", 24 * 60 * 60)

    // Cập nhật lastAccessToken vào DB để vượt qua bước verifyToken (integrity check)
    await this.userRepository.updateById(userId, {
      lastAccessToken: accessToken,
    })

    return { accessToken, refreshToken }
  }
}
