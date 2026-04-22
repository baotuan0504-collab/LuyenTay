import { Router } from "express"
import { protectRoute } from "../../middleware/auth"
import {
  forgotPasswordSendOtp,
  forgotPasswordVerifyOtp,
  forgotPasswordVerifyOtpOnly,
  getMe,
  login,
  logout,
  refreshToken,
  register,
  trustDevice,
  verifyLoginOtp,
  verifyToken
} from "./auth.controller"

// 1. Root Router: Các luồng chính (Login, Register, Logout, Profile)
const authRootRouter = Router()
authRootRouter.post("/login", login)
authRootRouter.post("/register", register)
authRootRouter.post("/logout", logout)
authRootRouter.post("/refresh", refreshToken)
authRootRouter.get("/me", protectRoute, getMe)
authRootRouter.post("/verify-token", verifyToken)

// 2. Password Router: Luồng quên mật khẩu
const authPasswordRouter = Router()
authPasswordRouter.post("/send-otp", forgotPasswordSendOtp)
authPasswordRouter.post("/verify-otp-only", forgotPasswordVerifyOtpOnly)
authPasswordRouter.post("/verify-otp", forgotPasswordVerifyOtp)

// 3. Verify Router: Các bước xác thực bổ trợ (OTP, Trust Device)
const authVerifyRouter = Router()
authVerifyRouter.post("/verify-login-otp", verifyLoginOtp)
authVerifyRouter.post("/trust-device", trustDevice)

export { authPasswordRouter, authRootRouter, authVerifyRouter }
