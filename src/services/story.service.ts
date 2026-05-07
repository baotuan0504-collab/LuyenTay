import { apiFetch } from "./api"

export interface StoryResponse {
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
}

export const createStory = async (storyData: {
  imageUrl: string
  videoUrl?: string
  description?: string
}): Promise<StoryResponse | null> => {
  try {
    const data = await apiFetch("/stories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(storyData),
    })
    return data as StoryResponse
  } catch (error: any) {
    console.error("[StoryService] Error creating story:", error?.message || error);
    return null
  }
}

export const getStories = async (userId?: string): Promise<StoryResponse[] | null> => {
  try {
    const url = userId ? `/stories?userId=${userId}` : "/stories";
    const data = await apiFetch(url, {
      method: "GET",
    })
    return data as StoryResponse[]
  } catch (error: any) {
    console.error("[StoryService] Error loading stories:", error?.message || error);
    return null
  }
}
