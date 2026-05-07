import type { NextFunction, Response } from "express"
import type { AuthRequest } from "../../../middleware/auth"
import { ApiResponse } from "../../../utils/ApiResponse"
import { Reaction } from "../../reaction/model/reaction.model"
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
      return res
        .status(400)
        .json(ApiResponse.error("Either Image URL or Video URL is required"))
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

    res.status(201).json(ApiResponse.success(populatedPost))
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
    const userId = req.userId
    const targetUserId = req.query.userId as string | undefined

    const filter = targetUserId ? { user: targetUserId } : {}

    // Fetch all posts, optionally filtered by user, including multiple posts per user
    const posts = await Post.find(filter)
      .populate("user", "name username avatar coverPhoto")
      .sort({ createdAt: -1 })

    // Lấy reactionCounts và myReaction cho mỗi post
    const postIds = posts.map(p => p._id)
    // Lấy tất cả reaction cho các post này
    const allReactions = await Reaction.find({
      targetId: { $in: postIds },
      targetType: "post",
    })

    // Gom reactionCounts cho từng post
    const reactionCountsMap = {}
    allReactions.forEach(r => {
      const pid = r.targetId.toString()
      if (!reactionCountsMap[pid]) reactionCountsMap[pid] = {}
      reactionCountsMap[pid][r.reactionType] =
        (reactionCountsMap[pid][r.reactionType] || 0) + 1
    })

    // Nếu có userId, lấy myReaction cho từng post
    const myReactionMap = {}
    if (userId) {
      allReactions.forEach(r => {
        if (r.user.toString() === userId.toString()) {
          myReactionMap[r.targetId.toString()] = r.reactionType
        }
      })
    }

    // Trả về posts kèm reactionCounts và myReaction
    const result = posts.map(post => ({
      ...post.toObject(),
      reactionCounts: reactionCountsMap[post._id.toString()] || {},
      myReaction: myReactionMap[post._id.toString()] || null,
    }))
    res.json(ApiResponse.success(result))
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
      return res.status(404).json(ApiResponse.error("Post not found"))
    }
    res.json(ApiResponse.success(post))
  } catch (error) {
    res.status(500).json(ApiResponse.error("Internal server error"))
  }
}

export async function updatePost(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params
    const userId = req.userId
    const { description, imageUrl, videoUrl, isActive } = req.body

    const post = await Post.findById(id)
    if (!post) {
      return res.status(404).json(ApiResponse.error("Post not found"))
    }

    // Kiểm tra quyền: Chỉ chủ bài viết mới được sửa
    if (post.user.toString() !== userId?.toString()) {
      return res.status(403).json(ApiResponse.error("Unauthorized to update this post"))
    }

    // Cập nhật các trường dữ liệu
    if (description !== undefined) post.description = description
    if (imageUrl !== undefined) post.imageUrl = imageUrl
    if (videoUrl !== undefined) post.videoUrl = videoUrl
    if (isActive !== undefined) post.isActive = isActive

    await post.save()
    
    const updatedPost = await Post.findById(id).populate("user", "name username avatar")
    res.json(ApiResponse.success(updatedPost))
  } catch (error) {
    res.status(500)
    next(error)
  }
}

export async function deletePost(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params
    const userId = req.userId

    const post = await Post.findById(id)
    if (!post) {
      return res.status(404).json(ApiResponse.error("Post not found"))
    }

    // Kiểm tra quyền: Chỉ chủ bài viết mới được xóa
    if (post.user.toString() !== userId?.toString()) {
      return res.status(403).json(ApiResponse.error("Unauthorized to delete this post"))
    }

    await Post.findByIdAndDelete(id)
    res.json(ApiResponse.success({ message: "Post deleted successfully" }))
  } catch (error) {
    res.status(500)
    next(error)
  }
}
