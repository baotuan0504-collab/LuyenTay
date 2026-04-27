import mongoose from "mongoose"
import type { CreateChatDto } from "../dto/chat.dto"
import { Chat } from "../model/chat.model"

export class ChatService {
  static async createChat(data: CreateChatDto) {
    try {
      const chat = new Chat({
        participants: data.participants.map(
          id => new mongoose.Types.ObjectId(id),
        ),
      })
      return await chat.save()
    } catch (error) {
      console.error("Error in createChat:", error)
      throw error
    }
  }

  static async getChatsByUser(userId: string) {
    try {
      const chats = await Chat.find({ participants: userId })
        .populate("participants", "name username avatar")
        .populate({
          path: "lastMessage",
          populate: { path: "sender", select: "name" },
        })
        .sort({ lastMessageAt: -1 })

      return chats.map(chat => {
        const chatObj = chat.toObject() as any
        const otherParticipant = chatObj.participants.find(
          (p: any) => p._id.toString() !== userId,
        )
        return {
          ...chatObj,
          participant: otherParticipant || null,
        }
      })
    } catch (error) {
      console.error("Error in getChatsByUser:", error)
      throw error
    }
  }

  static async getChatById(chatId: string) {
    try {
      return await Chat.findById(chatId).populate(
        "participants",
        "name username avatar",
      )
    } catch (error) {
      console.error("Error in getChatById:", error)
      throw error
    }
  }

  static async getOrCreateChat(userId1: string, userId2: string) {
    try {
      let chat = await Chat.findOne({
        participants: { $all: [userId1, userId2] },
      })
        .populate("participants", "name username avatar")
        .populate("lastMessage")

      if (!chat) {
        chat = new Chat({
          participants: [
            new mongoose.Types.ObjectId(userId1),
            new mongoose.Types.ObjectId(userId2),
          ],
        })
        await chat.save()
        await chat.populate("participants", "name username avatar")
      }

      const chatObj = chat.toObject() as any
      const otherParticipant = chatObj.participants.find(
        (p: any) => p._id.toString() !== userId1,
      )

      return {
        ...chatObj,
        participant: otherParticipant || null,
      }
    } catch (error) {
      console.error("Error in getOrCreateChat:", error)
      throw error
    }
  }

  static async addMessageToChat(chatId: string, messageId: string) {
    try {
      return await Chat.findByIdAndUpdate(
        chatId,
        { lastMessage: messageId, lastMessageAt: new Date() },
        { new: true },
      )
    } catch (error) {
      console.error("Error in addMessageToChat:", error)
      throw error
    }
  }
}
