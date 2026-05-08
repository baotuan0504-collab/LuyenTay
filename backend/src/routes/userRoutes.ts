import { Router } from "express"
import { protectRoute } from "../middleware/auth"
import { UserController } from "../modules/user/user.controller"

const router = Router()
const userController = new UserController()

router.get("/", protectRoute, userController.getUsers)
router.get("/search", protectRoute, userController.searchUsers)
router.get("/check-username/:username", protectRoute, userController.checkUsername)
router.get("/:userId", protectRoute, userController.getUserById)
router.put("/profile", protectRoute, userController.updateProfile)
router.put("/public-key", protectRoute, userController.updatePublicKey)

export default router
