import mongoose, { Schema, type Document } from "mongoose";

export interface IStory extends Document {
    user: mongoose.Types.ObjectId;
    imageUri: string;
    videoUri?: string;
    description?: string;
    expiresAt: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const StorySchema = new Schema<IStory>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        imageUri: { type: String, required: true },
        videoUri: { type: String, required: false },
        description: { type: String, required: false },
        expiresAt: { type: Date, required: true , index:{ expires: 0 }},
        isActive:{
            type: Boolean,
            default: true
        }

    },
    { timestamps: true }
)
export const Story = mongoose.model<IStory>("Story", StorySchema);