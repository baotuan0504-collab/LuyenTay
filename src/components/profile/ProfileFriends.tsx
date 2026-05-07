import React, { useEffect, useState } from "react"
import { 
  ActivityIndicator, 
  FlatList, 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity 
} from "react-native"
import { Image } from "expo-image"
import { useRouter } from "expo-router"
import * as friendService from "@/services/friend.service"

interface ProfileFriendsProps {
  userId: string
}

export const ProfileFriends = ({ userId }: ProfileFriendsProps) => {
  const [friends, setFriends] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadFriends()
  }, [userId])

  const loadFriends = async () => {
    try {
      setLoading(true)
      const data = await friendService.getFriendsList(userId)
      setFriends(data || [])
    } catch (error) {
      console.error("Load profile friends failed", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <ActivityIndicator style={{ padding: 20 }} color="#1877F2" />

  return (
    <View style={styles.container}>
      <FlatList
        data={friends}
        numColumns={3}
        keyExtractor={(item) => item._id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.friendCard}
            onPress={() => router.push(`/profile/${item._id}`)}
          >
            <Image 
              source={{ uri: item.avatar || item.profile_image_url }} 
              style={styles.friendAvatar} 
            />
            <Text style={styles.friendName} numberOfLines={1}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Chưa có bạn bè nào</Text>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: "#fff",
  },
  friendCard: {
    width: "33.33%",
    padding: 8,
    alignItems: "center",
  },
  friendAvatar: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: "#f0f2f5",
  },
  friendName: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    padding: 20,
    color: "#65676b",
  },
})
