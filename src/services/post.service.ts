import { apiFetch } from "./api"


export interface PostResponse {
  _id: string
  user: {
    _id: string
    name: string
    username: string
    avatar: string
  }
  imageUrl: string
  videoUrl?: string
  description?: string
  expiresAt: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}


export const createPost = async (
  postData: { imageUrl?: string; videoUrl?: string; description?: string },
  token: string,
): Promise<PostResponse> => {
  try {
    const data = await apiFetch("/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    })
    return data as PostResponse
  } catch (error) {
    console.error("Error creating post:", error)
    throw error
  }
}


export const getPosts = async (token: string): Promise<PostResponse[]> => {
  try {
    const data = await apiFetch("/posts", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return data as PostResponse[]
  } catch (error) {
    console.error("Error fetching posts:", error)
    throw error
  }
}


export const getPostDetail = async (postId: string, token: string): Promise<PostResponse> => {
  const data = await apiFetch(`/posts/${postId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return data as PostResponse
}


export const getCommentsByPost = async (postId: string) => {
  const data = await apiFetch(`/comments?targetId=${postId}&targetType=post`, {
    method: "GET",
  })
  return data
}



