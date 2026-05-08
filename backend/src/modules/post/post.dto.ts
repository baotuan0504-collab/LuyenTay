export class CreatePostDto {
  imageUrl?: string
  videoUrl?: string
  description?: string
  privacy?: "public" | "private"

  constructor(data: any) {
    this.imageUrl = data.imageUrl
    this.videoUrl = data.videoUrl
    this.description = data.description
    this.privacy = data.privacy
    
    if (!this.imageUrl && !this.videoUrl) {
      throw new Error("Either Image URL or Video URL is required")
    }
  }
}

export class UpdatePostDto {
  imageUrl?: string
  videoUrl?: string
  description?: string
  isActive?: boolean
  privacy?: "public" | "private"

  constructor(data: any) {
    this.imageUrl = data.imageUrl
    this.videoUrl = data.videoUrl
    this.description = data.description
    this.isActive = data.isActive
    this.privacy = data.privacy
  }
}

export class PostResponseDto {
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
  privacy: "public" | "private"
  reactionCounts: Record<string, number>
  myReaction: string | null
  createdAt: string

  constructor(post: any, reactionCounts: Record<string, number> = {}, myReaction: string | null = null) {
    this.id = post._id.toString()
    this._id = post._id.toString()
    this.user = {
      id: post.user._id.toString(),
      _id: post.user._id.toString(),
      name: post.user.name,
      username: post.user.username,
      avatar: post.user.avatar,
      coverPhoto: post.user.coverPhoto,
    }
    this.imageUrl = post.imageUrl
    this.videoUrl = post.videoUrl
    this.description = post.description
    this.expiresAt = post.expiresAt.toISOString()
    this.isActive = post.isActive
    this.privacy = post.privacy || "public"
    this.reactionCounts = reactionCounts
    this.myReaction = myReaction
    this.createdAt = post.createdAt.toISOString()
  }
}
