import React, { useEffect, useState } from "react";
import { 
  StyleSheet, View, Text, TextInput, TouchableOpacity, 
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Modal, FlatList as RNFlatList
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as chatService from "@/services/chat.service";
import * as userService from "@/services/user.service";
import { useAuth } from "@/context/AuthContext";
import ColorPickerComponent from "@/components/color-picker.io";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";

export default function GroupSettingsScreen() {
  const { id: chatId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [chat, setChat] = useState<chatService.ChatResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [groupName, setGroupName] = useState("");
  const [nicknames, setNicknames] = useState<Record<string, string>>({});
  
  // Add Member State
  const [showAddModal, setShowAddModal] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadChatDetails();
  }, [chatId]);

  const loadChatDetails = async () => {
    try {
      console.log('DEBUG: Fetching chat details for ID:', chatId);
      const data = await chatService.getChatById(chatId as string);
      console.log('DEBUG: Chat details received:', data);
      
      setChat(data);
      setGroupName(data.name || "");
      setNicknames(data.nicknames || {});
      
      // Load friends for adding
      const allUsers = await userService.getUsers() || [];
      // Filter out current participants
      const currentParticipantIds = data.participants?.map((p: any) => p._id) || [];
      const availableFriends = allUsers.filter((u: any) => 
        u._id !== user?.id && !currentParticipantIds.includes(u._id)
      );
      setFriends(availableFriends);
    } catch (error) {
      console.error("Error loading chat details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!chatId || !groupName.trim()) return;
    
    setUpdating(true);
    try {
      await chatService.updateChat(chatId as string, {
        name: groupName.trim(),
        nicknames: nicknames
      });
      Alert.alert("Thành công", "Thông tin nhóm đã được cập nhật.");
      router.back();
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể cập nhật thông tin.");
    } finally {
      setUpdating(false);
    }
  };

  const handleAddMembers = async () => {
    if (selectedFriends.length === 0) return;
    
    setIsAdding(true);
    try {
      await chatService.addParticipants(chatId as string, selectedFriends);
      Alert.alert("Thành công", `Đã thêm ${selectedFriends.length} thành viên mới.`);
      setShowAddModal(false);
      setSelectedFriends([]);
      loadChatDetails(); // Refresh list
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể thêm thành viên.");
    } finally {
      setIsAdding(false);
    }
  };

  const toggleSelectFriend = (userId: string) => {
    setSelectedFriends(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const updateNickname = (userId: string, name: string) => {
    setNicknames(prev => ({ ...prev, [userId]: name }));
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066FF" />
      </View>
    );
  }

  const isCreator = chat?.creator === user?.id;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt nhóm</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          disabled={updating || !isCreator}
          style={[styles.headerButton, !isCreator && { opacity: 0 }]}
        >
          {updating ? (
            <ActivityIndicator size="small" color="#0066FF" />
          ) : (
            <Text style={styles.saveText}>Lưu</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tên nhóm</Text>
            <TextInput
              style={[styles.input, !isCreator && styles.disabledInput]}
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Nhập tên nhóm..."
              editable={isCreator}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Biệt danh thành viên</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => setShowAddModal(true)}
              >
                <Ionicons name="person-add-outline" size={20} color="#0066FF" />
                <Text style={styles.addButtonText}>Thêm</Text>
              </TouchableOpacity>
            </View>
            {chat?.participants?.map((participant: any) => (
              <View key={participant._id} style={styles.memberRow}>
                <View style={styles.memberInfo}>
                  <Text style={styles.realName}>{participant.name}</Text>
                  <Text style={styles.username}>@{participant.username}</Text>
                </View>
                <TextInput
                  style={[styles.nicknameInput, !isCreator && styles.disabledInput]}
                  value={nicknames[participant._id] || ""}
                  onChangeText={(val) => updateNickname(participant._id, val)}
                  placeholder="Đặt biệt danh..."
                  editable={isCreator}
                />
              </View>
            ))}
          </View>

          {!isCreator && (
            <View style={styles.warningBox}>
              <Ionicons name="information-circle" size={20} color="#8E8E93" />
              <Text style={styles.warningText}>Chỉ trưởng nhóm mới có quyền thay đổi thông tin này.</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Add Member Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancel}>Hủy</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Thêm thành viên</Text>
            <TouchableOpacity 
              onPress={handleAddMembers}
              disabled={selectedFriends.length === 0 || isAdding}
            >
              {isAdding ? (
                <ActivityIndicator size="small" color="#0066FF" />
              ) : (
                <Text style={[styles.modalDone, selectedFriends.length === 0 && styles.modalDisabled]}>Thêm</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm bạn bè..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <RNFlatList
            data={friends.filter(f => 
              f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              f.username.toLowerCase().includes(searchQuery.toLowerCase())
            )}
            keyExtractor={item => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.friendItem}
                onPress={() => toggleSelectFriend(item._id)}
              >
                {item.avatar ? (
                  <Image source={{ uri: item.avatar }} style={styles.friendAvatar} />
                ) : (
                  <View style={styles.friendAvatarPlaceholder}>
                    <Text style={styles.avatarInitial}>{item.name[0]}</Text>
                  </View>
                )}
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{item.name}</Text>
                  <Text style={styles.friendUsername}>@{item.username}</Text>
                </View>
                <View style={[
                  styles.checkbox,
                  selectedFriends.includes(item._id) && styles.checkboxSelected
                ]}>
                  {selectedFriends.includes(item._id) && (
                    <Ionicons name="checkmark" size={16} color="#FFF" />
                  )}
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.friendList}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F5",
  },
  headerButton: {
    padding: 4,
    minWidth: 40,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  saveText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0066FF",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8E8E93",
    textTransform: "uppercase",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  input: {
    fontSize: 16,
    color: "#1A1A1A",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F5",
  },
  disabledInput: {
    color: "#8E8E93",
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F5",
  },
  memberInfo: {
    flex: 1,
  },
  realName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  username: {
    fontSize: 12,
    color: "#8E8E93",
  },
  nicknameInput: {
    flex: 1,
    fontSize: 14,
    color: "#0066FF",
    textAlign: "right",
    paddingVertical: 4,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    padding: 12,
    borderRadius: 12,
  },
  warningText: {
    fontSize: 13,
    color: "#8E8E93",
    marginLeft: 8,
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E1E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addButtonText: {
    marginLeft: 4,
    fontSize: 13,
    fontWeight: '700',
    color: '#0066FF',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  modalCancel: {
    fontSize: 16,
    color: '#FF3B30',
  },
  modalDone: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0066FF',
  },
  modalDisabled: {
    color: '#C7C7CC',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  friendList: {
    paddingHorizontal: 16,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  friendAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E1E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0066FF',
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  friendUsername: {
    fontSize: 13,
    color: '#8E8E93',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#0066FF',
    borderColor: '#0066FF',
  },
});
