// DTOs for Auth module

export class LoginRequestDto {
  email: string
  password: string
  deviceId?: string
  constructor(data: any) {
    this.email = data.email
    this.password = data.password
    this.deviceId = data.deviceId
  }
}

// Step 1: Basic info
export class RegisterStep1Dto {
  firstName: string
  lastName: string
  birthDate: string // ISO format
  gender: string
  constructor(data: any) {
    this.firstName = data.firstName
    this.lastName = data.lastName
    this.birthDate = data.birthDate
    this.gender = data.gender
  }
}

// Step 2: Email and password
export class RegisterStep2Dto {
  email: string
  password: string
  constructor(data: any) {
    this.email = data.email
    this.password = data.password
  }
}

// Step 3: OTP
export class RegisterStep3Dto {
  email: string
  otp: string
  constructor(data: any) {
    this.email = data.email
    this.otp = data.otp
  }
}

// For backward compatibility, you may keep this or remove later
export class RegisterRequestDto {
  firstName: string
  lastName: string
  birthDate: string
  gender: string
  email: string
  password: string
  constructor(data: any) {
    this.firstName = data.firstName
    this.lastName = data.lastName
    this.birthDate = data.birthDate
    this.gender = data.gender
    this.email = data.email
    this.password = data.password
  }
}
export class AuthResponseDto {
  accessToken: string
  refreshToken: string
  user: any
  constructor(data: any) {
    this.accessToken = data.accessToken
    this.refreshToken = data.refreshToken
    this.user = data.user
  }
}

export class VerifyTokenRequestDto {
  token: string
  constructor(data: any) {
    this.token = data.token
  }
}

export class VerifyTokenResponseDto {
  userId: string
  constructor(data: any) {
    this.userId = data.userId
  }
}
