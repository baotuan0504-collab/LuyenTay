export interface CreateStoryDto {
  imageUrl: string
  videoUrl?: string
  description?: string
}

export interface StoryResponseDto {
  _id: string
  user: string
  imageUrl: string
  videoUrl?: string
  description?: string
  expiresAt: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}
