import type { Response } from "express"
import mongoose from "mongoose"
import type { AuthRequest } from "../../../middleware/auth"
import { Reaction } from "../model/reaction.model"
import { Post } from "../../post/model/post.model"
import { Comment } from "../../comment/model/comment.model"
import { Notification } from "../../notification/model/notification.model"
import { getIO } from "../../../utils/socket"

// Get the current user's reaction for a target
export const getMyReaction = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.userId
    const { targetId, targetType } = req.query
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" })
    }
    if (!targetId || !targetType) {
      return res
        .status(400)
        .json({ message: "targetId and targetType are required" })
    }
    const reaction = await Reaction.findOne({
      user,
      targetId,
      targetType,
    })
    res.json(reaction)
  } catch (error) {
    res.status(500).json({ message: "Error fetching reaction" })
  }
}

// Get reaction counts for a target
export const getReactionCounts = async (req: AuthRequest, res: Response) => {
  try {
    const { targetId, targetType } = req.query
    console.log(`[DEBUG] getReactionCounts query:`, { targetId, targetType })
    const mongoTargetId = mongoose.Types.ObjectId.isValid(String(targetId))
      ? new mongoose.Types.ObjectId(String(targetId))
      : targetId

    const counts = await Reaction.aggregate([
      { 
        $match: { 
          targetId: mongoTargetId,
          targetType 
        } 
      },
      { $group: { _id: "$reactionType", count: { $sum: 1 } } },
    ])
    console.log(`[DEBUG] Aggregation result for ${targetId}:`, JSON.stringify(counts))
    res.json(counts)
  } catch (error) {
    res.status(500).json({ message: "Error fetching reaction counts" })
  }
}

// Get users who reacted to a target
export const getReactionUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { targetId, targetType, reactionType } = req.query
    if (!targetId || !targetType) {
      return res
        .status(400)
        .json({ message: "targetId and targetType are required" })
    }
    const filter: any = { targetId, targetType }
    if (reactionType) filter["reactionType"] = reactionType
    const reactions = await Reaction.find(filter).populate(
      "user",
      "name username avatar",
    )
    res.json(reactions)
  } catch (error) {
    res.status(500).json({ message: "Error fetching reaction users" })
  }
}

export const upsertReaction = async (req: AuthRequest, res: Response) => {
  try {
    const { targetId, targetType, reactionType } = req.body
    const user = req.userId
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" })
    }
    const isNew = !await Reaction.findOne({ user, targetId, targetType });

    const updated = await Reaction.findOneAndUpdate(
      { user, targetId, targetType },
      { reactionType },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )

    if (isNew) {
      // Find recipient
      let recipientId;
      if (targetType === "POST" || targetType === "post") {
        const post = await Post.findById(targetId);
        if (post) recipientId = post.user;
      } else if (targetType === "COMMENT" || targetType === "comment") {
        const comment = await Comment.findById(targetId);
        if (comment) recipientId = comment.user;
      }

      if (recipientId && recipientId.toString() !== user) {
        const notification = new Notification({
          recipient: recipientId,
          sender: user,
          type: "REACTION",
          referenceId: targetId,
          referenceType: targetType === "POST" || targetType === "post" ? "POST" : "COMMENT",
        });
        await notification.save();
        await notification.populate("sender", "name username avatar");

        const payload = notification.toObject() as any;
        
        let rootPostId = targetType === "POST" || targetType === "post" ? targetId : null;
        if (!rootPostId && (targetType === "COMMENT" || targetType === "comment")) {
          let currentCommentId = targetId;
          while (currentCommentId) {
            const comment = await Comment.findById(currentCommentId);
            if (!comment) break;
            if (comment.targetType === "post") {
              rootPostId = comment.targetId;
              break;
            } else {
              currentCommentId = comment.targetId;
            }
          }
        }
        payload.postId = rootPostId;

        try {
          const io = getIO();
          io.to(`user:${recipientId.toString()}`).emit("new-notification", payload);
        } catch (e) {
          console.error("Socket emit failed", e);
        }
      }
    }

    res.status(200).json(updated)
  } catch (error) {
    console.error("Error upserting reaction:", error);
    res.status(500).json({ message: "Error upserting reaction" })
  }
}

export const removeReaction = async (req: AuthRequest, res: Response) => {
  try {
    const targetId =
      typeof req.query.targetId === "string"
        ? req.query.targetId
        : typeof req.body.targetId === "string"
          ? req.body.targetId
          : undefined
    const targetType =
      typeof req.query.targetType === "string"
        ? req.query.targetType
        : typeof req.body.targetType === "string"
          ? req.body.targetType
          : undefined
    const user = req.userId
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" })
    }
    if (!targetId || !targetType) {
      return res
        .status(400)
        .json({ message: "targetId and targetType are required" })
    }
    const query = {
      user: mongoose.Types.ObjectId.isValid(user)
        ? new mongoose.Types.ObjectId(user)
        : user,
      targetType,
      targetId: mongoose.Types.ObjectId.isValid(targetId)
        ? new mongoose.Types.ObjectId(targetId)
        : targetId,
    }
    await Reaction.findOneAndDelete(query)
    res.status(200).json({ message: "Reaction removed" })
  } catch (error) {
    res.status(500).json({ message: "Error removing reaction" })
  }
}
