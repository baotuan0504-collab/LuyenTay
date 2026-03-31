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
  thumbnail?: string;
  hasUnseenStory?: boolean;
}




interface StoryBarProps {
  currentUser?: {
    id: string;
    avatar?: string;
    name: string;
    thumbnail?: string;
    hasStory?: boolean;
  };
  usersWithStories: StoryUser[];
  onUserPress: (userId: string) => void;
  onSelfPress: () => void;
  onAddStoryPress: () => void;
}




export const StoryBar = ({
  currentUser,
  usersWithStories,
  onUserPress,
  onSelfPress,
  onAddStoryPress,
}: StoryBarProps) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Current User "Add Story" or "View Own Story" */}
        <TouchableOpacity
          style={styles.cardContainer}
          onPress={onSelfPress}
          activeOpacity={0.9}
        >
          {/* Card Background */}
          {currentUser?.hasStory ? (
            <Image
              source={{ uri: currentUser.thumbnail || currentUser.avatar }}
              style={styles.cardBackground}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.cardBackground, { backgroundColor: "#f0f2f5" }]}>
              {currentUser?.avatar ? (
                <Image source={{ uri: currentUser.avatar }} style={styles.cardBackground} />
              ) : (
                <Ionicons name="person" size={40} color="#ccc" style={{ alignSelf: "center", marginTop: 40 }} />
              )}
            </View>
          )}


          {/* User Avatar Overlay (Top Left) */}
          <View style={[styles.miniAvatarContainer, currentUser?.hasStory && styles.unseenRing]}>
            <Image
              source={{ uri: currentUser?.avatar }}
              style={styles.miniAvatar}
            />
          </View>


          {/* Plus Button Overlay (Center/Bottom depending on style) */}
          <TouchableOpacity
            style={styles.cardAddButton}
            onPress={(e) => {
              e.stopPropagation();
              onAddStoryPress();
            }}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>


          <View style={styles.cardTextContainer}>
            <Text style={styles.cardUsername} numberOfLines={2}>
              Create Story
            </Text>
          </View>
        </TouchableOpacity>




        {/* Other Users' Stories */}
        {usersWithStories.map((user) => (
          <TouchableOpacity
            key={user.id}
            style={styles.cardContainer}
            onPress={() => onUserPress(user.id)}
            activeOpacity={0.9}
          >
            {/* Card Background (Story Thumbnail) */}
            <Image
              source={{ uri: user.thumbnail || user.avatar }}
              style={styles.cardBackground}
              contentFit="cover"
            />
           
            {/* User Avatar Overlay (Top Left) */}
            <View style={[styles.miniAvatarContainer, user.hasUnseenStory && styles.unseenRing]}>
              <Image
                source={{ uri: user.avatar }}
                style={styles.miniAvatar}
              />
            </View>


            {/* Username Overlay (Bottom) */}
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardUsername} numberOfLines={2}>
                {user.name}
              </Text>
            </View>
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
    gap: 8,
  },
  cardContainer: {
    width: 100,
    height: 160,
    borderRadius: 12,
    backgroundColor: "#eee",
    overflow: "hidden",
    position: "relative",
  },
  cardBackground: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  miniAvatarContainer: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#fff",
    overflow: "hidden",
    zIndex: 2,
    backgroundColor: "#fff",
  },
  unseenRing: {
    borderColor: "#007bff", // FB Blue for unseen
  },
  miniAvatar: {
    width: "100%",
    height: "100%",
  },
  cardAddButton: {
    position: "absolute",
    top: 30,
    alignSelf: "center",
    backgroundColor: "#007bff",
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3,
  },
  cardTextContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    paddingTop: 20,
    backgroundColor: "rgba(0,0,0,0.3)", // Soft overlay for text
    height: 60,
    justifyContent: "flex-end",
  },
  cardUsername: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 3,
  },
});









