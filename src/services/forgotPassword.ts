// Xác thực OTP cho forgot password, không đổi mật khẩu
import { apiFetch } from "./api"
export const verifyForgotPasswordOtpOnly = async (
  email: string,
  otp: string,
) => {
  return apiFetch("/auth/forgot-password/verify-otp-only", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  })
}

export const sendForgotPasswordOtp = async (email: string) => {
  return apiFetch("/auth/forgot-password/send-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  })
}

export const verifyForgotPasswordOtp = async (
  email: string,
  otp: string,
  newPassword: string,
) => {
  return apiFetch("/auth/forgot-password/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp, newPassword }),
  })
}
