import mongoose from "mongoose"
import { IReactionRepository, ReactionRepository } from "../../repositories/ReactionRepository"
import { getIO } from "../../utils/socket"
import { Comment } from "../comment/comment.entity"
import { Notification } from "../notification/model/notification.model"
import { Post } from "../post/post.entity"
import { Story } from "../story/story.entity"
import { ReactionResponseDto, UpsertReactionDto } from "./reaction.dto"
import { IReactionService } from "./reaction.interface"

export class ReactionService implements IReactionService {
  private reactionRepository: IReactionRepository

  constructor(reactionRepository: IReactionRepository = new ReactionRepository()) {
    this.reactionRepository = reactionRepository
  }

  async getMyReaction(userId: string, targetId: string, targetType: string): Promise<ReactionResponseDto | null> {
    const reaction = await this.reactionRepository.findOne({ user: userId, targetId, targetType })
    return reaction ? new ReactionResponseDto(reaction) : null
  }

  async getReactionCounts(targetId: string, targetType: string): Promise<any[]> {
    const mongoTargetId = mongoose.Types.ObjectId.isValid(targetId)
      ? new mongoose.Types.ObjectId(targetId)
      : targetId

    return await this.reactionRepository.aggregate([
      {
        $match: {
          targetId: mongoTargetId,
          targetType
        }
      },
      { $group: { _id: "$reactionType", count: { $sum: 1 } } },
    ])
  }

  async getReactionUsers(targetId: string, targetType: string, reactionType?: string): Promise<ReactionResponseDto[]> {
    const filter: any = { targetId, targetType }
    if (reactionType) filter.reactionType = reactionType
    const reactions = await this.reactionRepository.find(filter)
    return reactions.map(r => new ReactionResponseDto(r))
  }

  async upsertReaction(userId: string, dto: UpsertReactionDto): Promise<ReactionResponseDto> {
    const isNew = !(await this.reactionRepository.findOne({
      user: userId,
      targetId: dto.targetId,
      targetType: dto.targetType,
    }))

    const reaction = await this.reactionRepository.findOneAndUpdate(
      { user: userId, targetId: dto.targetId, targetType: dto.targetType },
      { reactionType: dto.reactionType },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    if (isNew && reaction) {
      await this.handleNotification(userId, dto.targetId, dto.targetType)
    }

    return new ReactionResponseDto(reaction)
  }

  async removeReaction(userId: string, targetId: string, targetType: string): Promise<boolean> {
    const result = await this.reactionRepository.findOneAndDelete({ user: userId, targetId, targetType })
    return !!result
  }

  private async handleNotification(senderId: string, targetId: string, targetType: string) {
    try {
      let recipientId: any
      let normalizedType = targetType.toLowerCase()

      if (normalizedType === "post") {
        const post = await Post.findById(targetId)
        if (post) recipientId = post.user
      } else if (normalizedType === "comment") {
        const comment = await Comment.findById(targetId)
        if (comment) recipientId = comment.user
      } else if (normalizedType === "story") {
        const story = await Story.findById(targetId)
        if (story) recipientId = story.user
      }

      if (recipientId && recipientId.toString() !== senderId) {
        const notification = new Notification({
          recipient: recipientId,
          sender: senderId,
          type: "REACTION",
          referenceId: targetId,
          referenceType: normalizedType.toUpperCase(),
        })
        await notification.save()
        await notification.populate("sender", "name username avatar")

        const payload = notification.toObject() as any

        // Find root postId for comments to help frontend navigation
        if (normalizedType === "comment") {
          payload.postId = await this.getRootPostId(targetId)
        } else if (normalizedType === "post") {
          payload.postId = targetId
        }

        const io = getIO()
        io.to(`user:${recipientId.toString()}`).emit("new-notification", payload)
      }
    } catch (error) {
      console.error("[ReactionService] Notification error:", error)
    }
  }

  private async getRootPostId(commentId: string): Promise<string | null> {
    let currentId = commentId
    while (currentId) {
      const comment = await Comment.findById(currentId)
      if (!comment) break
      if (comment.targetType === "post") return comment.targetId.toString()
      currentId = comment.targetId.toString()
    }
    return null
  }
}
