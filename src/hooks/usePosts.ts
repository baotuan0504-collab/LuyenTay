import { useAuth } from "@/context/AuthContext"
import { uploadPostImage, uploadPostVideo } from "@/lib/supabase/storage"
import * as postService from "@/services/post.service"
import { useEffect, useState } from "react"
import { Alert } from "react-native"

export interface PostUser {
  id: string
  name: string
  username: string
  profile_image_url?: string
}

export interface Post {
  id: string
  user_id: string
  image_url: string
  video_url?: string
  description?: string
  created_at: string
  expires_at: string
  is_active: boolean
  profiles?: PostUser
  reactionCounts?: Record<string, number>
  myReaction?: string | null
}

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, accessToken } = useAuth()

  useEffect(() => {
    if (accessToken) {
      loadPosts()
    }
  }, [accessToken])

  const loadPosts = async () => {
    if (!accessToken) return

    setIsLoading(true)
    try {
      const postsData = await postService.getPosts()
      if (!postsData) {
        setPosts([])
        setIsLoading(false)
        return
      }
      const formattedPosts: Post[] = postsData.map(post => ({
        id: post._id,
        user_id: post.user._id,
        image_url: post.imageUrl,
        video_url: post.videoUrl,
        description: post.description,
        created_at: post.createdAt,
        expires_at: post.expiresAt,
        is_active: post.isActive,
        profiles: {
          id: post.user._id,
          name: post.user.name,
          username: post.user.username,
          profile_image_url: post.user.avatar,
        },
        reactionCounts: post.reactionCounts || {},
        myReaction:
          typeof post.myReaction === "undefined" ? null : post.myReaction,
      }))
      setPosts(formattedPosts)
    } finally {
      setIsLoading(false)
    }
  }

  const createPost = async (
    imageUri: string,
    description?: string,
    videoUri?: string,
  ) => {
    if (!user || !accessToken) {
      try {
        Alert.alert("Lỗi", "Bạn chưa đăng nhập!")
      } catch {
        if (typeof window !== "undefined" && window.alert)
          window.alert("Bạn chưa đăng nhập!")
      }
      return
    }

    let imageUrl = ""
    let videoUrl = undefined

    if (videoUri) {
      // 1. Upload thumbnail (imageUri is the thumbnail here) and video
      imageUrl = await uploadPostImage(user.id, imageUri)
      videoUrl = await uploadPostVideo(user.id, videoUri)
    } else {
      // 1. Upload only image
      imageUrl = await uploadPostImage(user.id, imageUri)
    }

    // 2. Save metadata to Backend
    const result = await postService.createPost({
      imageUrl,
      videoUrl,
      description: description || "",
    })
    if (!result) {
      // Alert already shown in service
      return
    }

    // Refresh posts
    await loadPosts()
  }

  const refreshPosts = async () => {
    await loadPosts()
  }

  return { createPost, posts, refreshPosts, isLoading }
}
