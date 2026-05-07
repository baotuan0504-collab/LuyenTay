import { useAuth } from "@/context/AuthContext"
import { useQuery, useRealm } from "@/database/RealmContext"
import { saveStoriesToRealm } from "@/database/realm.service"
import { StorySchema } from "@/database/schema"
import { uploadStoryImage, uploadStoryVideo } from "@/lib/supabase/storage"
import * as storyService from "@/services/story.service"
import { useEffect, useMemo, useState } from "react"
import { Alert } from "react-native"

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
    username?: string
    profile_image_url?: string
  }
}

export const useStories = (targetUserId?: string) => {
  const realm = useRealm()
  const [isLoading, setIsLoading] = useState(true)
  const { user, accessToken } = useAuth()

  // Query stories from Realm
  const realmStories = useQuery(
    StorySchema,
    (collection) => {
      if (targetUserId) {
        return collection.filtered("user_id == $0", targetUserId).sorted("createdAt", true)
      }
      return collection.sorted("createdAt", true)
    },
    [targetUserId]
  )

  // Map Realm objects to UI interface
  const stories = useMemo(() => {
    return realmStories.map((story) => ({
      id: story._id,
      user_id: story.user_id,
      image_url: story.imageUrl,
      video_url: story.videoUrl,
      description: story.description,
      created_at: story.createdAt,
      expires_at: story.expiresAt,
      is_active: story.isActive,
      profiles: {
        id: story.user?._id || story.user_id,
        name: story.user?.name || "Unknown",
        username: story.user?.username || "user",
        profile_image_url: story.user?.avatar,
      },
    }))
  }, [realmStories])

  useEffect(() => {
    if (realmStories.length > 0) {
      console.log(`[useStories] Đang hiển thị ${realmStories.length} stories từ Realm (Offline OK)`);
    } else {
      console.log("[useStories] Realm chưa có dữ liệu stories.");
    }
  }, [realmStories.length])

  useEffect(() => {
    if (accessToken) {
      loadStories(targetUserId)
    } else {
      setIsLoading(false)
    }
  }, [accessToken, targetUserId])

  const loadStories = async (tId?: string) => {
    if (!accessToken) return

    setIsLoading(true)
    try {
      const storiesData = await storyService.getStories(tId)
      if (storiesData) {
        console.log("[useStories] API: Tải stories thành công. Đang cập nhật Realm...");
        saveStoriesToRealm(realm, storiesData)
      }
    } catch (error) {
      console.warn("[useStories] Lỗi kết nối. App đang sử dụng dữ liệu cũ từ Realm.");
    } finally {
      setIsLoading(false)
    }
  }

  const createStory = async (imageUri: string, description?: string, videoUri?: string) => {
    if (!user || !accessToken) {
      Alert.alert("Lỗi", "Bạn chưa đăng nhập!")
      return
    }

    let imageUrl = ""
    let videoUrl = undefined

    try {
      if (videoUri) {
        imageUrl = await uploadStoryImage(user.id, imageUri)
        videoUrl = await uploadStoryVideo(user.id, videoUri)
      } else {
        imageUrl = await uploadStoryImage(user.id, imageUri)
      }

      const result = await storyService.createStory({
        imageUrl,
        videoUrl,
        description: description || "",
      })

      if (result) {
        await loadStories(targetUserId)
      }
    } catch (error) {
      console.warn("[useStories] Lỗi tạo story:", error)
      Alert.alert(
        "Không thể đăng Story",
        "Kết nối mạng không ổn định hoặc có lỗi xảy ra. Vui lòng kiểm tra lại!"
      )
    }
  }

  const refreshStories = async (tId?: string) => {
    await loadStories(tId || targetUserId)
  }

  return { createStory, stories, refreshStories, isLoading }
}
