import { PostCard } from "@/components/PostCard"
import { ProfileHeader } from "@/components/profile/ProfileHeader"
import { ProfilePhotos } from "@/components/profile/ProfilePhotos"
import { ProfileTabs } from "@/components/profile/ProfileTabs"
import { StoryBar } from "@/components/StoryBar"
import { StoryViewer } from "@/components/StoryViewer"
import { useAuth } from "@/context/AuthContext"
import { usePosts } from "@/hooks/usePosts"
import { Story, useStories } from "@/hooks/useStories"
import { isUnauthorizedError } from "@/services/api"
import * as chatService from "@/services/chat.service"
import * as friendService from "@/services/friend.service"
import { getReactionUsers } from "@/services/reaction.service"
import * as userService from "@/services/user.service"
import { useLocalSearchParams, useRouter } from "expo-router"
import React, { useEffect, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"

export default function PublicProfileScreen() {
  const { id: userId } = useLocalSearchParams()
  const { accessToken, user: currentUser, signOut } = useAuth()
  const router = useRouter()

  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isStartingChat, setIsStartingChat] = useState(false)
  const [friendshipStatus, setFriendshipStatus] = useState<string>("none")
  const [refreshing, setRefreshing] = useState(false)

  // React list modals
  const [showReactors, setShowReactors] = useState(false)
  const [reactors, setReactors] = useState<any[]>([])

  // Stories
  const [isViewerVisible, setIsViewerVisible] = useState(false)
  const [selectedUserStories, setSelectedUserStories] = useState<Story[]>([])

  const { posts, refreshPosts, isLoading: postsLoading } = usePosts()
  const { stories, refreshStories, isLoading: storiesLoading } = useStories()

  useEffect(() => {
    if (accessToken && userId) {
      loadData()
    }
  }, [accessToken, userId])

  const loadData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        loadProfile(),
        refreshPosts(userId as string),
        refreshStories(userId as string),
        loadFriendshipStatus(),
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const loadProfile = async () => {
    try {
      const data = await userService.getUserById(userId as string)
      setProfile(data)
    } catch (error) {
      if (isUnauthorizedError(error)) {
        await signOut()
        router.replace("/login")
        return
      }
      Alert.alert("Error", "Could not load user profile")
    }
  }

  const loadFriendshipStatus = async () => {
    if (!userId || userId === currentUser?.id) return
    try {
      const res = await friendService.getFriendshipStatus(userId as string)
      setFriendshipStatus(res.status)
    } catch (e) {
      console.error("Load friendship status failed", e)
    }
  }

  const handleFriendAction = async () => {
    if (friendshipStatus === "none") {
      try {
        await friendService.sendFriendRequest(userId as string)
        setFriendshipStatus("pending")
        Alert.alert("Thành công", "Đã gửi lời mời kết bạn")
      } catch (e) {
        Alert.alert("Lỗi", "Không thể gửi lời mời kết bạn")
      }
    } else if (friendshipStatus === "accepted") {
      Alert.alert("Hủy kết bạn", "Bạn có chắc muốn hủy kết bạn?", [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đồng ý",
          style: "destructive",
          onPress: async () => {
            try {
              await friendService.unfriend(userId as string)
              setFriendshipStatus("none")
            } catch (e) {
              Alert.alert("Lỗi", "Không thể hủy kết bạn")
            }
          },
        },
      ])
    }
  }

  const handleMessage = async () => {
    if (!accessToken || !profile) return
    setIsStartingChat(true)
    try {
      const chat = await chatService.getOrCreateChat(profile._id)
      router.push({
        pathname: "/chat/[id]",
        params: {
          id: chat._id,
          name: profile.name,
          avatar: profile.avatar || "",
          participantId: profile._id,
        },
      })
    } catch (error) {
      Alert.alert("Error", "Could not start conversation")
    } finally {
      setIsStartingChat(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const handleShowReactors = async (post: any) => {
    try {
      const data = await getReactionUsers(post.id, "post")
      setReactors(data)
      setShowReactors(true)
    } catch (error) {
      Alert.alert("Error", "Could not load reaction list")
    }
  }

  const userStoriesGroup = useMemo(() => {
    if (stories.length === 0) return []
    const profileData = stories[0].profiles
    return [
      {
        id: String(userId),
        name: profileData?.name || profile?.name || "User",
        username: profileData?.username || profile?.username || "user",
        avatar: profileData?.profile_image_url || profile?.avatar,
        thumbnail: stories[stories.length - 1]?.image_url,
        hasUnseenStory: true,
        stories: [...stories].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        ),
      },
    ]
  }, [stories, userId, profile])

  if (isLoading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1877F2" />
      </View>
    )
  }

  if (!profile) return null

  const isMe = currentUser?.id === profile?._id

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.floatingBackButton}>
        <Ionicons name="chevron-back" size={24} color="#fff" />
      </TouchableOpacity>

      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            currentUserId={currentUser?.id}
            onShowReactors={handleShowReactors}
          />
        )}
        ListHeaderComponent={
          <>
            <ProfileHeader
              profile={profile}
              isMe={isMe}
              friendshipStatus={friendshipStatus}
              onMessage={handleMessage}
              onFriendAction={handleFriendAction}
              isStartingChat={isStartingChat}
            />

            {stories.length > 0 && (
              <StoryBar
                usersWithStories={userStoriesGroup}
                onUserPress={() => {
                  setSelectedUserStories(stories)
                  setIsViewerVisible(true)
                }}
                onSelfPress={() => {}}
                onAddStoryPress={() => {}}
              />
            )}

            <ProfileTabs />
            <ProfilePhotos posts={posts} />

            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Bài viết của {profile.name}</Text>
            </View>
          </>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1877F2"]}
            tintColor="#1877F2"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có bài viết nào</Text>
          </View>
        }
      />

      <StoryViewer
        visible={isViewerVisible}
        stories={selectedUserStories}
        initialIndex={0}
        onClose={() => setIsViewerVisible(false)}
      />

      {/* Reactors Modal */}
      <Modal visible={showReactors} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Người đã thả cảm xúc</Text>
            <FlatList
              data={reactors}
              keyExtractor={(item, idx) => item._id || String(idx)}
              renderItem={({ item }) => (
                <View style={styles.reactorItem}>
                  <Text>{item.user?.name || "Người dùng"}</Text>
                  <Text style={styles.reactorType}>{item.reactionType}</Text>
                </View>
              )}
            />
            <Text style={styles.closeModal} onPress={() => setShowReactors(false)}>
              Đóng
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 8,
    borderTopColor: "#f0f2f5",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    maxHeight: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  reactorItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  reactorType: {
    color: "#1877F2",
    textTransform: "capitalize",
  },
  closeModal: {
    marginTop: 16,
    color: "#1877F2",
    textAlign: "center",
    fontWeight: "bold",
  },
  floatingBackButton: {
    position: "absolute",
    top: 50,
    left: 16,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.4)",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
})
