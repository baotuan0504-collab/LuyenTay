import { Router } from "express"
import { protectRoute } from "../../middleware/auth"
import {
  checkUsername,
  getUserById,
  getUsers,
  searchUsers,
  updateProfile,
} from "./user.controller"

// 1. Root Router: Các thao tác chung hoặc cá nhân (To - Gốc)
const userRootRouter = Router()
userRootRouter.get("/", protectRoute, getUsers)
userRootRouter.put("/profile", protectRoute, updateProfile)
userRootRouter.get("/search", protectRoute, searchUsers)

// 2. Member Router: Các thao tác liên quan đến một thành viên cụ thể (Nhỏ - Con)
const userMemberRouter = Router()
userMemberRouter.get("/check-username/:username", protectRoute, checkUsername)
userMemberRouter.get("/:userId", protectRoute, getUserById)

export { userMemberRouter, userRootRouter }
