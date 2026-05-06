export class LoginRequestDto {
  email: string
  password: string
  deviceId: string
  constructor(data: Record<string, string>) {
    if (!data.email) throw new Error("Email is required")
    if (!data.password) throw new Error("Password is required")
    this.email = data.email.trim().toLowerCase()
    this.password = data.password
    this.deviceId = data.deviceId || ""
  }
}

export class RegisterRequestDto {
  firstName: string
  lastName: string
  birthDate: string
  gender: string
  email: string
  password: string
  otp: string
  constructor(data: Record<string, string>) {
    if (!data.email) throw new Error("Email is required")
    if (!data.password) throw new Error("Password is required")
    if (!data.firstName || !data.lastName)
      throw new Error("Full name is required")
    this.firstName = data.firstName
    this.lastName = data.lastName
    this.birthDate = data.birthDate
    this.gender = data.gender
    this.email = data.email.trim().toLowerCase()
    this.password = data.password
    this.otp = data.otp || ""
  }
}

import { UserEntity } from "../../entities/User"

export class AuthResponseDto {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    name: string
    email: string
    username: string
    avatar: string
    onboardingCompleted: boolean
  }
  constructor(data: {
    accessToken: string
    refreshToken: string
    user: UserEntity
  }) {
    if (!data.accessToken) throw new Error("AccessToken is required in AuthResponseDto")
    if (!data.refreshToken) throw new Error("RefreshToken is required in AuthResponseDto")
    if (!data.user) throw new Error("User data is required in AuthResponseDto")

    this.accessToken = data.accessToken
    this.refreshToken = data.refreshToken
    this.user = {
      id: String(data.user._id || (data.user as any).id),
      name: String(data.user.name),
      email: String(data.user.email),
      username: String(data.user.username),
      avatar: String(data.user.avatar),
      onboardingCompleted: Boolean(data.user.onboardingCompleted),
    }
  }
}

export class LoginOtpResponseDto {
  requireOtp: boolean
  message: string
  email: string
  constructor(data: { email: string; message?: string }) {
    this.requireOtp = true
    this.email = data.email
    this.message = data.message || "OTP required for login"
  }
}

export class RefreshTokenDto {
  refreshToken: string
  constructor(data: Record<string, string>) {
    if (!data.refreshToken) throw new Error("Refresh token is required")
    this.refreshToken = data.refreshToken
  }
}

export class GetMeResponseDto {
  id: string
  name: string
  email: string
  username: string
  avatar: string
  onboardingCompleted: boolean
  constructor(user: UserEntity) {
    if (!user) throw new Error("User data is required in GetMeResponseDto")
    this.id = String(user._id || (user as unknown as { id: string }).id)
    this.name = String(user.name)
    this.email = String(user.email)
    this.username = String(user.username)
    this.avatar = String(user.avatar)
    this.onboardingCompleted = Boolean(user.onboardingCompleted)
  }
}

export class VerifyTokenRequestDto {
  token: string
  constructor(data: Record<string, unknown>) {
    if (!data.token) throw new Error("Token is required")
    this.token = String(data.token)
  }
}

export class VerifyTokenResponseDto {
  userId: string
  constructor(data: { userId: string }) {
    this.userId = data.userId
  }
}

export class ForgotPasswordSendOtpDto {
  email: string
  constructor(data: Record<string, string>) {
    if (!data.email) throw new Error("Email is required")
    this.email = data.email.trim().toLowerCase()
  }
}

export class ForgotPasswordVerifyOtpDto {
  email: string
  otp: string
  constructor(data: Record<string, string>) {
    if (!data.email) throw new Error("Email is required")
    if (!data.otp) throw new Error("OTP is required")
    this.email = data.email.toLowerCase()
    this.otp = data.otp
  }
}

export class ResetPasswordDto {
  email: string
  newPassword: string
  constructor(data: Record<string, string>) {
    if (!data.email) throw new Error("Email is required")
    if (!data.newPassword || data.newPassword.length < 6)
      throw new Error("New password must be at least 6 characters")
    this.email = data.email.toLowerCase()
    this.newPassword = data.newPassword
  }
}

export class VerifyLoginOtpDto {
  email: string
  otp: string
  constructor(data: Record<string, string>) {
    if (!data.email) throw new Error("Email is required")
    if (!data.otp) throw new Error("OTP is required")
    this.email = data.email.toLowerCase()
    this.otp = data.otp
  }
}

export class TrustDeviceDto {
  email: string
  deviceId: string
  constructor(data: Record<string, string>) {
    if (!data.email) throw new Error("Email is required")
    if (!data.deviceId) throw new Error("Device ID is required")
    this.email = data.email.toLowerCase()
    this.deviceId = data.deviceId
  }
}

export class GeneralResponseDto {
  success: boolean
  message: string
  data: Record<string, unknown>
  constructor(success: boolean, message: string, data: Record<string, unknown> = {}) {
    this.success = success
    this.message = message
    this.data = data
  }
}
