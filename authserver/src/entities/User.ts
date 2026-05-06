import mongoose, { Schema, Document } from "mongoose"

export interface UserEntity extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  username: string
  email: string
  password: string
  avatar: string
  onboardingCompleted: boolean
  requireOtp: boolean
  trustedDevices: string[]
  lastAccessToken: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<UserEntity>(
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
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    requireOtp: {
      type: Boolean,
      default: true,
    },
    trustedDevices: {
      type: [String],
      default: [],
    },
    lastAccessToken: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
)

export const User = mongoose.model("User", UserSchema)
