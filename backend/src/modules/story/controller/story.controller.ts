import type { NextFunction, Response } from "express"
import type { AuthRequest } from "../../../middleware/auth"
import { Story } from "../model/story.model"

export async function createStory(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId
    const { imageUrl, videoUrl, description } = req.body
    console.log("Creating story with body:", {
      userId,
      imageUrl,
      videoUrl,
      hasDescription: !!description,
    })

    if (!imageUrl) {
      res.status(400).json({ message: "Image URL is required" })
      return
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const story = new Story({
      user: userId,
      imageUrl,
      videoUrl,
      description,
      expiresAt,
      isActive: true,
    })

    try {
      await story.save()
      console.log("Story saved successfully:", {
        id: story._id,
        type: videoUrl ? "video" : "image",
      })
    } catch (saveError: any) {
      console.error("Story save error:", saveError.message)
      res
        .status(400)
        .json({ message: `Failed to save story: ${saveError.message}` })
      return
    }

    const populatedStory = await Story.findById(story._id).populate(
      "user",
      "name username avatar",
    )
    res.status(201).json(populatedStory)
  } catch (error: any) {
    console.error("Internal Story Controller Error:", error.message)
    res.status(500).json({ message: error.message || "Internal Server Error" })
    next(error)
  }
}

export async function getStories(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const stories = await Story.find({
      isActive: true,
      expiresAt: { $gt: new Date() },
    })
      .populate("user", "name username avatar")
      .sort({ createdAt: -1 })
    res.json(stories)
  } catch (error) {
    res.status(500)
    next(error)
  }
}
