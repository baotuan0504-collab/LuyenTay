import mongoose, { Schema, type Document } from "mongoose";


export interface IPost extends Document {
  user: mongoose.Types.ObjectId;
  imageUrl: string;
  description?: string;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}


const PostSchema = new Schema<IPost>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);


// Index to automatically expire posts (optional, but good for performance)
// PostSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });


export const Post = mongoose.model<IPost>("Post", PostSchema);



