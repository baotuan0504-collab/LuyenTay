import type { NextFunction, Request, Response } from "express"
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
      const userId = req.params.userId
      const chats = await ChatService.getChatsByUser(userId)
      res.json(chats)
    } catch (error) {
      next(error)
    }
  }

  static async getChatById(req: Request, res: Response, next: NextFunction) {
    try {
      const chatId = req.params.chatId
      const chat = await ChatService.getChatById(chatId)
      if (!chat) return res.status(404).json({ message: "Chat not found" })
      res.json(chat)
    } catch (error) {
      next(error)
    }
  }
}
