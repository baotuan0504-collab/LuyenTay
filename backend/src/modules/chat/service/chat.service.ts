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
        type: data.type || 'PRIVATE',
        name: data.name,
        avatar: data.avatar,
      })
      return await chat.save()
    } catch (error) {
      console.error("Error in createChat:", error)
      throw error
    }
  }

  static async createGroupChat(data: { participants: string[], name: string, avatar?: string, creator: string }) {
    try {
      const chat = new Chat({
        participants: data.participants.map(id => new mongoose.Types.ObjectId(id)),
        type: 'GROUP',
        creator: new mongoose.Types.ObjectId(data.creator),
        name: data.name,
        avatar: data.avatar,
      })
      return await chat.save()
    } catch (error) {
      console.error("Error in createGroupChat:", error)
      throw error
    }
  }

  static async getChatsByUser(userId: string) {
    try {
      const chats = await Chat.find({ participants: userId })
        .populate("participants", "name username avatar publicKey")
        .populate({
          path: "lastMessage",
          populate: { path: "sender", select: "name" },
        })
        .sort({ lastMessageAt: -1 })

      return chats.map(chat => {
        const chatObj = chat.toObject() as any
        
        if (chatObj.type === 'GROUP') {
          return {
            ...chatObj,
            participant: {
              name: chatObj.name,
              avatar: chatObj.avatar,
              _id: chatObj._id, // Group ID
              isGroup: true
            }
          }
        }

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
        "name username avatar publicKey",
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
        .populate("participants", "name username avatar publicKey")
        .populate("lastMessage")

      if (!chat) {
        chat = new Chat({
          participants: [
            new mongoose.Types.ObjectId(userId1),
            new mongoose.Types.ObjectId(userId2),
          ],
        })
        await chat.save()
        await chat.populate("participants", "name username avatar publicKey")
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

  static async deleteChat(chatId: string, userId: string) {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) throw new Error("Chat not found");
      
      // Only creator can delete GROUP chats
      if (chat.type === 'GROUP' && chat.creator?.toString() !== userId) {
        throw new Error("Only group creator can delete this chat");
      }
      
      return await Chat.findByIdAndDelete(chatId);
    } catch (error) {
      console.error("Error in deleteChat:", error)
      throw error
    }
  }

  static async updateChat(chatId: string, userId: string, updateData: { name?: string, avatar?: string, nicknames?: Record<string, string> }) {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) throw new Error("Chat not found");

      // Verify creator for all group info updates
      if (chat.type === 'GROUP' && chat.creator?.toString() !== userId) {
        throw new Error("Only group creator can edit group info");
      }

      if (updateData.name) chat.name = updateData.name;
      if (updateData.avatar) chat.avatar = updateData.avatar;
      
      if (updateData.nicknames) {
        // Update nicknames map
        if (!chat.nicknames) chat.nicknames = new Map();
        for (const [uid, nickname] of Object.entries(updateData.nicknames)) {
          chat.nicknames.set(uid, nickname);
        }
      }

      return await chat.save();
    } catch (error) {
      console.error("Error in updateChat:", error)
      throw error
    }
  }

  static async addParticipants(chatId: string, userId: string, newParticipantIds: string[]) {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) throw new Error("Chat not found");

      // Verify requester is a member of the group
      if (!chat.participants.includes(userId as any)) {
        throw new Error("You must be a member of this group to add others");
      }

      // Filter out existing participants to avoid duplicates
      const currentIds = chat.participants.map(p => p.toString());
      const uniqueNewIds = newParticipantIds.filter(id => !currentIds.includes(id));

      if (uniqueNewIds.length === 0) return chat;

      chat.participants.push(...(uniqueNewIds as any[]));
      return await chat.save();
    } catch (error) {
      console.error("Error in addParticipants:", error)
      throw error
    }
  }
}
