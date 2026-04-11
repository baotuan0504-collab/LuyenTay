import type { NextFunction, Response } from "express"
import type { AuthRequest } from "../../../middleware/auth"
import { Post } from "../model/post.model"

export async function createPost(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId
    const { imageUrl, videoUrl, description } = req.body

    if (!imageUrl && !videoUrl) {
      res
        .status(400)
        .json({ message: "Either Image URL or Video URL is required" })
      return
    }

    // Calculate expiration time (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const post = new Post({
      user: userId,
      imageUrl,
      videoUrl,
      description,
      expiresAt,
      isActive: true,
    })

    await post.save()

    // Populate user info for the response
    const populatedPost = await Post.findById(post._id).populate(
      "user",
      "name username avatar",
    )

    res.status(201).json(populatedPost)
  } catch (error) {
    res.status(500)
    next(error)
  }
}

export async function getPosts(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    // Fetch all posts, including multiple posts per user
    const posts = await Post.find({})
      .populate("user", "name username avatar")
      .sort({ createdAt: -1 })

    res.json(posts)
  } catch (error) {
    res.status(500)
    next(error)
  }
}

export async function getPostById(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params
    const post = await Post.findById(id).populate(
      "user",
      "name username avatar",
    )
    if (!post) {
      res.status(404).json({ message: "Post not found" })
      return
    }
    res.json(post)
  } catch (error) {
    res.status(500).json({ message: "Internal server error" })
  }
}
