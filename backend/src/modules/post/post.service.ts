import { IPostRepository, PostRepository } from "../../repositories/PostRepository"
import { CreatePostDto, PostResponseDto, UpdatePostDto } from "./post.dto"
import { IPostService } from "./post.interface"

export class PostService implements IPostService {
  private postRepository: IPostRepository

  constructor(postRepository: IPostRepository = new PostRepository()) {
    this.postRepository = postRepository
  }

  async createPost(userId: string, dto: CreatePostDto): Promise<PostResponseDto> {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const post = await this.postRepository.create({
      user: userId as any,
      imageUrl: dto.imageUrl,
      videoUrl: dto.videoUrl,
      description: dto.description,
      expiresAt,
      isActive: true,
      privacy: dto.privacy || "public",
    })

    const populatedPost = await this.postRepository.findById(post._id.toString())
    return new PostResponseDto(populatedPost)
  }

  async getPosts(userId: string, targetUserId?: string): Promise<PostResponseDto[]> {
    const filter: any = {}

    if (targetUserId) {
      filter.user = targetUserId
      if (targetUserId !== userId.toString()) {
        filter.privacy = "public"
      }
    } else {
      filter.$or = [
        { privacy: "public" },
        { user: userId, privacy: "private" }
      ]
    }

    const posts = await this.postRepository.findWithFilter(filter)

    // Xử lý Reactions
    const postIds = posts.map(p => p._id.toString())
    const allReactions = await this.postRepository.getReactionsForPosts(postIds)

    const reactionCountsMap: Record<string, Record<string, number>> = {}
    const myReactionMap: Record<string, string> = {}

    allReactions.forEach(r => {
      const pid = r.targetId.toString()
      if (!reactionCountsMap[pid]) reactionCountsMap[pid] = {}
      reactionCountsMap[pid][r.reactionType] = (reactionCountsMap[pid][r.reactionType] || 0) + 1

      if (r.user.toString() === userId.toString()) {
        myReactionMap[pid] = r.reactionType
      }
    })

    return posts.map(post =>
      new PostResponseDto(
        post,
        reactionCountsMap[post._id.toString()] || {},
        myReactionMap[post._id.toString()] || null
      )
    )
  }

  async getPostById(id: string): Promise<PostResponseDto> {
    const post = await this.postRepository.findById(id)
    if (!post) throw new Error("Post not found")
    return new PostResponseDto(post)
  }

  async updatePost(userId: string, postId: string, dto: UpdatePostDto): Promise<PostResponseDto> {
    const post = await this.postRepository.findById(postId)
    if (!post) throw new Error("Post not found")

    if (post.user._id.toString() !== userId.toString()) {
      throw new Error("Unauthorized to update this post")
    }

    const updatedPost = await this.postRepository.update(postId, {
      description: dto.description,
      imageUrl: dto.imageUrl,
      videoUrl: dto.videoUrl,
      isActive: dto.isActive,
      privacy: dto.privacy,
    })

    return new PostResponseDto(updatedPost)
  }

  async deletePost(userId: string, postId: string): Promise<boolean> {
    const post = await this.postRepository.findById(postId)
    if (!post) throw new Error("Post not found")

    if (post.user._id.toString() !== userId.toString()) {
      throw new Error("Unauthorized to delete this post")
    }

    return await this.postRepository.delete(postId)
  }
}
