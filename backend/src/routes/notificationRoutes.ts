import { Router } from "express"
import { protectRoute } from "../middleware/auth"
import * as NotificationController from "../modules/notification/controller/notification.controller"

const router = Router()

router.get("/", protectRoute, NotificationController.getNotifications)
router.get("/unread-count", protectRoute, NotificationController.getUnreadCount)
router.put("/read-all", protectRoute, NotificationController.markAllAsRead)
router.put("/:id/read", protectRoute, NotificationController.markAsRead)

export default router
