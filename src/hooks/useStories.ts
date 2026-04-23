import { useAuth } from "@/context/AuthContext"
import { uploadStoryImage, uploadStoryVideo } from "@/lib/supabase/storage"
import * as storyService from "@/services/story.service"
import { useEffect, useState } from "react"

export interface Story {
  id: string
  user_id: string
  image_url: string
  video_url?: string
  description?: string
  created_at: string
  expires_at: string
  is_active: boolean
  profiles: {
    id: string
    name: string
    username: string
    profile_image_url?: string
  }
}

export const useStories = () => {
  const [stories, setStories] = useState<Story[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, accessToken } = useAuth()

  useEffect(() => {
    if (accessToken) {
      loadStories()
    }
  }, [accessToken])

  const loadStories = async () => {
    if (!accessToken) return

    setIsLoading(true)
    try {
      const storiesData = await storyService.getStories(accessToken)

      const formattedStories: Story[] = storiesData.map((story: any) => ({
        id: String(story._id),
        user_id: String(story.user?._id),
        image_url: story.imageUrl,
        video_url: story.videoUrl,
        description: story.description,
        created_at: story.createdAt,
        expires_at: story.expiresAt,
        is_active: story.isActive,
        profiles: {
          id: String(story.user?._id),
          name: story.user?.name || "Unknown",
          username: story.user?.username || "user",
          profile_image_url: story.user?.avatar,
        },
      }))

      setStories(formattedStories)
    } catch (error: any) {
      const msg = error?.message || "Đã xảy ra lỗi khi tải stories!"
      try {
        require("react-native").Alert.alert("Lỗi", msg)
      } catch {
        if (typeof window !== "undefined" && window.alert) window.alert(msg)
      }
      console.error("Error in loadStories:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createStory = async (
    imageUri: string,
    description?: string,
    videoUri?: string,
  ) => {
    if (!user || !accessToken) {
      throw new Error("User not authenticated")
    }

    try {
      let imageUrl = ""
      let videoUrl = undefined

      if (videoUri) {
        imageUrl = await uploadStoryImage(user.id, imageUri)
        videoUrl = await uploadStoryVideo(user.id, videoUri)
      } else {
        imageUrl = await uploadStoryImage(user.id, imageUri)
      }

      await storyService.createStory(
        {
          imageUrl,
          videoUrl,
          description: description || "",
        },
        accessToken,
      )

      await loadStories()
    } catch (error) {
      console.error("Error in createStory:", error)
      throw error
    }
  }

  const refreshStories = async () => {
    await loadStories()
  }

  return { createStory, stories, refreshStories, isLoading }
}
