import { Router } from "express"
import {
  forgotPasswordSendOtp,
  forgotPasswordVerifyOtp,
  forgotPasswordVerifyOtpOnly,
  login,
  register,
  trustDevice,
  verifyLoginOtp,
  verifyToken,
} from "./auth.controller"

const router = Router()

router.post("/login", login)
router.post("/register", register)
router.post("/verify", verifyToken)

router.post("/verify-login-otp", verifyLoginOtp)
router.post("/trust-device", trustDevice)

router.post("/forgot-password/send-otp", forgotPasswordSendOtp)

router.post("/forgot-password/verify-otp", forgotPasswordVerifyOtp)
router.post("/forgot-password/verify-otp-only", forgotPasswordVerifyOtpOnly)

export default router
