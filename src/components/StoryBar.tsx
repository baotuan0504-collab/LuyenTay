import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";


export interface StoryUser {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  hasUnseenStory?: boolean;
}


interface StoryBarProps {
  currentUser?: {
    id: string;
    avatar?: string;
    name: string;
  };
  usersWithStories: StoryUser[];
  onUserPress: (userId: string) => void;
  onAddStoryPress: () => void;
}


export const StoryBar = ({
  currentUser,
  usersWithStories,
  onUserPress,
  onAddStoryPress,
}: StoryBarProps) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Current User "Add Story" */}
        <TouchableOpacity
          style={styles.storyItem}
          onPress={onAddStoryPress}
          activeOpacity={0.8}
        >
          <View style={styles.avatarContainer}>
            {currentUser?.avatar ? (
              <Image
                source={{ uri: currentUser.avatar }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.placeholderAvatar]}>
                <Text style={styles.placeholderText}>
                  {currentUser?.name?.[0]?.toUpperCase() || "U"}
                </Text>
              </View>
            )}
            <View style={styles.addButton}>
              <Ionicons name="add" size={16} color="#fff" />
            </View>
          </View>
          <Text style={styles.username} numberOfLines={1}>
            Your Story
          </Text>
        </TouchableOpacity>


        {/* Other Users' Stories */}
        {usersWithStories.map((user) => (
          <TouchableOpacity
            key={user.id}
            style={styles.storyItem}
            onPress={() => onUserPress(user.id)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.avatarContainer,
                user.hasUnseenStory && styles.unseenRing,
              ]}
            >
              {user.avatar ? (
                <Image
                  source={{ uri: user.avatar }}
                  style={[styles.avatar, styles.innerAvatar]}
                />
              ) : (
                <View style={[styles.avatar, styles.innerAvatar, styles.placeholderAvatar]}>
                  <Text style={styles.placeholderText}>
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.username} numberOfLines={1}>
              {user.username}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  storyItem: {
    alignItems: "center",
    width: 72,
  },
  avatarContainer: {
    position: "relative",
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  unseenRing: {
    borderWidth: 2,
    borderColor: "#ff3b30", // Reddish like FB/IG unseen
    padding: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f5f5f5",
  },
  innerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  placeholderAvatar: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#666",
  },
  addButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007bff", // FB Blue
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  username: {
    marginTop: 4,
    fontSize: 12,
    color: "#333",
    textAlign: "center",
  },
});



