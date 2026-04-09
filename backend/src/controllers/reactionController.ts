import type { Response } from "express";
import mongoose from "mongoose";
import type { AuthRequest } from "../middleware/auth";
import { Reaction } from "../models/Rection";

export const upsertReaction = async (req: AuthRequest, res: Response) => {
    try{
      const { targetId, targetType, reactionType } = req.body;
      const user = req.userId;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const updated = await Reaction.findOneAndUpdate(
        { user, targetId, targetType },
        { reactionType },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: "Error upserting reaction" });
    }
}

export const removeReaction = async (req: AuthRequest, res: Response) => {
    try {
        const { targetId, targetType } = req.body;
        const user = req.userId;
        if (!user) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        await Reaction.findOneAndDelete({ user, targetId, targetType });
        res.status(200).json({ message: "Reaction removed" });
    } catch (error) {
        res.status(500).json({ message: "Error removing reaction" });
    }
}

export const getReactionCounts = async (req: AuthRequest, res: Response) => {
    try {
        const targetId = typeof req.query.targetId === "string" ? req.query.targetId : undefined;
        const targetType = typeof req.query.targetType === "string" ? req.query.targetType : undefined;
        if (!targetId || !targetType) {
          return res.status(400).json({ message: "targetId and targetType are required" });
        }
        const reactions = await Reaction.aggregate([
            { $match: { targetId: new mongoose.Types.ObjectId(targetId), targetType } },
            { $group: { _id: "$reactionType", count: { $sum: 1 } } }
        ]);
        res.status(200).json(reactions);
    } catch (error) {
        res.status(500).json({ message: "Error fetching reaction counts" });
    }
}

export const getMyReaction = async (req: AuthRequest, res: Response) => {
    try {
        const targetId = typeof req.query.targetId === "string" ? req.query.targetId : undefined;
        const targetType = typeof req.query.targetType === "string" ? req.query.targetType : undefined;
        const user = req.userId;
        if (!user) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        if (!targetId || !targetType) {
          return res.status(400).json({ message: "targetId and targetType are required" });
        }
        const reaction = await Reaction.findOne({ user, targetId, targetType });
        res.status(200).json(reaction);
    } catch (error) {
        res.status(500).json({ message: "Error fetching my reaction" });
    }
}

;(Reaction as any).castObject = (id : string) => {
    return typeof id === 'string' ? require("mongoose").Types.ObjectId(id) : id;
};