import mongoose, { Document, Schema } from "mongoose"

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
  school: string
  hometown: string
  relationship: string
  birthday: string
  interests: string
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
      default: "https://i.pravatar.cc/150",
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    requireOtp: {
      type: Boolean,
      default: false,
    },
    trustedDevices: {
      type: [String],
      default: [],
    },
    lastAccessToken: {
      type: String,
      default: "",
    },
    school: {
      type: String,
      default: "",
    },
    hometown: {
      type: String,
      default: "",
    },
    relationship: {
      type: String,
      default: "",
    },
    birthday: {
      type: String,
      default: "",
    },
    interests: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
)

export const User = mongoose.model("User", UserSchema)
