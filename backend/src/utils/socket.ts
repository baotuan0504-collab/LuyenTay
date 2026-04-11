import { Server as HttpServer } from "http"
import mongoose from "mongoose"
import { Server as SocketServer } from "socket.io"
import { Chat } from "../modules/chat/model/chat.model"
import { Message } from "../modules/message/model/message.model"
import { User } from "../modules/user/model/user.model"
import { verifyToken } from "../utils/auth"

// store online users in memory: userId -> socketId
export const onlineUsers: Map<string, string> = new Map()

export const initializeSocket = (httpServer: HttpServer) => {
  const allowedOrigins = [
    "http://127.0.0.1:8081", // Expo mobile
    "http://127.0.0.1:5173", // Vite web dev
    // "http://192.168.38.103:5173", // vite web devs
    // "http://192.168.38.103:8081", // expo mobile

    process.env.FRONTEND_URL, // production
  ].filter(Boolean) as string[]

  const corsOptions =
    process.env.NODE_ENV === "development"
      ? { origin: true }
      : { origin: allowedOrigins }

  const io = new SocketServer(httpServer, { cors: corsOptions })

  // verify socket connection - if the user is authenticated, we will store the user id in the socket

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token // this is what user will send from client
    if (!token) return next(new Error("Authentication error"))

    try {
      const payload = verifyToken(token)
      const userId =
        typeof payload.userId === "string" ? payload.userId : undefined
      if (!userId) return next(new Error("Authentication error"))

      const user = await User.findById(userId)
      if (!user) return next(new Error("User not found"))

      socket.data.userId = user._id.toString()

      next()
    } catch (error: any) {
      next(new Error(error?.message || "Authentication error"))
    }
  })

  // this "connection" event name is special and should be written like this
  // it's the event that is triggered when a new client connects to the server
  io.on("connection", socket => {
    const userId = socket.data.userId

    // send list of currently online users to the newly connected client
    socket.emit("online-users", { userIds: Array.from(onlineUsers.keys()) })

    // store user in the onlineUsers map
    onlineUsers.set(userId, socket.id)

    // notify others that this current user is online
    socket.broadcast.emit("user-online", { userId })

    socket.join(`user:${userId}`)

    socket.on("join-chat", (chatId: string) => {
      socket.join(`chat:${chatId}`)
    })

    socket.on("leave-chat", (chatId: string) => {
      socket.leave(`chat:${chatId}`)
    })

    // handle sending messages
    socket.on(
      "send-message",
      async (data: { chatId: string; text: string }) => {
        try {
          const { chatId, text } = data

          const chat = await Chat.findOne({
            _id: chatId,
            participants: userId,
          })

          if (!chat) {
            socket.emit("socket-error", { message: "Chat not found" })
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

          await message.populate("sender", "name avatar")

          // emit to chat room (for users inside the chat)
          io.to(`chat:${chatId}`).emit("new-message", message)

          // also emit to participants' personal rooms (for chat list view)
          for (const participantId of chat.participants) {
            io.to(`user:${participantId}`).emit("new-message", message)
          }
        } catch (error) {
          socket.emit("socket-error", { message: "Failed to send message" })
        }
      },
    )

    socket.on("typing", async (data: { chatId: string; isTyping: boolean }) => {
      const typingPayload = {
        userId,
        chatId: data.chatId,
        isTyping: data.isTyping,
      }

      // emit to chat room (for users inside the chat)
      socket.to(`chat:${data.chatId}`).emit("typing", typingPayload)

      // also emit to other participant's personal room (for chat list view)
      try {
        const chat = await Chat.findById(data.chatId)
        if (chat) {
          const otherParticipantId = chat.participants.find(
            (p: any) => p.toString() !== userId,
          )
          if (otherParticipantId) {
            socket
              .to(`user:${otherParticipantId}`)
              .emit("typing", typingPayload)
          }
        }
      } catch (error) {
        // silently fail - typing indicator is not critical
      }
    })

    socket.on("disconnect", () => {
      onlineUsers.delete(userId)

      // notify others
      socket.broadcast.emit("user-offline", { userId })
    })
  })

  return io
}
