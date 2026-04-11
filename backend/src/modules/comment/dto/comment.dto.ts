export interface CreateCommentDto {
  user: string
  targetId: string
  targetType: "post" | "comment"
  content: string
  parentId?: string
}

export interface CommentResponseDto {
  _id: string
  user: string
  targetId: string
  targetType: "post" | "comment"
  parentComment?: string
  content: string
  isEdited: boolean
  createdAt: string
  updatedAt: string
}
