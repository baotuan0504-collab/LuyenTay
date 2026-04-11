import { Router } from "express"

import { getMe, refreshToken } from "../controllers/authController"
import { protectRoute } from "../middleware/auth"
import authModuleRouter from "../modules/auth/auth.route"

const router = Router()

// Mount OOP module routes
router.use(authModuleRouter)

router.get("/me", protectRoute, getMe)
router.post("/refresh", refreshToken)

export default router
