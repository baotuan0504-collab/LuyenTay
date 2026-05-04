import type { Response } from "express"
import type { AuthRequest } from "../../../middleware/auth"
import { Notification } from "../model/notification.model"
import mongoose from "mongoose"

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.userId
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" })
    }
    
    // Fetch notifications sorted by newest first
    const objectIdUser = new mongoose.Types.ObjectId(user)
    console.log(`[Notification API] Fetching notifications for recipient: ${objectIdUser}`);
    const notifications = await Notification.find({ recipient: objectIdUser })
      .populate("sender", "name username avatar")
      .sort({ createdAt: -1 })
      .limit(50) // Limit to latest 50 for performance
      
    console.log(`[Notification API] Found ${notifications.length} notifications for user ${user}`);

    res.json(notifications)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    res.status(500).json({ message: "Error fetching notifications" })
  }
}

export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.userId
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" })
    }
    
    const count = await Notification.countDocuments({ recipient: new mongoose.Types.ObjectId(user), isRead: false })
    res.json({ unreadCount: count })
  } catch (error) {
    res.status(500).json({ message: "Error fetching unread count" })
  }
}

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.userId
    const { id } = req.params
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" })
    }
    
    const updated = await Notification.findOneAndUpdate(
      { _id: id, recipient: user },
      { isRead: true },
      { new: true }
    )
    res.json(updated)
  } catch (error) {
    res.status(500).json({ message: "Error marking notification as read" })
  }
}

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.userId
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" })
    }
    
    await Notification.updateMany(
      { recipient: user, isRead: false },
      { isRead: true }
    )
    res.json({ message: "All notifications marked as read" })
  } catch (error) {
    res.status(500).json({ message: "Error marking all notifications as read" })
  }
}
