import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import { Story } from "../models/Story";

export async function createStory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    const { imageUri, videoUri, description } = req.body;

    if (!imageUri) {
      res.status(400).json({ message: "Image URI is required" });
      return;
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // expires in 24 hours

    const story = new Story({
      user: userId,
      imageUri,
      videoUri,
      description,
      expiresAt,
      isActive: true,
    });

    await story.save();

    const populatedStory = await Story.findById(story._id).populate("user", "name username avatar");
    res.status(201).json(populatedStory);
  } catch (error) {
    res.status(500);
    next(error);
  }
}

export async function getStories(req: AuthRequest, res: Response, next: NextFunction) {
  try {
     const stories = await Story.find({ isActive: true, expiresAt: { $gt: new Date() }})
        .populate("user", "name username avatar")
        .sort({ createdAt: -1 });
    res.json(stories);
  } catch (error) {
    res.status(500);
    next(error);
  }
}