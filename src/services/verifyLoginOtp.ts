import { apiFetch } from "./api"

export const verifyLoginOtp = async (
  email: string,
  otp: string,
  trustDevice: boolean = false,
) => {
  try {
    const data = await apiFetch("/auth/verify-login-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp, trustDevice }),
    })
    return data
  } catch (error) {
    throw error
  }
}
