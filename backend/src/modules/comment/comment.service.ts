import mongoose from "mongoose"
import { CommentRepository, ICommentRepository } from "../../repositories/CommentRepository"
import { Post } from "../post/post.entity"
import { CommentResponseDto, CreateCommentDto, UpdateCommentDto } from "./comment.dto"
import { ICommentService } from "./comment.interface"

export class CommentService implements ICommentService {
  private commentRepository: ICommentRepository

  constructor(commentRepository: ICommentRepository = new CommentRepository()) {
    this.commentRepository = commentRepository
  }

  async createComment(userId: string, dto: CreateCommentDto): Promise<CommentResponseDto> {
    const commentData: any = {
      user: new mongoose.Types.ObjectId(userId),
      targetId: new mongoose.Types.ObjectId(dto.targetId),
      targetType: dto.targetType,
      content: dto.content,
    }
    if (dto.parentId) {
      commentData.parentComment = new mongoose.Types.ObjectId(dto.parentId)
    }

    const comment = await this.commentRepository.create(commentData)
    
    // Increment post comment count if target is a post
    if (dto.targetType === "post") {
      await Post.findByIdAndUpdate(dto.targetId, { $inc: { commentCount: 1 } })
    }

    const populated = await this.commentRepository.findById(comment._id.toString())
    return new CommentResponseDto(populated)
  }

  async updateComment(commentId: string, dto: UpdateCommentDto): Promise<CommentResponseDto> {
    const updated = await this.commentRepository.findByIdAndUpdate(commentId, {
      content: dto.content,
      isEdited: true
    })
    if (!updated) throw new Error("Comment not found")
    
    const populated = await this.commentRepository.findById(commentId)
    return new CommentResponseDto(populated)
  }

  async deleteComment(commentId: string): Promise<boolean> {
    const comment = await this.commentRepository.findById(commentId)
    if (!comment) return false

    const repliesCount = await this.commentRepository.countDocuments({ parentComment: commentId })
    const totalDelete = 1 + repliesCount

    await this.commentRepository.deleteMany({
      $or: [{ _id: commentId }, { parentComment: commentId }]
    })

    if (comment.targetType === "post") {
      await Post.findByIdAndUpdate(comment.targetId, {
        $inc: { commentCount: -totalDelete }
      })
    }

    return true
  }

  async getParentComments(targetId: string, targetType: string, skip: number = 0, limit: number = 20): Promise<CommentResponseDto[]> {
    const comments = await this.commentRepository.find({
      targetId: new mongoose.Types.ObjectId(targetId),
      targetType,
      parentComment: null
    }, skip, limit)
    
    return comments.map(c => new CommentResponseDto(c))
  }

  async countParentComments(targetId: string, targetType: string): Promise<number> {
    return await this.commentRepository.countDocuments({
      targetId: new mongoose.Types.ObjectId(targetId),
      targetType,
      parentComment: null
    })
  }

  async getReplies(parentComment: string): Promise<CommentResponseDto[]> {
    const replies = await this.commentRepository.find({ parentComment })
    return replies.map(r => new CommentResponseDto(r))
  }

  async getNestedComments(targetId: string, targetType: string): Promise<CommentResponseDto[]> {
    // 1. Fetch all comments for this target
    const allComments = await this.commentRepository.findAll({
      targetId: new mongoose.Types.ObjectId(targetId)
    });

    // 2. Create map and identify roots
    const commentMap = new Map<string, any>();
    
    // First pass: populate the map
    allComments.forEach(c => {
      const id = c._id.toString();
      commentMap.set(id, {
        ...c.toObject(),
        _id: id,
        id: id,
        replies: [],
        children: []
      });
    });

    // Second pass: link parents and children
    const roots: any[] = [];
    allComments.forEach(c => {
      const id = c._id.toString();
      const node = commentMap.get(id);
      
      if (c.parentComment) {
        const parentId = c.parentComment.toString();
        const parent = commentMap.get(parentId);
        
        if (parent) {
          parent.replies.push(node);
          parent.children.push(node);
        } else {
          // Orphan comment or parent is not in this target's list
          roots.push(node);
        }
      } else {
        // This is a top-level comment
        roots.push(node);
      }
    });

    // 3. Convert roots to DTOs (this triggers recursive mapping)
    return roots
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(root => new CommentResponseDto(root));
  }
}
