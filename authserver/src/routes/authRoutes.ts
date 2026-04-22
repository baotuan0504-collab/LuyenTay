import { Router } from "express"

import { getMe, logout, refreshToken } from "../controllers/authController"
import { protectRoute } from "../middleware/auth"
import authModuleRouter from "../modules/auth/auth.route"

const router = Router()

// Mount OOP module routes
router.use(authModuleRouter)

router.post("/logout", logout)
router.get("/me", protectRoute, getMe)
router.post("/refresh", refreshToken)

export default router
