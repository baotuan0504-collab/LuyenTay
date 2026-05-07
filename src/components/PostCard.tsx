import { ReactionBar } from "@/components/ReactionBar"
import { useAuth } from "@/context/AuthContext"
import { Post } from "@/hooks/usePosts"
import { formatTimeAgo, formatTimeRemaining } from "@/lib/date-helper"
import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import { useRouter } from "expo-router"
import { VideoView, useVideoPlayer } from "expo-video"
import React, { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import {
  removeReaction,
  upsertReaction,
} from "@/services/reaction.service"

interface PostCardProps {
  post: Post
  currentUserId?: string
  onShowReactors: (post: Post) => void
  onDelete?: (postId: string) => void
  onUpdate?: (postId: string, newDescription: string) => void
}

export const PostCard = ({ post, currentUserId, onShowReactors, onDelete, onUpdate }: PostCardProps) => {
  const { accessToken } = useAuth()
  const postUser = post.profiles
  const isOwnPost = post.user_id === currentUserId
  const router = useRouter()
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const player = useVideoPlayer(post.video_url ?? null, player => {
    player.loop = true
    player.muted = false
    player.volume = 1
  })

  const [myReaction, setMyReaction] = useState<string | undefined>(
    post.myReaction || undefined,
  )
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>(
    post.reactionCounts || {},
  )

  useEffect(() => {
    setMyReaction(post.myReaction || undefined)
    setReactionCounts(post.reactionCounts || {})
  }, [post.myReaction, post.reactionCounts, post.id])

  const handleReaction = async (type: string) => {
    if (!accessToken) {
      Alert.alert(
        "Authentication required",
        "Please sign in to react to posts.",
      )
      return
    }

    try {
      if (myReaction === type) {
        await removeReaction(post.id, "post")
        setMyReaction(undefined)
        setReactionCounts(c => ({
          ...c,
          [type]: Math.max((c[type] || 1) - 1, 0),
        }))
      } else {
        await upsertReaction(post.id, "post", type)
        setMyReaction(type)
        setReactionCounts(c => ({
          ...c,
          [type]: (c[type] || 0) + 1,
          ...(myReaction
            ? { [myReaction]: Math.max((c[myReaction] || 1) - 1, 0) }
            : {}),
        }))
      }
    } catch (error) {
      console.error("Reaction request failed:", error)
      Alert.alert(
        "Reaction failed",
        "Could not update your reaction. Please try again.",
      )
    }
  }

  const handleMorePress = () => {
    if (!isOwnPost) return;

    Alert.alert(
      "Tùy chọn bài viết",
      "Bạn muốn làm gì với bài viết này?",
      [
        {
          text: "Chỉnh sửa",
          onPress: () => handleEditPost(),
        },
        {
          text: "Xóa bài viết",
          onPress: () => confirmDelete(),
          style: "destructive",
        },
        {
          text: "Hủy",
          style: "cancel",
        },
      ]
    );
  };

  const handleEditPost = () => {
    router.push(`/post/edit/${post.id}` as any);
  };

  const confirmDelete = () => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xóa", 
          style: "destructive", 
          onPress: () => onDelete && onDelete(post.id) 
        },
      ]
    );
  };

  useEffect(() => {
    if (!post.video_url) return
    if (isPlaying) {
      player.play()
    } else {
      player.pause()
    }
  }, [isPlaying, player, post.video_url])

  return (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => router.push(`/profile/${post.user_id}`)}>
          {postUser?.profile_image_url ? (
            <Image
              cachePolicy={"none"}
              source={{ uri: postUser.profile_image_url }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {postUser?.name?.[0]?.toUpperCase() || "U"}
              </Text>
            </View>
          )}

          <View>
            <Text style={styles.username}>
              {isOwnPost ? "You" : `@${postUser?.username}`}
            </Text>
            <View style={styles.timeContainer}>
              <Text style={styles.timeAgo}>{formatTimeAgo(post.created_at)}</Text>
              <Text style={styles.dot}> • </Text>
              <Ionicons 
                name={post.privacy === "public" ? "globe-outline" : "lock-closed-outline"} 
                size={12} 
                color="#666" 
              />
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <View style={styles.timeRemainingBadge}>
            <Text style={styles.timeRemainingText}>
              {formatTimeRemaining(post.expires_at)}
            </Text>
          </View>
          
          {isOwnPost && (
            <TouchableOpacity onPress={handleMorePress} style={styles.moreButton}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {post.description ? (
        <View style={styles.postDescriptionContainer}>
          <Text style={styles.postDescription}>{post.description}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => post.video_url && setIsPlaying(!isPlaying)}
        style={styles.mediaContainer}>
        {post.video_url && isPlaying ? (
          <View style={styles.videoWrapper}>
            <VideoView
              player={player}
              nativeControls
              contentFit="cover"
              useExoShutter
              onFirstFrameRender={() => setVideoReady(true)}
              style={[styles.postImage, { backgroundColor: "#000" }]}
            />
            {!videoReady && (
              <View style={styles.videoCover}>
                <Image
                  cachePolicy={"none"}
                  source={{ uri: post.image_url }}
                  style={[styles.postImage, styles.coverImage]}
                  contentFit="cover"
                />
                <ActivityIndicator
                  size="large"
                  color="#fff"
                />
              </View>
            )}
          </View>
        ) : (
          <View>
            <Image
              cachePolicy={"none"}
              source={{ uri: post.image_url }}
              style={styles.postImage}
              contentFit="cover"
            />
            {post.video_url && (
              <View style={styles.playButtonOverlay}>
                <Ionicons
                  name="play"
                  size={50}
                  color="#fff"
                />
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
      <ReactionBar
        selected={myReaction}
        onSelect={handleReaction}
        counts={reactionCounts}
        onShowReactors={() => onShowReactors(post)}
        onCommentPress={() => router.push(`/post/${post.id}` as any)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  postContainer: {
    backgroundColor: "#fff",
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  timeAgo: {
    fontSize: 12,
    color: "#666",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    fontSize: 12,
    color: "#666",
  },
  timeRemainingBadge: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timeRemainingText: {
    color: "#666",
    fontSize: 11,
    fontWeight: "600",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  moreButton: {
    padding: 4,
  },
  postImage: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#f5f5f5",
  },
  postDescriptionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  postDescription: {
    fontSize: 15,
    color: "#000",
    lineHeight: 20,
  },
  mediaContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 1,
  },
  videoWrapper: {
    position: "relative",
  },
  videoCover: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  coverImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  playButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
})
