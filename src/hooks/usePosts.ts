import { useAuth } from "@/context/AuthContext"
import { uploadPostImage, uploadPostVideo } from "@/lib/supabase/storage"
import { isUnauthorizedError } from "@/services/api"
import * as postService from "@/services/post.service"
import { useEffect, useState } from "react"


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
}


export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, accessToken, signOut } = useAuth()


  useEffect(() => {
    if (accessToken) {
      loadPosts()
    }
  }, [accessToken])


  const loadPosts = async () => {
    if (!accessToken) return


    setIsLoading(true)
    try {
      const postsData = await postService.getPosts(accessToken)


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
      }))


      setPosts(formattedPosts)
    } catch (error) {
      console.error("Error in loadPosts:", error)
      if (isUnauthorizedError(error)) {
        console.warn("Access token unauthorized — signing out user.")
        try {
          await signOut()
        } catch (e) {
          console.error("Error signing out after 401:", e)
        }
        return
      }
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
      throw new Error("User not authenticated")
    }


    try {
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
      await postService.createPost(
        {
          imageUrl,
          videoUrl,
          description: description || "",
        },
        accessToken,
      )


      // Refresh posts
      await loadPosts()
    } catch (error) {
      console.error("Error in createPost:", error)
      throw error
    }
  }


  const refreshPosts = async () => {
    await loadPosts()
  }


  return { createPost, posts, refreshPosts, isLoading }
}



