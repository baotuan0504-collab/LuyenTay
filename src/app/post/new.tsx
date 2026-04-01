import { usePosts } from "@/hooks/usePosts"
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
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"

export default function NewPostScreen() {
  const router = useRouter()
  const { createPost } = usePosts()

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

        const { uri: thumb } =
          await VideoThumbnails.getThumbnailAsync(compressed, {
            time: 0,
          })

        setPreviewImage(thumb)
      } finally {
        setIsUploading(false)
      }
    }
  }

  // ================= POST =================
  const handlePost = async () => {
    if (!previewImage) {
      return Alert.alert("Thiếu media", "Hãy chọn ảnh hoặc video.")
    }

    setIsUploading(true)
    try {
      await createPost(previewImage, description, previewVideo || undefined)
      router.back()
    } catch {
      Alert.alert("Lỗi", "Đăng bài thất bại")
    } finally {
      setIsUploading(false)
    }
  }

  // ================= UI =================
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Bài viết mới</Text>

        <TouchableOpacity
          onPress={handlePost}
          disabled={isUploading}
          style={styles.postBtn}>
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
            source={{
              uri: "https://i.pravatar.cc/150?img=3",
            }}
            style={styles.avatar}
          />

          <View>
            <Text style={styles.name}>Bảo Tuấn</Text>

            <View style={styles.privacyRow}>
              <Text style={styles.privacy}>🌍 Công khai</Text>
            </View>
          </View>
        </View>

        {/* OPTIONS */}
        <View style={styles.optionsRow}>
          <Option icon="musical-notes" label="Nhạc" />
          <Option icon="people" label="Mọi người" />
          <Option icon="location" label="Vị trí" />
          <Option icon="happy" label="Cảm xúc" />
        </View>

        {/* INPUT */}
        <TextInput
          placeholder="Bạn đang nghĩ gì?"
          value={description}
          onChangeText={setDescription}
          multiline
          style={styles.input}
        />

        {/* MEDIA */}
        {previewImage && (
          <View style={styles.mediaBox}>
            <Image source={{ uri: previewImage }} style={styles.preview} />

            {previewVideo && (
              <VideoView player={player} style={styles.preview} />
            )}
          </View>
        )}
      </ScrollView>

      {/* BOTTOM ACTION */}
      <View style={styles.bottomBar}>
        <BottomItem icon="image" label="Thư viện" onPress={pickImage} />
        <BottomItem icon="film" label="Video" onPress={pickVideo} />
        <BottomItem icon="star" label="Cột mốc" onPress={() => {}} />
        <BottomItem icon="videocam" label="Trực tiếp" onPress={() => {}} />
      </View>
    </View>
  )
}

// ================= COMPONENTS =================

function Option({ icon, label }: any) {
  return (
    <TouchableOpacity style={styles.option}>
      <Ionicons name={icon} size={16} />
      <Text style={styles.optionText}>{label}</Text>
    </TouchableOpacity>
  )
}

function BottomItem({ icon, label, onPress }: any) {
  return (
    <TouchableOpacity style={styles.bottomItem} onPress={onPress}>
      <Ionicons name={icon} size={22} />
      <Text style={styles.bottomText}>{label}</Text>
    </TouchableOpacity>
  )
}

// ================= STYLES =================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  headerTitle: { fontSize: 16, fontWeight: "600" },

  postBtn: {
    backgroundColor: "#1877F2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },

  postText: { color: "#fff", fontWeight: "600" },

  userRow: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },

  name: { fontWeight: "600", fontSize: 15 },

  privacyRow: { marginTop: 2 },

  privacy: {
    fontSize: 12,
    backgroundColor: "#eee",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  optionsRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    gap: 8,
  },

  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f2f6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  optionText: { marginLeft: 4, fontSize: 13 },

  input: {
    padding: 12,
    fontSize: 18,
    minHeight: 120,
  },

  mediaBox: {
    width: "100%",
    aspectRatio: 1,
  },

  preview: {
    width: "100%",
    height: "100%",
  },

  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderColor: "#eee",
    paddingVertical: 10,
  },

  bottomItem: { alignItems: "center" },

  bottomText: { fontSize: 12, marginTop: 4 },
})

