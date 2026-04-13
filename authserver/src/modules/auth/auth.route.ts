import { Router } from "express"
import { login, register, verifyLoginOtp, verifyToken } from "./auth.controller"

const router = Router()

router.post("/login", login)
router.post("/register", register)
router.post("/verify", verifyToken)
router.post("/verify-login-otp", verifyLoginOtp)

export default router
