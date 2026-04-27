import type { NextFunction, Request, Response } from "express"
import mongoose from "mongoose"
import { Chat } from "../../chat/model/chat.model"
import { Message } from "../model/message.model"

export class MessageController {
  static async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId || req.body.userId
      const chatId = (Array.isArray(req.params.chatId)
        ? req.params.chatId[0]
        : req.params.chatId) as string
      if (!chatId) {
        res.status(400).json({ message: "Chat id is required" })
        return
      }

      // Pagination parameters
      const limit = parseInt(req.query.limit as string) || 20
      const before = req.query.before as string

      const chat = await Chat.findOne({
        _id: chatId,
        participants: new mongoose.Types.ObjectId(userId as string),
      })
      if (!chat) {
        res.status(404).json({ message: "Chat not found" })
        return
      }

      const query: any = { chat: chatId }
      if (before) {
        query.createdAt = { $lt: new Date(before) }
      }

      const messages = await Message.find(query)
        .populate("sender", "name email avatar")
        .sort({ createdAt: -1 }) // Get latest first for pagination
        .limit(limit)

      res.json(messages)
    } catch (error) {
      res.status(500)
      next(error)
    }
  }

  static async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId || req.body.userId
      const chatId = (Array.isArray(req.params.chatId)
        ? req.params.chatId[0]
        : req.params.chatId) as string
      const { text } = req.body
      if (!chatId) {
        res.status(400).json({ message: "Chat id is required" })
        return
      }
      if (!text) {
        res.status(400).json({ message: "Message text is required" })
        return
      }
      const chat = await Chat.findOne({
        _id: chatId,
        participants: userId as string,
      })
      if (!chat) {
        res.status(404).json({ message: "Chat not found" })
        return
      }
      const message = new Message({
        chat: new mongoose.Types.ObjectId(chatId),
        sender: new mongoose.Types.ObjectId(userId as string),
        text,
      })
      await message.save()
      chat.lastMessage = message._id
      chat.lastMessageAt = new Date()
      await chat.save()
      await message.populate("sender", "name email avatar")
      res.status(201).json(message)
    } catch (error) {
      res.status(500)
      next(error)
    }
  }
}
