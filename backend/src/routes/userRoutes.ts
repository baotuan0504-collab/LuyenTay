import { Router } from "express"
import { protectRoute } from "../middleware/auth"
import {
  checkUsername,
  getUserById,
  getUsers,
  searchUsers,
  updateProfile,
  updatePublicKey,
} from "../modules/user/controller/user.controller"

const router = Router()

router.get("/", protectRoute, getUsers)
router.get("/check-username/:username", protectRoute, checkUsername)
router.put("/profile", protectRoute, updateProfile)
router.put("/public-key", protectRoute, updatePublicKey)
router.get("/search", protectRoute, searchUsers)
router.get("/:userId", protectRoute, getUserById)

export default router
