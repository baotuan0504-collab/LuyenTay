import mongoose, { Schema, type Document } from "mongoose"

export interface IChat extends Document {
  participants: mongoose.Types.ObjectId[]
  type: 'PRIVATE' | 'GROUP'
  creator?: mongoose.Types.ObjectId
  name?: string
  avatar?: string
  lastMessage?: mongoose.Types.ObjectId
  lastMessageAt?: Date
  createdAt: Date
  updatedAt: Date
}

const ChatSchema = new Schema<IChat>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    type: {
      type: String,
      enum: ['PRIVATE', 'GROUP'],
      default: 'PRIVATE',
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    name: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

export const Chat = mongoose.model("Chat", ChatSchema)
