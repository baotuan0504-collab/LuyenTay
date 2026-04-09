import { compressImage, compressVideo } from "@/lib/media"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { VideoView, useVideoPlayer } from "expo-video"
import * as VideoThumbnails from "expo-video-thumbnails"
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"


import { ReactionBar } from "@/components/ReactionBar"
import { StoryBar } from "@/components/StoryBar"
import { StoryViewer } from "@/components/StoryViewer"
import { useAuth } from "@/context/AuthContext"
import { Post, usePosts } from "@/hooks/usePosts"
import { Story, useStories } from "@/hooks/useStories"
import { formatTimeAgo, formatTimeRemaining } from "@/lib/date-helper"
import { events } from "@/lib/events"
import { useIsFocused } from "@react-navigation/native"
import { Image } from "expo-image"
import { useRouter } from "expo-router"
import { useEffect, useMemo, useState } from "react"


import {
  getMyReaction,
  getReactionCounts,
  removeReaction,
  upsertReaction,
} from "@/services/reaction.service"


interface PostCardProps {
  post: Post
  currentUserId?: string
}


const PostCard = ({ post, currentUserId }: PostCardProps) => {
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
  // Thêm state cho reaction
  const [myReaction, setMyReaction] = useState<string | undefined>(undefined)
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>(
    {},
  )


  useEffect(() => {
    if (accessToken) {
      // Lấy reaction của user
      getMyReaction(post.id, "post", accessToken)
        .then(data => setMyReaction(data?.reactionType))
        .catch(() => setMyReaction(undefined))
    }

    // Lấy tổng reaction từng loại
    getReactionCounts(post.id, "post")
      .then(data => {
        const counts: Record<string, number> = {}
        data.forEach((r: any) => {
          counts[r._id] = r.count
        })
        setReactionCounts(counts)
      })
      .catch(() => setReactionCounts({}))
  }, [post.id, accessToken])


  const handleReaction = async (type: string) => {
    if (!accessToken) {
      Alert.alert("Authentication required", "Please sign in to react to posts.")
      return
    }

    try {
      if (myReaction === type) {
        // Bỏ reaction
        await removeReaction(post.id, "post", accessToken)
        setMyReaction(undefined)
        setReactionCounts(c => ({
          ...c,
          [type]: Math.max((c[type] || 1) - 1, 0),
        }))
      } else {
        // Thả hoặc đổi reaction
        await upsertReaction(post.id, "post", type, accessToken)
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
      Alert.alert("Reaction failed", "Could not update your reaction. Please try again.")
    }
  }


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
            <Text style={styles.timeAgo}>{formatTimeAgo(post.created_at)}</Text>
          </View>
        </TouchableOpacity>


        {/* Post content */}
        <View style={styles.timeRemainingBadge}>
          <Text style={styles.timeRemainingText}>
            {formatTimeRemaining(post.expires_at)}
          </Text>
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
      />
    </View>
  )
}


export default function Index() {
  const [showPreview, setShowPreview] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [previewVideo, setPreviewVideo] = useState<string | null>(null)
  const [description, setDescription] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const previewPlayer = useVideoPlayer(previewVideo ?? null, player => {
    player.loop = true
    player.muted = false
    player.volume = 1
  })


  const router = useRouter()
  const {
    createPost,
    posts,
    refreshPosts,
    isLoading: postsLoading,
  } = usePosts()
  const {
    createStory,
    stories,
    refreshStories,
    isLoading: storiesLoading,
  } = useStories()
  const { user } = useAuth()


  const [selectedUserStories, setSelectedUserStories] = useState<Story[]>([])
  const [isViewerVisible, setIsViewerVisible] = useState(false)
  const [isStoryMode, setIsStoryMode] = useState(false)


  const usersWithStories = useMemo(() => {
    // Pure function, no side effects, only depends on stories
    const userGroups: Record<string, Story[]> = {}
    for (const story of stories) {
      const userId = story.user_id
      if (!userGroups[userId]) userGroups[userId] = []
      userGroups[userId].push(story)
    }
    return Object.entries(userGroups)
      .map(([userId, userStories]) => {
        const profile = userStories[0].profiles
        return {
          id: userId,
          name: profile?.name || "Unknown",
          username: profile?.username || "user",
          avatar: profile?.profile_image_url,
          thumbnail: userStories[userStories.length - 1]?.image_url,
          hasUnseenStory: true,
          stories: [...userStories].sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime(),
          ),
        }
      })
      .sort((a, b) => {
        const latestA = Math.max(
          ...a.stories.map(s => new Date(s.created_at).getTime()),
        )
        const latestB = Math.max(
          ...b.stories.map(s => new Date(s.created_at).getTime()),
        )
        return latestB - latestA
      })
  }, [stories])


  const currentUserStory = useMemo(() => {
    if (!user?.id) return undefined
    const self = usersWithStories.find(u => String(u.id) === String(user.id))
    return self
  }, [usersWithStories, user?.id])


  const otherUsersStories = useMemo(() => {
    if (!user?.id) return usersWithStories
    return usersWithStories.filter(u => String(u.id) !== String(user.id))
  }, [usersWithStories, user?.id])


  const handleUserStoryPress = (userId: string) => {
    const userGroup = usersWithStories.find(u => u.id === userId)
    if (userGroup) {
      setSelectedUserStories(userGroup.stories)
      setIsViewerVisible(true)
    }
  }


  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([refreshPosts(), refreshStories()])
    } catch (error) {
      console.error("Error refreshing content:", error)
    } finally {
      setRefreshing(false)
    }
  }


  useEffect(() => {
    const unsub = events.on("posts:refresh", () => {
      try {
        refreshPosts()
      } catch (e) {
        console.error("Error refreshing posts from event:", e)
      }
    })
    return () => unsub && unsub()
  }, [refreshPosts])


  const isFocused = useIsFocused()
  useEffect(() => {
    if (isFocused) {
      refreshPosts().catch(e =>
        console.error("Error refreshing posts on focus:", e),
      )
      refreshStories().catch(e =>
        console.error("Error refreshing stories on focus:", e),
      )
    }
  }, [isFocused, refreshPosts, refreshStories])


  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "We need camera roll permissions to select a profile image.",
      )
      return
    }


    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri
      setIsUploading(true)
      try {
        const compressed = await compressImage(uri)
        setPreviewImage(compressed.uri)
        setPreviewVideo(null)
        setShowPreview(true)
        setDescription("")
      } catch (error) {
        console.warn("Image compression failed, using original image:", error)
        setPreviewImage(uri)
        setPreviewVideo(null)
        setShowPreview(true)
        setDescription("")
      } finally {
        setIsUploading(false)
      }
    }
  }


  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "We need camera roll permissions to select a video.",
      )
      return
    }


    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      quality: 0.8,
    })
    if (!result.canceled && result.assets[0]) {
      const videoUri = result.assets[0].uri
      setIsUploading(true)
      try {
        const compressedVideoUri = await compressVideo(videoUri)
        setPreviewVideo(compressedVideoUri)
        setPreviewImage(null)
        try {
          const { uri } = await VideoThumbnails.getThumbnailAsync(
            compressedVideoUri,
            {
              time: 0,
            },
          )
          setPreviewImage(uri)
        } catch (e) {
          console.warn("Video thumbnail generation failed:", e)
        }
        setShowPreview(true)
        setDescription("")
      } catch (e) {
        console.warn("Video thumbnail generation failed:", e)
        setPreviewVideo(videoUri)
        try {
          const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
            time: 0,
          })
          setPreviewImage(uri)
        } catch (error) {
          console.error("Error generating video thumbnail:", error)
        }
        setShowPreview(true)
        setDescription("")
      } finally {
        setIsUploading(false)
      }
    }
  }


  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "We need camera permissions to take a photo.",
      )
      return
    }


    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })
      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri
        setIsUploading(true)
        try {
          const compressed = await compressImage(uri)
          setPreviewImage(compressed.uri)
          setPreviewVideo(null)
          setShowPreview(true)
          setDescription("")
        } catch (error) {
          console.error("Image compression failed:", error)
          setPreviewImage(uri)
          setPreviewVideo(null)
          setShowPreview(true)
          setDescription("")
        } finally {
          setIsUploading(false)
        }
      }
    } catch (error) {
      console.error("Camera launch failed:", error)
      Alert.alert(
        "Camera unavailable",
        "Camera is not available on this device or simulator.",
      )
    }
  }


  const recordVideo = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "We need camera permissions to record a video.",
      )
      return
    }


    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["videos"],
        quality: 0.8,
      })
      if (!result.canceled && result.assets[0]) {
        const videoUri = result.assets[0].uri
        setIsUploading(true)
        try {
          const compressedUri = await compressVideo(videoUri)
          setPreviewVideo(compressedUri)
          setPreviewImage(null)
          try {
            const { uri } = await VideoThumbnails.getThumbnailAsync(
              compressedUri,
              {
                time: 0,
              },
            )
            setPreviewImage(uri)
          } catch (e) {
            console.warn("Video thumbnail generation failed:", e)
          }
          setShowPreview(true)
          setDescription("")
        } catch (e) {
          console.error("Video compression failed:", e)
          setPreviewVideo(videoUri)
          try {
            const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
              time: 0,
            })
            setPreviewImage(uri)
          } catch (error) {
            console.error("Error generating video thumbnail:", error)
          }
          setShowPreview(true)
          setDescription("")
        } finally {
          setIsUploading(false)
        }
      }
    } catch (error) {
      console.error("Camera launch failed:", error)
      Alert.alert(
        "Camera unavailable",
        "Camera is not available on this device or simulator.",
      )
    }
  }


  const showImagePicker = (forStory = false) => {
    setIsStoryMode(forStory)
    Alert.alert(forStory ? "Add Story" : "Create Post", "Choose an option", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Record Video", onPress: recordVideo },
      { text: "Photo Library (Image)", onPress: pickImage },
      { text: "Photo Library (Video)", onPress: pickVideo },
      { text: "Cancel", style: "cancel" },
    ])
  }


  const handlePost = async () => {
    if (!previewImage) return


    setIsUploading(true)
    try {
      if (isStoryMode) {
        await createStory(previewImage, description, previewVideo || undefined)
      } else {
        await createPost(previewImage, description, previewVideo || undefined)
      }
      setPreviewImage(null)
      setPreviewVideo(null)
      setDescription("")
      setShowPreview(false)
    } catch (error) {
      console.error("Error creating content:", error)
      Alert.alert(
        "Error",
        `Failed to create ${isStoryMode ? "story" : "post"}. Please try again.`,
      )
    } finally {
      setIsUploading(false)
    }
  }


  const renderPost = ({ item }: { item: Post }) => (
    <PostCard
      post={item}
      currentUserId={user?.id}
    />
  )


  return (
    <View style={styles.container}>
      {/* LIST */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        style={{ flex: 1 }}
        contentContainerStyle={
          posts.length === 0 ? styles.emptyContent : styles.content
        }
        ListEmptyComponent={<Text>No posts found</Text>}
        ListHeaderComponent={
          <StoryBar
            currentUser={{
              id: String(user?.id || ""),
              name: user?.name || "You",
              avatar: user?.avatar,
              thumbnail: currentUserStory?.thumbnail,
              hasStory: !!currentUserStory,
            }}
            usersWithStories={otherUsersStories}
            onUserPress={handleUserStoryPress}
            onSelfPress={() =>
              currentUserStory
                ? handleUserStoryPress(String(user?.id || ""))
                : showImagePicker(true)
            }
            onAddStoryPress={() => router.push("/story/new")}
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      />


      <StoryViewer
        visible={isViewerVisible}
        stories={selectedUserStories}
        initialIndex={0}
        onClose={() => setIsViewerVisible(false)}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/post/new")}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
      <Modal
        visible={showPreview}
        transparent
        animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* HEADER */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}>
              <TouchableOpacity
                onPress={() => {
                  setShowPreview(false)
                  setPreviewImage(null)
                  setPreviewVideo(null)
                  setDescription("")
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}
                style={{ marginRight: 12 }}>
                <Ionicons
                  name="close"
                  size={24}
                />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { flex: 1 }]}>
                Đăng {isStoryMode ? "Story" : "Bài viết"}
              </Text>
              <TouchableOpacity
                onPress={handlePost}
                disabled={isUploading}
                style={[
                  styles.modalButton,
                  styles.postButton,
                  { minWidth: 80, paddingVertical: 8 },
                ]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}>
                {isUploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.postButtonText}>
                    {isStoryMode ? "Đăng Story" : "Đăng"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>


            {/* USER INFO */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}>
              <Image
                source={{ uri: user?.avatar }}
                style={[styles.avatar, { marginRight: 12 }]}
              />
              <View>
                <Text style={styles.username}>{user?.name || "Bạn"}</Text>
                <Text style={styles.privacy}>🌍 Công khai</Text>
              </View>
            </View>


            {/* INPUT */}
            <TextInput
              placeholder="Bạn đang nghĩ gì?"
              value={description}
              onChangeText={setDescription}
              multiline
              style={styles.descriptionInput}
            />


            {/* MEDIA */}
            {(previewImage || previewVideo) && (
              <View style={styles.previewMediaContainer}>
                {previewImage && (
                  <Image
                    cachePolicy={"none"}
                    source={{ uri: previewImage }}
                    style={styles.previewImage}
                    contentFit="cover"
                  />
                )}
                {previewVideo && (
                  <VideoView
                    player={previewPlayer}
                    nativeControls
                    contentFit="cover"
                    style={styles.previewImage}
                  />
                )}
              </View>
            )}


            {/* BOTTOM ACTIONS */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                marginTop: 16,
              }}>
              <TouchableOpacity
                onPress={pickImage}
                style={{ alignItems: "center" }}>
                <Ionicons
                  name="image"
                  size={22}
                />
                <Text style={{ fontSize: 12 }}>Thư viện</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={pickVideo}
                style={{ alignItems: "center" }}>
                <Ionicons
                  name="film"
                  size={22}
                />
                <Text style={{ fontSize: 12 }}>Video</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "300",
    lineHeight: 32,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  previewImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 16,
  },
  descriptionInput: {
    width: "100%",
    minHeight: 80,
    maxHeight: 120,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    color: "#000",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  cancelButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  postButton: {
    backgroundColor: "#000",
  },
  postButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  privacy: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  content: {
    padding: 0,
    paddingBottom: 80,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
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
  timeRemainingBadge: {
    backgroundColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timeRemainingText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
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
  postFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  postDescription: {
    fontSize: 15,
    color: "#000",
    lineHeight: 20,
  },
  postInfo: {
    fontSize: 14,
    color: "#666",
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
  previewMediaContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 1,
    marginBottom: 16,
  },
  previewVideoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 12,
  },
})



