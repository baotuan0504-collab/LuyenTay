import { Router } from "express"
import {
  authPasswordRouter,
  authRootRouter,
  authVerifyRouter,
} from "../modules/auth/auth.route"

const router = Router()

/**
 * HỆ THỐNG ROUTER CHA (PARENT)
 * Quản lý các phân vùng logic của Auth Module
 */

// 1. Phân vùng Gốc: Login, Register, Logout, Me, Refresh
router.use("/", authRootRouter)

// 2. Phân vùng Password: /forgot-password/...
router.use("/forgot-password", authPasswordRouter)

// 3. Phân vùng Verification: /verify-login-otp, /trust-device
router.use("/", authVerifyRouter)

export default router
