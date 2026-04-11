import mongoose, { Schema, type Document } from "mongoose"

export interface IStory extends Document {
  user: mongoose.Types.ObjectId
  imageUrl: string
  videoUrl?: string
  description?: string
  expiresAt: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const StorySchema = new Schema<IStory>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    imageUrl: { type: String, required: true },
    videoUrl: { type: String, required: false },
    description: { type: String, required: false },
    expiresAt: { type: Date, required: true },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "stories",
  },
)

// TTL index: expire the document exactly at the value of 'expiresAt'
StorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const Story = mongoose.model<IStory>("Story", StorySchema)
