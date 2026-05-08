export class CreateStoryDto {
  imageUrl: string
  videoUrl?: string
  description?: string

  constructor(data: any) {
    this.imageUrl = data.imageUrl
    this.videoUrl = data.videoUrl
    this.description = data.description
    
    if (!this.imageUrl) {
      throw new Error("Image URL is required")
    }
  }
}

export class StoryResponseDto {
  id: string
  _id: string
  user: {
    id: string
    _id: string
    name: string
    username: string
    avatar: string
    coverPhoto?: string
  }
  imageUrl: string
  videoUrl?: string
  description?: string
  expiresAt: string
  isActive: boolean
  createdAt: string

  constructor(story: any) {
    this.id = story._id.toString()
    this._id = story._id.toString()
    this.user = {
      id: story.user._id.toString(),
      _id: story.user._id.toString(),
      name: story.user.name,
      username: story.user.username,
      avatar: story.user.avatar,
      coverPhoto: story.user.coverPhoto,
    }
    this.imageUrl = story.imageUrl
    this.videoUrl = story.videoUrl
    this.description = story.description
    this.expiresAt = story.expiresAt.toISOString()
    this.isActive = story.isActive
    this.createdAt = story.createdAt.toISOString()
  }
}
