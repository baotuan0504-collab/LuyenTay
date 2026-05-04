import { useAuth } from "@/context/AuthContext"
import { useChat } from "@/context/ChatContext"
import { isUnauthorizedError } from "@/services/api"
import * as chatService from "@/services/chat.service"
import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import { useRouter, useFocusEffect } from "expo-router"
import { useEffect, useState, useCallback } from "react"

import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native"
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

export default function MessagesScreen() {
  const [chats, setChats] = useState<chatService.ChatResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const { accessToken, signOut } = useAuth()
  const { onlineUsers, typingUsers } = useChat()
  const { user } = useAuth()
  const router = useRouter()

  useFocusEffect(
    useCallback(() => {
      if (accessToken) {
        loadChats()
      }
    }, [accessToken])
  )

  const loadChats = async () => {
    if (!accessToken) return
    try {
      const data = await chatService.getChats()
      setChats(data)
    } catch (error) {
      if (isUnauthorizedError(error)) {
        await signOut()
        router.replace("/login")
        return
      }
      console.error("Error loading chats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadChats()
    setRefreshing(false)
  }

  const handleDeleteChat = async (chatId: string) => {
    Alert.alert(
      "Xóa cuộc trò chuyện",
      "Bạn có chắc chắn muốn xóa cuộc trò chuyện này không? Hành động này không thể hoàn tác.",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xóa", 
          style: "destructive", 
          onPress: async () => {
            try {
              await chatService.deleteChat(chatId);
              loadChats(); // Refresh list
            } catch (error) {
              console.error("Error deleting chat:", error);
              Alert.alert("Lỗi", "Không thể xóa cuộc trò chuyện.");
            }
          } 
        }
      ]
    );
  };

  const renderRightActions = (chatId: string, itemType: string, creator?: string | { _id: string }) => {
    const creatorId = typeof creator === 'string' ? creator : creator?._id;
    // Only allow delete if PRIVATE chat OR current user is GROUP creator
    const canDelete = itemType === 'PRIVATE' || (itemType === 'GROUP' && creatorId === user?.id);
    
    if (!canDelete) return null;

    return (
      <TouchableOpacity 
        style={styles.deleteAction} 
        onPress={() => handleDeleteChat(chatId)}
      >
        <Ionicons name="trash" size={28} color="#FFF" />
      </TouchableOpacity>
    );
  };

  const renderChat = ({ item }: { item: chatService.ChatResponse }) => {
    const isOnline = item.participant
      ? onlineUsers.includes(item.participant._id)
      : false

    const isTyping = typingUsers.get(item._id) === item.participant?._id

    return (
      <Swipeable
        renderRightActions={() => renderRightActions(item._id, item.type, item.creator)}
        friction={2}
        rightThreshold={40}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.chatItem}
          onPress={() =>
            router.push({
              pathname: "/chat/[id]",
              params: {
                id: item._id,
                name: item.participant?.name || "User",
                avatar: item.participant?.avatar || "",
                participantId: item.participant?._id || "",
                isGroup: item.type === 'GROUP' ? 'true' : 'false'
              },
            })
          }>
          <View style={styles.avatarWrapper}>
            {item.participant?.avatar ? (
              <Image
                source={{ uri: item.participant.avatar }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {item.participant?.name?.[0]?.toUpperCase() || "U"}
                </Text>
              </View>
            )}
            {isOnline && <View style={styles.onlineBadge} />}
          </View>

          <View style={styles.chatInfo}>
            <View style={styles.chatHeader}>
              <Text style={styles.username} numberOfLines={1}>
                {item.participant?.name || "Unknown User"}
              </Text>
              {item.lastMessageAt && (
                <Text style={styles.time}>
                  {new Date(item.lastMessageAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              )}
            </View>

            <View style={styles.lastMessageRow}>
              <Text
                style={[styles.lastMessage, isTyping && styles.typingText]} 
                numberOfLines={1}>
                {isTyping ? "đang soạn tin..." : (item.lastMessage?.text || "Bắt đầu cuộc trò chuyện ngay")}
              </Text>
              {item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unreadCount}</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>

        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#0066FF" />
          </View>
        ) : (
          <FlatList
            data={chats}
            renderItem={renderChat}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#0066FF"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="chatbubbles-outline" size={40} color="#0066FF" />
                </View>
                <Text style={styles.emptyTitle}>Chưa có tin nhắn</Text>
                <Text style={styles.emptySubtitle}>Hãy bắt đầu trò chuyện với bạn bè ngay!</Text>
              </View>
            }
          />
        )}

        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={() => router.push("/chat/new")}>
          <Ionicons name="create" size={26} color="#fff" />
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  headerIconButton: {
    marginLeft: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F3F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    marginTop: 16
  },
  chatItem: {
    flexDirection: "row",
    padding: 14,
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#F8F9FB',
  },
  avatarPlaceholder: {
    backgroundColor: "#E1E8FF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0066FF",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#34C759", // Modern Apple Green
    borderWidth: 2,
    borderColor: "#fff",
  },
  chatInfo: {
    flex: 1,
    marginLeft: 15,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
  },
  username: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A1A",
    maxWidth: '70%',
  },
  time: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: '500',
  },
  lastMessageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
    flex: 1,
    marginRight: 10,
  },
  typingText: {
    color: "#0066FF",
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: '#FF3B30',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E1E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 25,
    backgroundColor: "#0066FF",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#0066FF",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  deleteAction: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: 80, 
    borderRadius: 20,
    marginLeft: 10,
    marginBottom: 10,
  },
})
