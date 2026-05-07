import React from "react"
import { 
  FlatList, 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity 
} from "react-native"
import { Image } from "expo-image"
import { Ionicons } from "@expo/vector-icons"
import { Story } from "@/hooks/useStories"

interface ProfileVideosProps {
  stories: Story[]
  onPressStory: (story: Story) => void
}

export const ProfileVideos = ({ stories, onPressStory }: ProfileVideosProps) => {
  // Lọc lấy các story có videoUrl
  const videoStories = stories.filter(s => s.video_url)

  return (
    <View style={styles.container}>
      <FlatList
        data={videoStories}
        numColumns={3}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.videoCard}
            onPress={() => onPressStory(item)}
          >
            <Image 
              source={{ uri: item.image_url }} 
              style={styles.thumbnail} 
            />
            <View style={styles.playIcon}>
              <Ionicons name="play" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Chưa có video ngắn nào</Text>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 2,
    backgroundColor: "#fff",
  },
  videoCard: {
    width: "33.33%",
    aspectRatio: 9/16,
    padding: 2,
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#000",
  },
  playIcon: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  emptyText: {
    textAlign: "center",
    padding: 40,
    color: "#65676b",
  },
})
