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
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NewGroupScreen() {
  const { accessToken, signOut } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<Array<{ _id: string; name: string; avatar?: string }>>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) return;
    
    setCreating(true);
    try {
      const chat = await chatService.createGroupChat(selectedUsers, groupName.trim());
      router.push({
        pathname: "/chat/[id]",
        params: {
          id: chat._id,
          name: groupName.trim(),
          avatar: "",
          isGroup: "true",
        },
      });
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Lỗi khi tạo nhóm. Vui lòng thử lại!");
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={26} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.title}>Tạo nhóm mới</Text>
        <TouchableOpacity 
          onPress={handleCreateGroup} 
          disabled={!groupName.trim() || selectedUsers.length === 0 || creating}
          style={[styles.createButton, (!groupName.trim() || selectedUsers.length === 0) && styles.disabledButton]}
        >
          {creating ? (
            <ActivityIndicator size="small" color="#0066FF" />
          ) : (
            <Text style={styles.createButtonText}>Tạo</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.groupNameInput}
            placeholder="Tên nhóm..."
            value={groupName}
            onChangeText={setGroupName}
            placeholderTextColor="#8E8E93"
          />
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm bạn bè..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#8E8E93"
            />
          </View>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#0066FF" />
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.userItem}
                onPress={() => toggleUserSelection(item._id)}
              >
                <View style={styles.avatarWrapper}>
                  {item.avatar ? (
                    <Image source={{ uri: item.avatar }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                      <Text style={styles.avatarText}>{item.name?.[0]?.toUpperCase() || "U"}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.userName}>{item.name}</Text>
                <View style={[
                  styles.checkbox, 
                  selectedUsers.includes(item._id) && styles.checkboxSelected
                ]}>
                  {selectedUsers.includes(item._id) && (
                    <Ionicons name="checkmark" size={16} color="#FFF" />
                  )}
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContent}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F5",
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  createButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0066FF",
  },
  disabledButton: {
    opacity: 0.4,
  },
  inputContainer: {
    padding: 16,
    backgroundColor: "#F8F9FB",
  },
  groupNameInput: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 40,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: "#1A1A1A",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 16,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F5",
  },
  avatarWrapper: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    backgroundColor: "#E1E8FF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#0066FF",
    fontSize: 18,
    fontWeight: "700",
  },
  userName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D1D6",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#0066FF",
    borderColor: "#0066FF",
  },
});
