import type { Response } from "express"

export const getReactionCounts = async (req: AuthRequest, res: Response) => {
  try {
    const targetId =
      typeof req.query.targetId === "string" ? req.query.targetId : undefined
    const targetType =
      typeof req.query.targetType === "string"
        ? req.query.targetType
        : undefined
    if (!targetId || !targetType) {
      return res
        .status(400)
        .json({ message: "targetId and targetType are required" })
    }
    const reactions = await Reaction.aggregate([
      {
        $match: { targetId: new mongoose.Types.ObjectId(targetId), targetType },
      },
      { $group: { _id: "$reactionType", count: { $sum: 1 } } },
    ])
    res.status(200).json(reactions)
  } catch (error) {
    res.status(500).json({ message: "Error fetching reaction counts" })
  }
}

export const getMyReaction = async (req: AuthRequest, res: Response) => {
  try {
    const targetId =
      typeof req.query.targetId === "string" ? req.query.targetId : undefined
    const targetType =
      typeof req.query.targetType === "string"
        ? req.query.targetType
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
    const reaction = await Reaction.findOne({ user, targetId, targetType })
    res.status(200).json(reaction)
  } catch (error) {
    res.status(500).json({ message: "Error fetching my reaction" })
  }
}

export const getReactionUsers = async (req: AuthRequest, res: Response) => {
  try {
    const targetId =
      typeof req.query.targetId === "string" ? req.query.targetId : undefined
    const targetType =
      typeof req.query.targetType === "string"
        ? req.query.targetType
        : undefined
    if (!targetId || !targetType) {
      return res
        .status(400)
        .json({ message: "targetId and targetType are required" })
    }
    const reactions = await Reaction.find({
      targetId: mongoose.Types.ObjectId.isValid(targetId)
        ? new mongoose.Types.ObjectId(targetId)
        : targetId,
      targetType,
    })
      .populate("user", "name username profile_image_url")
      .sort({ createdAt: -1 })
    res.status(200).json(reactions)
  } catch (error) {
    res.status(500).json({ message: "Error fetching reaction users" })
  }
}
;(Reaction as any).castObject = (id: string) => {
  return typeof id === "string" ? require("mongoose").Types.ObjectId(id) : id
}
