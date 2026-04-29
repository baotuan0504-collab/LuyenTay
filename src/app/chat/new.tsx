import { useAuth } from "@/context/AuthContext";
import { isUnauthorizedError } from "@/services/api";
import * as chatService from "@/services/chat.service";
import * as userService from "@/services/user.service";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NewChatScreen() {
  const { accessToken, signOut } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<Array<{ _id: string; name: string; username?: string; avatar?: string; email?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [startingChatId, setStartingChatId] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    loadUsers();
  }, [accessToken]);

  const loadUsers = async () => {
    try {
      const data = await userService.getUsers();
      if (data) {
        setUsers(data);
      }
    } catch (error) {
      if (isUnauthorizedError(error)) {
        await signOut();
        router.replace("/login");
        return;
      }
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (participantId: string, name: string, avatar?: string) => {
    if (!accessToken) return;
    setStartingChatId(participantId);
    try {
      const chat = await chatService.getOrCreateChat(participantId);
      router.push({
        pathname: "/chat/[id]",
        params: {
          id: chat._id,
          name,
          avatar: avatar || "",
          participantId,
        },
      });
    } catch (error) {
      if (isUnauthorizedError(error)) {
        await signOut();
        router.replace("/login");
        return;
      }
      console.error("Error starting chat:", error);
    } finally {
      setStartingChatId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Bắt đầu chat</Text>
        <View style={{ width: 24 }} />
      </View>

      <TouchableOpacity
        style={styles.newGroupButton}
        onPress={() => router.push("/chat/new-group")}
      >
        <View style={styles.newGroupIcon}>
          <Ionicons name="people" size={24} color="#0066FF" />
        </View>
        <Text style={styles.newGroupText}>Tạo nhóm mới</Text>
        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
      </TouchableOpacity>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userItem}
              onPress={() => handleStartChat(item._id, item.name, item.avatar)}
              disabled={startingChatId === item._id}
            >
              {item.avatar ? (
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarText}>{item.name?.[0]?.toUpperCase() || "U"}</Text>
                </View>
              )}
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userSubtitle}>{item.username || item.email || "Unknown"}</Text>
              </View>
              <View style={styles.actionArea}>
                {startingChatId === item._id ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Ionicons name="chatbubble-outline" size={22} color="#000" />
                )}
              </View>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No users available.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#666",
    fontSize: 18,
    fontWeight: "700",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  userSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  actionArea: {
    width: 40,
    alignItems: "center",
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    color: "#999",
  },
  newGroupButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F5",
  },
  newGroupIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E1E8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  newGroupText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
});