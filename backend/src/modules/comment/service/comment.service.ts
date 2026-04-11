import mongoose from "mongoose"
import { Post } from "../../post/model/post.model"
import { Comment } from "../model/comment.model"

export default class CommentService {
  static async getCommentById(commentId: string) {
    return Comment.findById(commentId)
  }

  static async getPostById(postId: string) {
    return Post.findById(postId)
  }

  static async createComment({
    user,
    targetId,
    targetType,
    content,
    parentId,
  }: {
    user: string
    targetId: string
    targetType: string
    content: string
    parentId?: string
  }) {
    const commentData: any = {
      user: new mongoose.Types.ObjectId(user),
      targetId: new mongoose.Types.ObjectId(targetId),
      targetType,
      content,
    }
    if (parentId) {
      commentData.parentComment = new mongoose.Types.ObjectId(parentId)
    }
    const comment = await Comment.create(commentData)
    if (targetType === "post") {
      await Post.findByIdAndUpdate(targetId, { $inc: { commentCount: 1 } })
    }
    return comment
  }

  static async replyComment({
    user,
    targetId,
    targetType,
    parentComment,
    content,
  }: {
    user: string
    targetId: string
    targetType: string
    parentComment: string
    content: string
  }) {
    const comment = await Comment.create({
      user: new mongoose.Types.ObjectId(user),
      targetId: new mongoose.Types.ObjectId(targetId),
      targetType,
      parentComment: new mongoose.Types.ObjectId(parentComment),
      content,
    })
    if (targetType === "post") {
      await Post.findByIdAndUpdate(targetId, { $inc: { commentCount: 1 } })
    }
    return comment
  }

  static async updateComment(commentId: string, content: string) {
    const updated = await Comment.findByIdAndUpdate(
      commentId,
      { content, isEdited: true },
      { new: true },
    )
    return updated
  }

  static async deleteComment(commentId: string) {
    const comment = await Comment.findById(commentId)
    if (!comment) return null
    const repliesCount = await Comment.countDocuments({
      parentComment: commentId,
    })
    const totalDelete = 1 + repliesCount
    await Comment.deleteMany({
      $or: [{ _id: commentId }, { parentComment: commentId }],
    })
    if (comment.targetType === "post") {
      await Post.findByIdAndUpdate(comment.targetId, {
        $inc: { commentCount: -totalDelete },
      })
    }
    return true
  }

  static async getParentComments({
    targetId,
    targetType,
    skip = 0,
    limit = 20,
  }: {
    targetId: string
    targetType: string
    skip?: number
    limit?: number
  }) {
    return Comment.find({
      targetId,
      targetType,
    })
      .populate("user")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
  }

  static async countParentComments({
    targetId,
    targetType,
  }: {
    targetId: string
    targetType: string
  }) {
    return Comment.countDocuments({
      targetId,
      targetType,
    })
  }

  static async getReplies(parentComment: string) {
    return Comment.find({ parentComment }).populate("user")
  }

  static async getNestedComments({
    targetId,
    targetType,
  }: {
    targetId: string
    targetType: string
  }) {
    return Comment.aggregate([
      {
        $match: {
          targetId: new mongoose.Types.ObjectId(targetId),
          targetType,
          parentComment: null,
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "parentComment",
          as: "replies",
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ])
  }
}
