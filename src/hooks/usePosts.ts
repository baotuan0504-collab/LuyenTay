import { useAuth } from "@/context/AuthContext"
import { useQuery, useRealm } from "@/database/RealmContext"
import { savePostsToRealm, deletePostFromRealm } from "@/database/realm.service"
import { PostSchema } from "@/database/schema"
import { uploadPostImage, uploadPostVideo } from "@/lib/supabase/storage"
import * as postService from "@/services/post.service"
import { useEffect, useMemo, useState } from "react"
import { Alert } from "react-native"

export interface PostUser {
  id: string
  name: string
  username?: string
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
  privacy: "public" | "private"
  profiles?: PostUser
  reactionCounts?: Record<string, number>
  myReaction?: string | null
}

export const usePosts = (targetUserId?: string) => {
  const realm = useRealm()
  const [isLoading, setIsLoading] = useState(true)
  const { user, accessToken } = useAuth()

  // Query posts from Realm
  const realmPosts = useQuery(
    PostSchema,
    (collection) => {
      if (targetUserId) {
        return collection.filtered("user_id == $0", targetUserId).sorted("createdAt", true)
      }
      // TRANG CHỦ: Chỉ hiện bài Public HOẶC bài Private của chính mình
      return collection
        .filtered("privacy == 'public' || user_id == $0", user?.id)
        .sorted("createdAt", true)
    },
    [targetUserId, user?.id]
  )

  // Map Realm objects to UI interface
  const posts = useMemo(() => {
    return realmPosts.map((post) => ({
      id: post._id,
      user_id: post.user_id,
      image_url: post.imageUrl,
      video_url: post.videoUrl,
      description: post.description,
      created_at: post.createdAt,
      expires_at: post.expiresAt,
      is_active: post.isActive,
      privacy: (post.privacy as any) || "public",
      profiles: post.user
        ? {
            id: post.user._id,
            name: post.user.name,
            username: post.user.username || undefined,
            profile_image_url: post.user.avatar || undefined,
          }
        : undefined,
      reactionCounts: post.reactionCounts ? JSON.parse(post.reactionCounts) : {},
      myReaction: post.myReaction || null,
    }))
  }, [realmPosts])

  useEffect(() => {
    if (realmPosts.length > 0) {
      console.log(`[usePosts] Đang hiển thị ${realmPosts.length} bài viết từ Realm (Offline OK)`);
    } else {
      console.log("[usePosts] Realm chưa có dữ liệu bài viết.");
    }
  }, [realmPosts.length])

  useEffect(() => {
    if (accessToken) {
      loadPosts(targetUserId)
    } else {
      setIsLoading(false)
    }
  }, [accessToken, targetUserId])

  const loadPosts = async (tId?: string) => {
    if (!accessToken) return

    setIsLoading(true)
    try {
      const postsData = await postService.getPosts(tId)
      if (postsData) {
        console.log("[usePosts] API: Tải bài viết thành công. Đang cập nhật Realm...");
        savePostsToRealm(realm, postsData)
      }
    } catch (error) {
      console.warn("[usePosts] Lỗi kết nối. App đang sử dụng dữ liệu cũ từ Realm.");
    } finally {
      setIsLoading(false)
    }
  }

  const createPost = async (imageUri: string, description?: string, videoUri?: string, privacy: "public" | "private" = "public") => {
    if (!user || !accessToken) {
      Alert.alert("Lỗi", "Bạn chưa đăng nhập!")
      return
    }

    let imageUrl = ""
    let videoUrl = undefined

    try {
      if (videoUri) {
        imageUrl = await uploadPostImage(user.id, imageUri)
        videoUrl = await uploadPostVideo(user.id, videoUri)
      } else {
        imageUrl = await uploadPostImage(user.id, imageUri)
      }

      const result = await postService.createPost({
        imageUrl,
        videoUrl,
        description: description || "",
        privacy,
      })

      if (result) {
        await loadPosts(targetUserId)
      }
    } catch (error) {
      console.warn("[usePosts] Lỗi tạo bài viết:", error)
      Alert.alert(
        "Không thể đăng bài",
        "Có vẻ như bạn đang mất kết nối mạng hoặc đã có lỗi xảy ra. Vui lòng thử lại sau!"
      )
    }
  }

  const refreshPosts = async (tId?: string) => {
    await loadPosts(tId || targetUserId)
  }

  const handleDeletePost = async (postId: string) => {
    const success = await postService.deletePost(postId)
    if (success) {
      deletePostFromRealm(realm, postId)
    }
    return success
  }

  const handleUpdatePost = async (postId: string, description: string, imageUrl?: string, videoUrl?: string, privacy?: "public" | "private") => {
    const result = await postService.updatePost(postId, { description, imageUrl, videoUrl, privacy })
    if (result) {
      savePostsToRealm(realm, [result])
    }
    return result
  }

  return { createPost, posts, refreshPosts, isLoading, deletePost: handleDeletePost, updatePost: handleUpdatePost }
}
