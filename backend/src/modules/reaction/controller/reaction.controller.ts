import type { Response } from "express"
import mongoose from "mongoose"
import type { AuthRequest } from "../../../middleware/auth"
import { Reaction } from "../model/reaction.model"

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
    if (!targetId || !targetType) {
      return res
        .status(400)
        .json({ message: "targetId and targetType are required" })
    }
    const counts = await Reaction.aggregate([
      { $match: { targetId, targetType } },
      { $group: { _id: "$reactionType", count: { $sum: 1 } } },
    ])
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

  export const upsertReaction = async (req: AuthRequest, res: Response) => {
    try {
      const { targetId, targetType, reactionType } = req.body
      const user = req.userId
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" })
      }
      const updated = await Reaction.findOneAndUpdate(
        { user, targetId, targetType },
        { reactionType },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      res.status(200).json(updated)
    } catch (error) {
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
}
