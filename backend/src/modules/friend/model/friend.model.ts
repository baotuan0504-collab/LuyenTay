import mongoose, { Schema, Document } from "mongoose";

export interface IFriend extends Document {
  requester: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  status: "pending" | "accepted" | "declined" | "blocked";
  createdAt: Date;
  updatedAt: Date;
}

const FriendSchema: Schema = new Schema(
  {
    requester: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "blocked"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Ensure uniqueness of a friendship between two users
FriendSchema.index({ requester: 1, recipient: 1 }, { unique: true });

export const Friend = mongoose.model<IFriend>("Friend", FriendSchema);
