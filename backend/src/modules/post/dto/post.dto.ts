export interface CreatePostDto {
  imageUrl: string
  videoUrl?: string
  description?: string
}

export interface PostResponseDto {
  _id: string
  user: string
  imageUrl: string
  videoUrl?: string
  description?: string
  expiresAt: string
  isActive: boolean
  commentsCount?: number
  createdAt: string
  updatedAt: string
}
