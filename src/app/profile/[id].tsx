import { useAuth } from "@/context/AuthContext";
import { isUnauthorizedError } from "@/services/api";
import * as chatService from "@/services/chat.service";
import * as userService from "@/services/user.service";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function PublicProfileScreen() {
  const { id: userId } = useLocalSearchParams();
  const { accessToken, user: currentUser, signOut } = useAuth();
  const router = useRouter();


  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingChat, setIsStartingChat] = useState(false);


  useEffect(() => {
    if (accessToken && userId) {
      loadProfile();
    }
  }, [accessToken, userId]);


  const loadProfile = async () => {
    try {
      const data = await userService.getUserById(userId as string, accessToken!);
      console.log("Loaded profile:", data);
      setProfile(data);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        await signOut();
        router.replace("/login");
        return;
      }
      console.error("Error loading profile:", error);
      Alert.alert("Error", "Could not load user profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessage = async () => {
    if (!accessToken || !profile) return;
   
    setIsStartingChat(true);
    try {
      const chat = await chatService.getOrCreateChat(profile._id, accessToken);
      router.push({
        pathname: "/chat/[id]",
        params: {
          id: chat._id,
          name: profile.name,
          avatar: profile.avatar || "",
          participantId: profile._id
        },
      });
    } catch (error) {
      if (isUnauthorizedError(error)) {
        await signOut();
        router.replace("/login");
        return;
      }
      console.error("Error starting chat:", error);
      Alert.alert("Error", "Could not start conversation");
    } finally {
      setIsStartingChat(false);
    }
  };


  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }


  const isMe = currentUser?.id === profile?._id;


  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>


      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileInfo}>
          {profile.avatar ? (
            <Image source={{ uri: profile.avatar }} style={styles.largeAvatar} />
          ) : (
            <View style={[styles.largeAvatar, styles.avatarPlaceholder]}>
              <Text style={styles.largeAvatarText}>
                {profile.name?.[0]?.toUpperCase() || "U"}
              </Text>
            </View>
          )}
         
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.username}>@{profile.username}</Text>
        
          <Text style={styles.joinedDate}>
            Joined {new Date(profile.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {!isMe && (
          <TouchableOpacity
            style={styles.messageButton}
            onPress={handleMessage}
            disabled={isStartingChat}
          >
            {isStartingChat ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="chatbubble-outline" size={20} color="#fff" />
                <Text style={styles.messageButtonText}>Message</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  scrollContent: {
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  profileInfo: {
    alignItems: "center",
    marginBottom: 30,
  },
  largeAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  avatarPlaceholder: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  largeAvatarText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#666",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  joinedDate: {
    fontSize: 14,
    color: "#999",
  },
  messageButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    gap: 10,
    width: "100%",
    maxWidth: 250,
  },
  messageButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  editButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  editButtonText: {
    color: "#007AFF",
    fontWeight: "500",
  },
  input:{
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
  }
});



