import { useAuth } from "@/context/AuthContext";
import * as chatService from "@/services/chat.service";
import * as userService from "@/services/user.service";
import * as friendService from "@/services/friend.service";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert,
} from "react-native";

type TabType = "friends" | "discover" | "requests";

export default function FriendsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("friends");
  const [users, setUsers] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [sentRequestIds, setSentRequestIds] = useState<Set<string>>(new Set());
  
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { user: currentUser } = useAuth();
  const router = useRouter();

  const loadData = useCallback(async () => {
    try {
      const [allUsersRes, myFriendsRes, requestsRes] = await Promise.all([
        userService.getUsers(),
        friendService.getFriendsList(),
        friendService.getPendingRequests()
      ]);

      const allUsers = allUsersRes || [];
      const myFriends = myFriendsRes || [];
      const requests = requestsRes || { received: [], sent: [] };

      // Filter out current user from discover list
      const discoverUsers = allUsers.filter((u: any) => 
        u._id !== currentUser?.id && 
        !myFriends.some((f: any) => f._id === u._id)
      );

      setUsers(discoverUsers);
      setFriends(myFriends);
      setPendingRequests(requests.received);
      
      // Track IDs of users we sent requests to
      const sentIds = new Set(requests.sent.map((r: any) => r.user._id));
      setSentRequestIds(sentIds);
      
      updateFilteredData(activeTab, { 
        discover: discoverUsers, 
        friends: myFriends, 
        requests: requests.received 
      });
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentUser, activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateFilteredData = (tab: TabType, currentData: any) => {
    let data = [];
    if (tab === "friends") data = currentData.friends;
    else if (tab === "discover") data = currentData.discover;
    else data = currentData.requests;

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      data = data.filter((item: any) => {
        const u = item.user || item; // requests have .user
        return u.name?.toLowerCase().includes(query) || u.username?.toLowerCase().includes(query);
      });
    }
    setFilteredData(data);
  };

  useEffect(() => {
    updateFilteredData(activeTab, { discover: users, friends, requests: pendingRequests });
  }, [searchQuery, activeTab, users, friends, pendingRequests]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const handleAddFriend = async (userId: string) => {
    try {
      await friendService.sendFriendRequest(userId);
      // Optimistic update
      setSentRequestIds(prev => new Set(prev).add(userId));
      loadData();
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể gửi lời mời");
    }
  };

  const handleCancelRequest = async (userId: string) => {
    try {
      // In the backend, canceling a sent request can be handled by unfriend or a specific cancel endpoint
      // Our unfriend endpoint deletes the relationship record regardless of status if implemented correctly
      // Let's check backend unfriend logic
      await friendService.unfriend(userId);
      setSentRequestIds(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
      loadData();
    } catch (error: any) {
      Alert.alert("Lỗi", "Không thể hủy lời mời");
    }
  };

  const handleAcceptRequest = async (requesterId: string) => {
    try {
      await friendService.acceptFriendRequest(requesterId);
      loadData();
    } catch (error: any) {
      Alert.alert("Lỗi", "Không thể chấp nhận lời mời");
    }
  };

  const handleDeclineRequest = async (requesterId: string) => {
    try {
      await friendService.declineFriendRequest(requesterId);
      loadData();
    } catch (error: any) {
      Alert.alert("Lỗi", "Không thể từ chối lời mời");
    }
  };

  const handleUnfriend = (userId: string) => {
    Alert.alert("Hủy kết bạn", "Bạn có chắc chắn muốn hủy kết bạn?", [
      { text: "Hủy", style: "cancel" },
      { 
        text: "Đồng ý", 
        style: "destructive", 
        onPress: async () => {
          try {
            await friendService.unfriend(userId);
            loadData();
          } catch (error) {
            Alert.alert("Lỗi", "Không thể hủy kết bạn");
          }
        }
      }
    ]);
  };

  const startChat = async (user: any) => {
    try {
      const chat = await chatService.getOrCreateChat(user._id);
      router.push({
        pathname: "/chat/[id]",
        params: { 
          id: chat._id, 
          name: user.name, 
          avatar: user.avatar,
          participantId: user._id
        }
      });
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isRequest = activeTab === "requests";
    const user = isRequest ? item.user : item;
    
    if (!user) return null;
    
    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity style={styles.itemMain} onPress={() => router.push(`/profile/${user._id}`)}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>{user.name?.[0]?.toUpperCase() || "U"}</Text>
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userHandle}>@{user.username}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.actions}>
          {activeTab === "friends" && (
            <>
              <TouchableOpacity style={[styles.actionBtn, styles.chatBtn]} onPress={() => startChat(user)}>
                <Ionicons name="chatbubble-outline" size={18} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.moreBtn]} onPress={() => handleUnfriend(user._id)}>
                <Ionicons name="person-remove-outline" size={18} color="#FF3B30" />
              </TouchableOpacity>
            </>
          )}

          {activeTab === "discover" && (
            sentRequestIds.has(user._id) ? (
              <TouchableOpacity 
                style={[styles.actionBtn, styles.declineBtn]} 
                onPress={() => handleCancelRequest(user._id)}
              >
                <Ionicons name="close-outline" size={18} color="#48484A" />
                <Text style={styles.declineBtnText}>Hủy lời mời</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.actionBtn, styles.addBtn]} 
                onPress={() => handleAddFriend(user._id)}
              >
                <Ionicons name="person-add" size={18} color="#FFF" />
                <Text style={styles.addBtnText}>Kết bạn</Text>
              </TouchableOpacity>
            )
          )}

          {activeTab === "requests" && (
            <View style={styles.requestActions}>
              <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={() => handleAcceptRequest(user._id)}>
                <Text style={styles.acceptBtnText}>Chấp nhận</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.declineBtn]} onPress={() => handleDeclineRequest(user._id)}>
                <Text style={styles.declineBtnText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === "friends" && styles.activeTab]} 
            onPress={() => setActiveTab("friends")}
          >
            <Text style={[styles.tabText, activeTab === "friends" && styles.activeTabText]}>Bạn bè</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === "discover" && styles.activeTab]} 
            onPress={() => setActiveTab("discover")}
          >
            <Text style={[styles.tabText, activeTab === "discover" && styles.activeTabText]}>Khám phá</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === "requests" && styles.activeTab]} 
            onPress={() => setActiveTab("requests")}
          >
            <Text style={[styles.tabText, activeTab === "requests" && styles.activeTabText]}>
              Lời mời {pendingRequests.length > 0 && `(${pendingRequests.length})`}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={(item) => (item.user?._id || item._id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons 
                name={activeTab === 'requests' ? 'mail-outline' : 'people-outline'} 
                size={64} 
                color="#CCC" 
              />
              <Text style={styles.emptyText}>
                {activeTab === 'friends' ? "Chưa có bạn bè nào" : 
                 activeTab === 'requests' ? "Không có lời mời nào" : "Không có ai để khám phá"}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#F2F2F7",
  },
  activeTab: {
    backgroundColor: "#007AFF",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8E8E93",
  },
  activeTabText: {
    color: "#FFF",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#000",
  },
  listContent: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  itemMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    backgroundColor: "#E5E5EA",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8E8E93",
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  userHandle: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  chatBtn: {
    backgroundColor: "#E1F5FE",
  },
  moreBtn: {
    backgroundColor: "#FFEBEE",
  },
  addBtn: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    gap: 4,
  },
  addBtnText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
  },
  requestActions: {
    flexDirection: "row",
    gap: 6,
  },
  acceptBtn: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
  },
  acceptBtnText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
  },
  declineBtn: {
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 12,
  },
  declineBtnText: {
    color: "#48484A",
    fontSize: 13,
    fontWeight: "600",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
    color: "#8E8E93",
  },
});
