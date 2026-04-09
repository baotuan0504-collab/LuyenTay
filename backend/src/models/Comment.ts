import mongoose, { Schema, type Document } from "mongoose";

export interface IComment extends Document {
    user: mongoose.Types.ObjectId;
    targetId: mongoose.Types.ObjectId;
    targetType: 'post' | 'comment';
    parentComment?: mongoose.Types.ObjectId;    
    content: string;
    isEdited: boolean;
    createdAt: Date;    
    updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        targetId: { type: Schema.Types.ObjectId, required: true },
        targetType: { type: String, enum: ["post", "comment"], required: true },
        parentComment: { type: Schema.Types.ObjectId, ref: "Comment" },
        content: { type: String, required: true, trim : true },
        isEdited: { type: Boolean, default: false },
    },
    { timestamps: true }
);

CommentSchema.index({ targetId: 1, targetType: 1 });
CommentSchema.index({ parentComment: 1 });

export const Comment = mongoose.model<IComment>("Comment", CommentSchema);