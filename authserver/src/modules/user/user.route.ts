import { Router } from "express"
import { protectRoute } from "../../middleware/auth"
import { UserController } from "./user.controller"

const userController = new UserController()

// 1. Root Router: Các thao tác chung hoặc cá nhân (To - Gốc)
const userRootRouter = Router()
userRootRouter.get("/", protectRoute, userController.getUsers)
userRootRouter.put("/profile", protectRoute, userController.updateProfile)
userRootRouter.get("/search", protectRoute, userController.searchUsers)

// 2. Member Router: Các thao tác liên quan đến một thành viên cụ thể (Nhỏ - Con)
const userMemberRouter = Router()
userMemberRouter.get("/check-username/:username", protectRoute, userController.checkUsername)
userMemberRouter.get("/:userId", protectRoute, userController.getUserById)

export { userMemberRouter, userRootRouter }
