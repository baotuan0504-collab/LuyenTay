import { Router } from "express"
import { userMemberRouter, userRootRouter } from "../modules/user/user.route"

const router = Router()

/**
 * HỆ THỐNG ROUTER CHA (PARENT) - USER MODULE
 */

// 1. Phân vùng Gốc: Profile, Search, List
router.use("/", userRootRouter)

// 2. Phân vùng Thành viên: Chi tiết user, Check username
router.use("/", userMemberRouter)

export default router
