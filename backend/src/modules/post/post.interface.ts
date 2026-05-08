import { CreatePostDto, PostResponseDto, UpdatePostDto } from "./post.dto"

export interface IPostService {
  createPost(userId: string, dto: CreatePostDto): Promise<PostResponseDto>
  getPosts(userId: string, targetUserId?: string): Promise<PostResponseDto[]>
  getPostById(id: string): Promise<PostResponseDto>
  updatePost(userId: string, postId: string, dto: UpdatePostDto): Promise<PostResponseDto>
  deletePost(userId: string, postId: string): Promise<boolean>
}
