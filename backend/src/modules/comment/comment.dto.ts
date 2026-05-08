export class CreateCommentDto {
  targetId: string
  targetType: string
  content: string
  parentId?: string

  constructor(data: any) {
    this.targetId = data.targetId
    this.targetType = data.targetType
    this.content = data.content
    this.parentId = data.parentId
  }
}

export class UpdateCommentDto {
  content: string

  constructor(data: any) {
    this.content = data.content
  }
}

export class CommentResponseDto {
  id: string
  _id: string
  user: any
  targetId: string
  targetType: string
  parentComment?: string
  content: string
  isEdited: boolean
  level: number
  createdAt: string
  replies: CommentResponseDto[]
  children?: CommentResponseDto[]

  constructor(comment: any, level: number = 0) {
    this.id = comment._id.toString()
    this._id = comment._id.toString()

    // Support both populated user (object) and unpopulated (ObjectId)
    if (comment.user?._id || comment.user?.name) {
      this.user = {
        id: (comment.user._id || comment.user.id).toString(),
        _id: (comment.user._id || comment.user.id).toString(),
        name: comment.user.name,
        username: comment.user.username,
        avatar: comment.user.avatar,
      }
    } else {
      this.user = comment.user?.toString?.() || comment.user
    }

    this.targetId = comment.targetId?.toString()
    this.targetType = comment.targetType
    this.parentComment = comment.parentComment?.toString()
    this.content = comment.content
    this.isEdited = comment.isEdited || false
    this.level = comment.level !== undefined ? comment.level : level
    this.createdAt = comment.createdAt instanceof Date
      ? comment.createdAt.toISOString()
      : comment.createdAt

    // Explicitly check for replies in both possible fields
    const replies = Array.isArray(comment.replies) && comment.replies.length > 0 ? comment.replies : null
    const children = Array.isArray(comment.children) && comment.children.length > 0 ? comment.children : null
    const finalReplies = replies || children || []

    if (finalReplies.length > 0) {
      // Sort replies by date (oldest first)
      const sorted = [...finalReplies].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      
      const mapped = sorted.map((r: any) => new CommentResponseDto(r, this.level + 1))
      this.replies = mapped
      this.children = mapped
    } else {
      this.replies = []
      this.children = []
    }
  }
}
