import type { NextFunction, Response } from "express"
import type { AuthRequest } from "../../../middleware/auth"
import { ApiResponse } from "../../../utils/ApiResponse"
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
      return res.status(400).json(ApiResponse.error("Image URL is required"))
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
      return res
        .status(400)
        .json(ApiResponse.error(`Failed to save story: ${saveError.message}`))
    }

    const populatedStory = await Story.findById(story._id).populate(
      "user",
      "name username avatar",
    )
    res.status(201).json(ApiResponse.success(populatedStory))
  } catch (error: any) {
    console.error("Internal Story Controller Error:", error.message)
    res.status(500).json(ApiResponse.error(error.message || "Internal Server Error"))
    next(error)
  }
}

export async function getStories(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const targetUserId = req.query.userId as string | undefined

    const filter: any = {
      isActive: true,
      expiresAt: { $gt: new Date() },
    }
    
    if (targetUserId) {
      filter.user = targetUserId;
    }

    const stories = await Story.find(filter)
      .populate("user", "name username avatar coverPhoto")
      .sort({ createdAt: -1 })
    res.json(ApiResponse.success(stories))
  } catch (error) {
    res.status(500)
    next(error)
  }
}
