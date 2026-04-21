import { apiFetch } from "./api"

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
