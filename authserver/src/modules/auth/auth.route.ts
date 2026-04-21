import { Router } from "express"
import {
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

export default router
