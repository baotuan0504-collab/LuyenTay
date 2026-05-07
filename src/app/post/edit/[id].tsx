import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import * as ImagePicker from "expo-image-picker"
import { useLocalSearchParams, useRouter } from "expo-router"
import { VideoView, useVideoPlayer } from "expo-video"
import * as VideoThumbnails from "expo-video-thumbnails"
import React, { useEffect, useState } from "react"
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

import { useAuth } from "@/context/AuthContext"
import { usePosts } from "@/hooks/usePosts"
import { compressImage, compressVideo } from "@/lib/media"
import { uploadPostImage, uploadPostVideo } from "@/lib/supabase/storage"
import { getPostDetail } from "@/services/post.service"

export default function EditPostScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const { updatePost } = usePosts()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [description, setDescription] = useState("")
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [previewVideo, setPreviewVideo] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [privacy, setPrivacy] = useState<"public" | "private">("public")

  const player = useVideoPlayer(previewVideo ?? null, p => {
    p.loop = true
  })

  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true)
        const postData = await getPostDetail(id as string)
        if (postData) {
          setDescription(postData.description || "")
          setPreviewImage(postData.imageUrl || null)
          setPreviewVideo(postData.videoUrl || null)
          setPrivacy(postData.privacy || "public")
        }
      } catch (error) {
        console.error("Error fetching post for edit:", error)
        Alert.alert("Lỗi", "Không thể tải dữ liệu bài viết")
        router.back()
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [id])

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") return Alert.alert("Cần quyền", "Cho phép truy cập thư viện ảnh.")

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
    if (status !== "granted") return Alert.alert("Cần quyền", "Cho phép truy cập video.")

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
        const { uri: thumb } = await VideoThumbnails.getThumbnailAsync(compressed, { time: 0 })
        setPreviewImage(thumb)
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleSave = async () => {
    if (isUploading) return
    setIsUploading(true)
    try {
      let imageUrl = previewImage
      let videoUrl = previewVideo

      // Nếu ảnh/video là file local (bắt đầu bằng file://), ta cần upload lên Supabase
      if (previewImage && previewImage.startsWith("file://")) {
        imageUrl = await uploadPostImage(user!.id, previewImage)
      }
      if (previewVideo && previewVideo.startsWith("file://")) {
        videoUrl = await uploadPostVideo(user!.id, previewVideo)
      }

      await updatePost(id as string, description, imageUrl || undefined, videoUrl || undefined, privacy)
      router.back()
    } catch (error) {
      console.error("Error saving post edit:", error)
      Alert.alert("Lỗi", "Cập nhật bài viết thất bại")
    } finally {
      setIsUploading(false)
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa bài viết</Text>
        <TouchableOpacity onPress={handleSave} disabled={isUploading} style={styles.saveBtn}>
          {isUploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Lưu</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView>
        <View style={styles.userRow}>
          <Image source={{ uri: user?.avatar }} style={styles.avatar} />
          <View>
            <Text style={styles.name}>{user?.name || "Bạn"}</Text>
            <TouchableOpacity
              style={styles.privacyRow}
              onPress={() => setPrivacy(p => p === "public" ? "private" : "public")}
            >
              <Text style={styles.privacy}>
                {privacy === "public" ? "🌍 Công khai" : "🔒 Chỉ mình tôi"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TextInput
          placeholder="Bạn đang nghĩ gì?"
          value={description}
          onChangeText={setDescription}
          multiline
          style={styles.input}
        />

        {previewImage && (
          <View style={styles.mediaBox}>
            <Image source={{ uri: previewImage }} style={styles.preview} />
            {previewVideo && <VideoView player={player} style={styles.preview} />}
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomItem} onPress={pickImage}>
          <Ionicons name="image" size={22} />
          <Text style={styles.bottomText}>Đổi ảnh</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomItem} onPress={pickVideo}>
          <Ionicons name="film" size={22} />
          <Text style={styles.bottomText}>Đổi Video</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  headerTitle: { fontSize: 16, fontWeight: "600" },
  saveBtn: { backgroundColor: "#1877F2", paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6 },
  saveText: { color: "#fff", fontWeight: "600" },
  userRow: { flexDirection: "row", padding: 16, alignItems: "center" },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  name: { fontWeight: "600", fontSize: 15 },
  privacyRow: { marginTop: 2 },
  privacy: {
    fontSize: 12,
    backgroundColor: "#eee",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  input: { padding: 16, fontSize: 18, minHeight: 120 },
  mediaBox: { width: "100%", height: 300, overflow: "hidden" },
  preview: { width: "100%", height: "100%" },
  bottomBar: { flexDirection: "row", justifyContent: "space-around", borderTopWidth: 1, borderColor: "#eee", paddingVertical: 12 },
  bottomItem: { alignItems: "center" },
  bottomText: { fontSize: 12, marginTop: 4 },
})
