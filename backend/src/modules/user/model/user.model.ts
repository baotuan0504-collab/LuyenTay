import mongoose, { Schema, type Document } from "mongoose"

export interface IUser extends Document {
  name: string
  username?: string
  email: string
  password: string
  avatar: string
  coverPhoto?: string
  onboardingCompleted?: boolean
  publicKey?: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      default: "",
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    coverPhoto: {
      type: String,
      default: "",
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    publicKey: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
)

export const User = mongoose.model("User", UserSchema)
