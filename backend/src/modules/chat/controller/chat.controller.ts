import type { NextFunction, Request, Response } from "express"
import type { AuthRequest } from "../../../middleware/auth"
import { ChatService } from "../service/chat.service"

export class ChatController {
  static async createChat(req: Request, res: Response, next: NextFunction) {
    try {
      const chat = await ChatService.createChat(req.body)
      res.status(201).json(chat)
    } catch (error) {
      next(error)
    }
  }

  static async getChatsByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).userId
      console.log(`[DEBUG] getChatsByUser: userId=${userId}`)

      if (!userId || typeof userId !== "string") {
        return res.status(401).json({ message: "Unauthorized" })
      }

      const chats = await ChatService.getChatsByUser(userId)
      console.log(`[DEBUG] getChatsByUser: Success, found ${chats.length} chats`)
      res.json(chats)
    } catch (error) {
      console.error("[DEBUG] getChatsByUser: Error", error)
      next(error)
    }
  }

  static async getOrCreateChat(req: Request, res: Response, next: NextFunction) {
    try {
      const userId1 = (req as AuthRequest).userId
      const userId2 = req.params.participantId as string
      
      console.log(`[DEBUG] getOrCreateChat: userId1=${userId1}, userId2=${userId2}`)

      if (!userId1 || typeof userId1 !== "string") {
        console.log("[DEBUG] getOrCreateChat: No valid userId1 found")
        return res.status(401).json({ message: "Unauthorized" })
      }

      if (!userId2) {
        return res.status(400).json({ message: "Participant ID is required" })
      }

      const chat = await ChatService.getOrCreateChat(userId1, userId2)
      console.log(`[DEBUG] getOrCreateChat: Success, chatId=${chat._id}`)
      res.json(chat)
    } catch (error) {
      console.error("[DEBUG] getOrCreateChat: Error", error)
      next(error)
    }
  }

  static async getChatById(req: Request, res: Response, next: NextFunction) {
    try {
      const chatId = req.params.chatId as string
      if (!chatId) {
        return res.status(400).json({ message: "Chat ID is required" })
      }
      const chat = await ChatService.getChatById(chatId)
      if (!chat) return res.status(404).json({ message: "Chat not found" })
      res.json(chat)
    } catch (error) {
      next(error)
    }
  }
}
