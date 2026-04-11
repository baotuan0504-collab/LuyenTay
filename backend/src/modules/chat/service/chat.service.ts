import mongoose from "mongoose"
import type { CreateChatDto } from "../dto/chat.dto"
import { Chat } from "../model/chat.model"

export class ChatService {
  static async createChat(data: CreateChatDto) {
    const chat = new Chat({
      participants: data.participants.map(
        id => new mongoose.Types.ObjectId(id),
      ),
    })
    return chat.save()
  }

  static async getChatsByUser(userId: string) {
    return Chat.find({ participants: userId })
      .populate("participants", "name username avatar")
      .sort({ lastMessageAt: -1 })
  }

  static async getChatById(chatId: string) {
    return Chat.findById(chatId).populate(
      "participants",
      "name username avatar",
    )
  }

  static async addMessageToChat(chatId: string, messageId: string) {
    return Chat.findByIdAndUpdate(
      chatId,
      { lastMessage: messageId, lastMessageAt: new Date() },
      { new: true },
    )
  }
}
