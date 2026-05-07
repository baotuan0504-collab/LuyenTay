import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import { useRouter } from "expo-router"
import React, { useEffect, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native"
import * as storyService from "@/services/story.service"
import { StoryViewer } from "@/components/StoryViewer"

const { width } = Dimensions.get("window")
const COLUMN_WIDTH = width / 3

export default function StoryArchiveScreen() {
  const router = useRouter()
  const [stories, setStories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStory, setSelectedStory] = useState<any>(null)
  const [isViewerVisible, setIsViewerVisible] = useState(false)

  useEffect(() => {
    loadArchive()
  }, [])

  const loadArchive = async () => {
    try {
      setLoading(true)
      const data = await storyService.getArchivedStories()
      setStories(data || [])
    } catch (error) {
      console.error("Load archive failed", error)
    } finally {
      setLoading(false)
    }
  }

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.storyCard}
      onPress={() => {
        setSelectedStory(item)
        setIsViewerVisible(true)
      }}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} contentFit="cover" />
      {item.videoUrl && (
        <View style={styles.playIcon}>
          <Ionicons name="play" size={24} color="#fff" />
        </View>
      )}
      <View style={styles.dateBadge}>
        <Text style={styles.dateText}>
          {new Date(item.createdAt).toLocaleDateString("vi-VN", { day: "numeric", month: "short" })}
        </Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kho lưu trữ Story</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color="#1877F2" />
      ) : (
        <FlatList
          data={stories}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          numColumns={3}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="archive-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Chưa có Story nào trong kho lưu trữ</Text>
            </View>
          }
        />
      )}

      {selectedStory && (
        <StoryViewer
          visible={isViewerVisible}
          stories={[selectedStory]}
          initialIndex={0}
          onClose={() => setIsViewerVisible(false)}
        />
      )}
    </SafeAreaView>
  )
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
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  listContent: {
    padding: 1,
  },
  storyCard: {
    width: COLUMN_WIDTH - 2,
    height: (COLUMN_WIDTH - 2) * 1.6,
    margin: 1,
    backgroundColor: "#f0f2f5",
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
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
  dateBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dateText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 16,
    color: "#65676b",
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 32,
  },
})
