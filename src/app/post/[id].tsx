import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import { useLocalSearchParams, useRouter } from "expo-router"
import React, { useEffect, useState } from "react"
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View
} from "react-native"
import { CommentInput } from "../../components/CommentInput"
import { useAuth } from "../../context/AuthContext"
import { getCommentsByPost, getPostDetail, PostResponse } from "../../services/post.service"


export default function PostDetailScreen() {
  const { id } = useLocalSearchParams()
  const { accessToken } = useAuth()
  const [post, setPost] = useState<PostResponse | null>(null)
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        if (!accessToken) {
          return
        }

        const postRes = await getPostDetail(id as string, accessToken)
        setPost(postRes)
        const commentsRes = await getCommentsByPost(id as string)
        setComments(commentsRes)
      } catch (error) {
        console.error("Error loading post detail:", error)
        Alert.alert("Lỗi", "Không thể tải chi tiết bài viết.")
      } finally {
        setLoading(false)
      }
    }

    if (id && accessToken) {
      fetchData()
    }
  }, [id, accessToken])


  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!post) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
        <Text style={{ fontSize: 16, color: "#333" }}>Không tìm thấy bài viết.</Text>
      </View>
    )
  }

  const renderPostHeader = () => (
    <View style={{ padding: 16, backgroundColor: "#fff" }}>
      {post.user?.username ? (
        <Text style={{ color: "#666", marginBottom: 12 }}>@{post.user.username}</Text>
      ) : null}
      {post.imageUrl ? (
        <Image
          source={{ uri: post.imageUrl }}
          style={{ width: "100%", height: 280, borderRadius: 16, marginBottom: 14 }}
          contentFit="cover"
        />
      ) : null}
      {post.videoUrl ? (
        <View style={{ marginBottom: 14, padding: 12, borderWidth: 1, borderColor: "#ddd", borderRadius: 12 }}>
          <Text style={{ color: "#444" }}>Video: {post.videoUrl}</Text>
        </View>
      ) : null}
      <Text style={{ fontSize: 16, lineHeight: 24, color: "#222" }}>
        {post.description || "Bài viết không có nội dung mô tả."}
      </Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 14 }}>
        <Text style={{ color: "#666" }}>
          {new Date(post.createdAt).toLocaleDateString()}
        </Text>
        <Text style={{ color: "#666" }}>
          {post.isActive ? "Đang hoạt động" : "Đã hết hạn"}
        </Text>
      </View>
      <Text style={{ marginTop: 18, fontWeight: "bold", fontSize: 16 }}>Bình luận</Text>
    </View>
  )

  const router = useRouter()

  const renderHeader = () => (
    <View
      style={{
        width: "100%",
        paddingTop: 42,
        paddingBottom: 14,
        paddingHorizontal: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderColor: "#eee",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
      <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
        <Ionicons name="chevron-back" size={24} color="#333" />
      </TouchableOpacity>
      <Text style={{ fontSize: 18, fontWeight: "bold", flex: 1, textAlign: "center" }}>
        Chi tiết bài viết
      </Text>
      <View style={{ width: 40 }} />
    </View>
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f3f3f3" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 80}>
        {renderHeader()}
        <FlatList
          data={comments}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={{ padding: 14, backgroundColor: "#fff", borderBottomWidth: 1, borderColor: "#eee" }}>
              <Text style={{ fontWeight: "bold", marginBottom: 6 }}>
                {item.user?.username || "User"}
              </Text>
              <Text style={{ color: "#333" }}>{item.content}</Text>
            </View>
          )}
          ListHeaderComponent={renderPostHeader}
          contentContainerStyle={{ paddingBottom: 180 }}
          keyboardShouldPersistTaps="handled"
        />
        <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "#fff", paddingBottom: Platform.OS === "ios" ? 20 : 8 }}>
          <CommentInput
            postId={id as string}
            onCommented={() => {
              getCommentsByPost(id as string).then(setComments)
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}



