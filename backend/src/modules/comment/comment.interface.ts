import { CommentResponseDto, CreateCommentDto, UpdateCommentDto } from "./comment.dto"

export interface ICommentService {
  createComment(userId: string, dto: CreateCommentDto): Promise<CommentResponseDto>
  updateComment(commentId: string, dto: UpdateCommentDto): Promise<CommentResponseDto>
  deleteComment(commentId: string): Promise<boolean>
  getParentComments(targetId: string, targetType: string, skip?: number, limit?: number): Promise<CommentResponseDto[]>
  countParentComments(targetId: string, targetType: string): Promise<number>
  getReplies(parentComment: string): Promise<CommentResponseDto[]>
  getNestedComments(targetId: string, targetType: string): Promise<CommentResponseDto[]>
}
