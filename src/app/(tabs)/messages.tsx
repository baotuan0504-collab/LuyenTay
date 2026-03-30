import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { isUnauthorizedError } from "@/services/api";
import * as chatService from "@/services/chat.service";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function MessagesScreen() {
  const [chats, setChats] = useState<chatService.ChatResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { accessToken, signOut } = useAuth();
  const { onlineUsers, typingUsers } = useChat();
  const router = useRouter();

  useEffect(() => {
    if (accessToken) {
      loadChats();
    }
  }, [accessToken]);

  const loadChats = async () => {
    if (!accessToken) return;
    try {
      const data = await chatService.getChats(accessToken);
      setChats(data);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        await signOut();
        router.replace("/login");
        return;
      }
      console.error("Error loading chats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChats();
    setRefreshing(false);
  };

  const renderChat = ({ item }: { item: chatService.ChatResponse }) => {
    const isOnline = item.participant
      ? onlineUsers.includes(item.participant._id)
      : false;

    const isTyping =
      typingUsers.get(item._id) === item.participant?._id;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() =>
          router.push({
            pathname: "/chat/[id]",
            params: {
              id: item._id,
              name: item.participant?.name || "User",
              avatar: item.participant?.avatar || "",
              participantId: item.participant?._id || "",
            },
          })
        }
      >
        <View style={styles.avatarContainer}>
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
            <Text style={styles.username}>
              {item.participant?.name}
            </Text>

            {item.lastMessageAt && (
              <View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.time}>
                    {new Date(item.lastMessageAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>

                  <Ionicons
                    name="ellipsis-horizontal"
                    size={16}
                    color="#999"
                    style={{ marginLeft: 10 }}
                  />
                </View>
              </View>
            )}
          </View>

          <Text
            style={[
              styles.lastMessage,
              isTyping && styles.typingText,
            ]}
            numberOfLines={1}
          >
            {isTyping
              ? "typing..."
              : item.lastMessage?.text ||
              "No messages yet"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChat}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="chatbubbles-outline"
                size={64}
                color="#ccc"
              />
              <Text style={styles.emptyText}>
                No conversations yet
              </Text>
            </View>
          }
        />
      )}

      {/* Floating New Chat Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/chat/new")}
      >
        <Ionicons name="create" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
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

  listContent: {
    flexGrow: 1,
    paddingTop: 20,
  },

  chatItem: {
    flexDirection: "row",
    paddingHorizontal: 20,
    alignItems: "center",
  },

  avatarContainer: {
    position: "relative",
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  avatarPlaceholder: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#666",
  },

  onlineBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4CAF50",
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
    marginBottom: 4,
  },

  username: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
  },

  time: {
    fontSize: 12,
    color: "#999",
  },

  lastMessage: {
    fontSize: 15,
    color: "#666",
  },

  typingText: {
    color: "#F4A261",
    fontStyle: "italic",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },

  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#999",
  },
  /* Floating Button */

  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#000",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
});