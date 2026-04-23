import { apiFetch } from "./api"

export interface StoryResponse {
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

export const createStory = async (
  storyData: { imageUrl: string; videoUrl?: string; description?: string },
  token: string,
): Promise<StoryResponse | null> => {
  try {
    const data = await apiFetch("/stories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(storyData),
    })
    return data as StoryResponse
  } catch (error: any) {
    const msg = error?.message || "Đã xảy ra lỗi khi tạo story!"
    try {
      require("react-native").Alert.alert("Lỗi", msg)
    } catch {
      if (typeof window !== "undefined" && window.alert) window.alert(msg)
    }
    return null
  }
}

export const getStories = async (
  token: string,
): Promise<StoryResponse[] | null> => {
  try {
    const data = await apiFetch("/stories", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return data as StoryResponse[]
  } catch (error: any) {
    const msg = error?.message || "Đã xảy ra lỗi khi tải stories!"
    try {
      require("react-native").Alert.alert("Lỗi", msg)
    } catch {
      if (typeof window !== "undefined" && window.alert) window.alert(msg)
    }
    return null
  }
}
