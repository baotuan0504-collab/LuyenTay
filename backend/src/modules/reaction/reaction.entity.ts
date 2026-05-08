import mongoose, { Schema, type Document } from "mongoose"
export interface IReaction extends Document {
  user: mongoose.Types.ObjectId
  targetId: mongoose.Types.ObjectId
  targetType: "post" | "comment" | "story"
  reactionType: "like" | "love" | "haha" | "wow" | "sad" | "angry"
  createdAt: Date
  updatedAt: Date
}

const ReactionSchema = new Schema<IReaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    targetType: {
      type: String,
      enum: ["post", "comment", "story"],
      required: true,
    },
    reactionType: {
      type: String,
      enum: ["like", "love", "haha", "wow", "sad", "angry"],
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

ReactionSchema.index({ user: 1, targetId: 1, targetType: 1 }, { unique: true })
export const Reaction = mongoose.model<IReaction>("Reaction", ReactionSchema)
