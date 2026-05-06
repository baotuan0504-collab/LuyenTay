import { Router } from "express"
import { protectRoute } from "../../middleware/auth"
import { AuthController } from "./auth.controller"

const authController = new AuthController()

// 1. Root Router: Các luồng chính (Login, Register, Logout, Profile)
const authRootRouter = Router()
authRootRouter.post("/login", authController.login)
authRootRouter.post("/register", authController.register)
authRootRouter.post("/logout", authController.logout)
authRootRouter.post("/refresh", authController.refreshToken)
authRootRouter.get("/me", protectRoute, authController.getMe)
authRootRouter.post("/verify", authController.verifyToken)

// 2. Password Router: Luồng quên mật khẩu
const authPasswordRouter = Router()
authPasswordRouter.post("/send-otp", authController.forgotPasswordSendOtp)
authPasswordRouter.post(
  "/verify-otp-only",
  authController.forgotPasswordVerifyOtpOnly,
)
authPasswordRouter.post("/verify-otp", authController.forgotPasswordVerifyOtp)

// 3. Verify Router: Các bước xác thực bổ trợ (OTP, Trust Device)
const authVerifyRouter = Router()
authVerifyRouter.post("/verify-login-otp", authController.verifyLoginOtp)
authVerifyRouter.post("/trust-device", authController.trustDevice)

export { authPasswordRouter, authRootRouter, authVerifyRouter }
