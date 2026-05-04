import mongoose, { Document, Schema } from "mongoose"

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  type: 'REACTION' | 'COMMENT' | 'FRIEND_REQUEST' | 'FRIEND_ACCEPT';
  referenceId?: mongoose.Types.ObjectId;
  referenceType?: 'POST' | 'COMMENT' | 'USER';
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ['REACTION', 'COMMENT', 'FRIEND_REQUEST', 'FRIEND_ACCEPT'], required: true },
    referenceId: { type: Schema.Types.ObjectId },
    referenceType: { type: String, enum: ['POST', 'COMMENT', 'USER'] },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export const Notification = mongoose.model<INotification>("Notification", notificationSchema)
