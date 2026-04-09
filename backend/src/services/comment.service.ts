import mongoose from "mongoose"
import { Comment } from "../models/Comment"
import { Post } from "../models/Post"


export default class CommentService {
  // Tạo comment cha
  static async createComment({
    user,
    targetId,
    targetType,
    content,
  }: {
    user: string
    targetId: string
    targetType: string
    content: string
  }) {
    const comment = await Comment.create({
      user: new mongoose.Types.ObjectId(user),
      targetId: new mongoose.Types.ObjectId(targetId),
      targetType,
      content,
    })
    // Tăng commentCount cho post
    if (targetType === "post") {
      await Post.findByIdAndUpdate(targetId, { $inc: { commentCount: 1 } })
    }
    return comment
  }


  // Reply comment (comment con)
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
    // Tăng commentCount cho post
    if (targetType === "post") {
      await Post.findByIdAndUpdate(targetId, { $inc: { commentCount: 1 } })
    }
    return comment
  }


  // Update comment
  static async updateComment(commentId: string, content: string) {
    const updated = await Comment.findByIdAndUpdate(
      commentId,
      { content, isEdited: true },
      { new: true },
    )
    return updated
  }


  // Delete comment + reply
  static async deleteComment(commentId: string) {
    // Lấy comment để biết targetId, targetType
    const comment = await Comment.findById(commentId)
    if (!comment) return null
    // Đếm tổng số comment bị xoá (cha + reply)
    const repliesCount = await Comment.countDocuments({
      parentComment: commentId,
    })
    const totalDelete = 1 + repliesCount
    // Xoá comment cha và các reply
    await Comment.deleteMany({
      $or: [{ _id: commentId }, { parentComment: commentId }],
    })
    // Giảm commentCount cho post
    if (comment.targetType === "post") {
      await Post.findByIdAndUpdate(comment.targetId, {
        $inc: { commentCount: -totalDelete },
      })
    }
    return true
  }


  // Lấy danh sách comment cha (simple query)
  static async getParentComments({
    targetId,
    targetType,
  }: {
    targetId: string
    targetType: string
  }) {
    return Comment.find({
      targetId,
      targetType,
      parentComment: null,
    })
      .populate("user")
      .sort({ createdAt: -1 })
  }


  // Lấy reply comment cho 1 comment cha
  static async getReplies(parentComment: string) {
    return Comment.find({ parentComment }).populate("user")
  }


  // Lấy danh sách comment dạng nested (aggregate)
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



