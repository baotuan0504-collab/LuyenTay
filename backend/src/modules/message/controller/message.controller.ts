import type { NextFunction, Request, Response } from "express"
import mongoose from "mongoose"
import { Chat } from "../../chat/model/chat.model"
import { Message } from "../model/message.model"

export class MessageController {
  static async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId || req.body.userId
      const chatId = Array.isArray(req.params.chatId)
        ? req.params.chatId[0]
        : req.params.chatId
      if (!chatId) {
        res.status(400).json({ message: "Chat id is required" })
        return
      }
      const chat = await Chat.findOne({
        _id: chatId,
        participants: new mongoose.Types.ObjectId(userId),
      })
      if (!chat) {
        res.status(404).json({ message: "Chat not found" })
        return
      }
      const messages = await Message.find({ chat: chatId })
        .populate("sender", "name email avatar")
        .sort({ createdAt: 1 })
      res.json(messages)
    } catch (error) {
      res.status(500)
      next(error)
    }
  }

  static async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId || req.body.userId
      const chatId = Array.isArray(req.params.chatId)
        ? req.params.chatId[0]
        : req.params.chatId
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
        participants: userId,
      })
      if (!chat) {
        res.status(404).json({ message: "Chat not found" })
        return
      }
      const message = new Message({
        chat: new mongoose.Types.ObjectId(chatId),
        sender: new mongoose.Types.ObjectId(userId),
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
