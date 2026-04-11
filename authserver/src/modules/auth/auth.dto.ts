// DTOs for Auth module

export class LoginRequestDto {
  email: string
  password: string
  constructor(data: any) {
    this.email = data.email
    this.password = data.password
  }
}

export class RegisterRequestDto {
  name?: string
  email: string
  password: string
  constructor(data: any) {
    this.name = data.name
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
