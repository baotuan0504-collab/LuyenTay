import { useAuth } from "@/context/AuthContext"
import { useStories } from "@/hooks/useStories"
import { compressImage, compressVideo } from "@/lib/media"
import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import * as ImagePicker from "expo-image-picker"
import { useRouter } from "expo-router"
import { VideoView, useVideoPlayer } from "expo-video"
import * as VideoThumbnails from "expo-video-thumbnails"
import { useState } from "react"
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"


export default function NewStoryScreen() {
  const router = useRouter()
  const { createStory } = useStories()
  const { user } = useAuth()


  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [previewVideo, setPreviewVideo] = useState<string | null>(null)
  const [description, setDescription] = useState("")
  const [isUploading, setIsUploading] = useState(false)


  const player = useVideoPlayer(previewVideo ?? null, p => {
    p.loop = true
  })


  // ================= MEDIA =================
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      return Alert.alert("Cần quyền", "Cho phép truy cập thư viện ảnh.")
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    })
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri
      setIsUploading(true)
      try {
        const compressed = await compressImage(uri)
        setPreviewImage(compressed.uri)
        setPreviewVideo(null)
      } finally {
        setIsUploading(false)
      }
    }
  }


  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      return Alert.alert("Cần quyền", "Cho phép truy cập video.")
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      quality: 0.8,
    })
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri
      setIsUploading(true)
      try {
        const compressed = await compressVideo(uri)
        setPreviewVideo(compressed)
        const { uri: thumb } = await VideoThumbnails.getThumbnailAsync(
          compressed,
          { time: 0 },
        )
        setPreviewImage(thumb)
      } finally {
        setIsUploading(false)
      }
    }
  }


  // ================= STORY =================
  const handleStory = async () => {
    if (!previewImage) {
      return Alert.alert("Thiếu media", "Hãy chọn ảnh hoặc video.")
    }
    setIsUploading(true)
    try {
      await createStory(previewImage, description, previewVideo || undefined)
      router.back()
    } catch {
      Alert.alert("Lỗi", "Đăng story thất bại")
    } finally {
      setIsUploading(false)
    }
  }


  // ================= UI =================
  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}>
          <Ionicons
            name="close"
            size={24}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Story mới</Text>
        <TouchableOpacity
          onPress={handleStory}
          disabled={isUploading}
          style={styles.postBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}>
          {isUploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.postText}>Đăng</Text>
          )}
        </TouchableOpacity>
      </View>
      <ScrollView>
        {/* USER INFO */}
        <View style={styles.userRow}>
          <Image
            source={{ uri: user?.avatar }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.name}>{user?.name || "Bạn"}</Text>
            <View style={styles.privacyRow}>
              <Text style={styles.privacy}>🌍 Công khai</Text>
            </View>
          </View>
        </View>
        {/* INPUT */}
        <TextInput
          placeholder="Bạn muốn chia sẻ gì?"
          value={description}
          onChangeText={setDescription}
          multiline
          style={styles.input}
        />
        {/* MEDIA */}
        {previewImage && (
          <View style={styles.mediaBox}>
            <Image
              source={{ uri: previewImage }}
              style={styles.preview}
            />
            {previewVideo && (
              <VideoView
                player={player}
                style={styles.preview}
              />
            )}
          </View>
        )}
      </ScrollView>
      {/* BOTTOM ACTION */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={pickImage}
          style={styles.bottomItem}>
          <Ionicons
            name="image"
            size={22}
          />
          <Text style={styles.bottomText}>Thư viện</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={pickVideo}
          style={styles.bottomItem}>
          <Ionicons
            name="film"
            size={22}
          />
          <Text style={styles.bottomText}>Video</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  postBtn: {
    backgroundColor: "#000",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  postText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
  },
  privacyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  privacy: {
    fontSize: 13,
    color: "#888",
  },
  input: {
    minHeight: 80,
    fontSize: 16,
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    margin: 16,
    color: "#000",
  },
  mediaBox: {
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#eee",
  },
  preview: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  bottomItem: {
    alignItems: "center",
    gap: 4,
  },
  bottomText: {
    fontSize: 12,
    color: "#222",
    marginTop: 2,
  },
})



