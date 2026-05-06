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

export interface IAuthService {
  getMe(userId: string): Promise<GetMeResponseDto>
  refreshToken(dto: RefreshTokenDto): Promise<AuthResponseDto>
  login(
    dto: LoginRequestDto,
  ): Promise<AuthResponseDto | LoginOtpResponseDto>
  register(dto: RegisterRequestDto): Promise<AuthResponseDto>
  verifyToken(dto: VerifyTokenRequestDto): Promise<VerifyTokenResponseDto>
  logout(dto: RefreshTokenDto): Promise<void>
  sendForgotPasswordOtp(dto: ForgotPasswordSendOtpDto): Promise<GeneralResponseDto>
  verifyForgotPasswordOtpOnly(
    dto: ForgotPasswordVerifyOtpDto,
  ): Promise<GeneralResponseDto>
  resetPassword(dto: ResetPasswordDto): Promise<GeneralResponseDto>
  verifyLoginOtp(dto: VerifyLoginOtpDto): Promise<AuthResponseDto>
  trustDevice(dto: TrustDeviceDto): Promise<GeneralResponseDto>
}
