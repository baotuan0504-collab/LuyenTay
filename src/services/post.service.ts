// Lấy comment dạng nested (cha + replies)
import { apiFetch } from "./api"

export interface PostResponse {
  _id: string
  user: {
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
  updatedAt: string
  reactionCounts?: Record<string, number>
  myReaction?: string | null
}

export const createPost = async (postData: {
  imageUrl?: string
  videoUrl?: string
  description?: string
}): Promise<PostResponse | null> => {
  try {
    const data = await apiFetch("/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    })
    return data as PostResponse
  } catch (error: any) {
    console.error("[PostService] Error:", error?.message || error);
    return null
  }
}

export const getPosts = async (userId?: string): Promise<PostResponse[] | null> => {
  try {
    const url = userId ? `/posts?userId=${userId}` : "/posts";
    const data = await apiFetch(url, {
      method: "GET",
    })
    return data as PostResponse[]
  } catch (error: any) {
    console.error("[PostService] Error loading posts:", error?.message || error);
    return null
  }
}

export const getPostDetail = async (postId: string): Promise<PostResponse> => {
  const data = await apiFetch(`/posts/${postId}`, {
    method: "GET",
  })
  return data as PostResponse
}

export const getCommentsByPost = async (
  postId: string,
  page = 1,
  limit = 20,
) => {
  const params = new URLSearchParams({
    targetId: postId,
    targetType: "post",
    page: String(page),
    limit: String(limit),
  })
  const data = await apiFetch(`/comments?${params.toString()}`, {
    method: "GET",
  })
  return data
}

export const getNestedCommentsByPost = async (postId: string) => {
  const params = new URLSearchParams({
    targetId: postId,
    targetType: "post",
  })
  const data = await apiFetch(`/comments/nested?${params.toString()}`, {
    method: "GET",
  })
  return data
}

export const updatePost = async (
  postId: string,
  postData: { description?: string; imageUrl?: string; videoUrl?: string; isActive?: boolean },
): Promise<PostResponse | null> => {
  try {
    const data = await apiFetch(`/posts/${postId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    })
    return data as PostResponse
  } catch (error: any) {
    console.error("[PostService] Error updating post:", error?.message || error)
    return null
  }
}

export const deletePost = async (postId: string): Promise<boolean> => {
  try {
    await apiFetch(`/posts/${postId}`, {
      method: "DELETE",
    })
    return true
  } catch (error: any) {
    console.error("[PostService] Error deleting post:", error?.message || error)
    return false
  }
}
