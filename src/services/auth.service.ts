import { apiFetch } from "./api"

export const login = async (email: string, password: string) => {
  try {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
    console.log("Login successful:", data)
    return data
  } catch (error) {
    throw error
  }
}

export const register = async (email: string, password: string, name = "") => {
  try {
    const data = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    })
    console.log("Registration successful:", data)
    return data
  } catch (error) {
    throw error
  }
}

export const refreshToken = async (refreshTokenValue: string) => {
  try {
    const data = await apiFetch("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken: refreshTokenValue }),
    })
    console.log("Token refresh successful:", data)
    return data
  } catch (error) {
    throw error
  }
}

export const logout = async (refreshTokenValue: string) => {
  try {
    await apiFetch("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken: refreshTokenValue }),
    })
  } catch (error) {
    console.warn("Logout API failed:", error)
  }
}

// Grouped Forgot Password features
export const forgotPasswordService = {
  sendOtp: async (email: string) => {
    return apiFetch("/auth/forgot-password/send-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  },
  verifyOtpOnly: async (email: string, otp: string) => {
    return apiFetch("/auth/forgot-password/verify-otp-only", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    })
  },
  resetPassword: async (email: string, newPassword: string) => {
    return apiFetch("/auth/forgot-password/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, newPassword }),
    })
  },
}

// Verify Login OTP
export const verifyLoginOtp = async (
  email: string,
  otp: string,
  trustDevice: boolean = false,
) => {
  return apiFetch("/auth/verify-login-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp, trustDevice }),
  })
}
