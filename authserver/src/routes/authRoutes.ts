import { Router } from "express"
import {
  getMe,
  login,
  refreshToken,
  register,
} from "../controllers/authController"
import { protectRoute } from "../middleware/auth"
import { verifyToken } from "../utils/auth"

const router = Router()

// Service-to-service: xác thực token
router.post("/verify", (req, res) => {
  try {
    const { token } = req.body
    if (!token) return res.status(400).json({ message: "Token required" })
    const payload = verifyToken(token)
    if (!payload.userId)
      return res.status(401).json({ message: "Invalid token" })
    res.json({ userId: payload.userId })
  } catch (err: any) {
    res.status(401).json({ message: err?.message || "Unauthorized" })
  }
})

router.get("/me", protectRoute, getMe)
router.post("/register", register)
router.post("/login", login)
router.post("/refresh", refreshToken)

export default router
