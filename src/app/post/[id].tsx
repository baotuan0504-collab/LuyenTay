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
  View,
} from "react-native"
import { CommentInput } from "../../components/CommentInput"
import { ReactionBar } from "../../components/ReactionBar"
import { useAuth } from "../../context/AuthContext"
import {
  getCommentsByPost,
  getPostDetail,
  PostResponse,
} from "../../services/post.service"
import {
  getMyReaction,
  getReactionCounts,
  removeReaction,
  upsertReaction,
} from "../../services/reaction.service"


export default function PostDetailScreen() {
  const { id } = useLocalSearchParams()
  const { accessToken } = useAuth()
  const [post, setPost] = useState<PostResponse | null>(null)
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [myReaction, setMyReaction] = useState<string | undefined>(undefined)
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>(
    {},
  )


  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        if (!accessToken) return
        const postRes = await getPostDetail(id as string, accessToken)
        setPost(postRes)
        const commentsRes = await getCommentsByPost(id as string)
        setComments(commentsRes)
        // Lấy reaction
        const myReact = await getMyReaction(id as string, "post", accessToken)
        setMyReaction(myReact?.reactionType)
        const counts = await getReactionCounts(id as string, "post")
        const countObj: Record<string, number> = {}
        counts.forEach((r: any) => {
          countObj[r._id] = r.count
        })
        setReactionCounts(countObj)
      } catch (error) {
        console.error("Error loading post detail:", error)
        Alert.alert("Lỗi", "Không thể tải chi tiết bài viết.")
      } finally {
        setLoading(false)
      }
    }
    if (id && accessToken) fetchData()
  }, [id, accessToken])


  const handleReaction = async (type: string) => {
    if (!accessToken) return
    try {
      if (myReaction === type) {
        await removeReaction(id as string, "post", accessToken)
        setMyReaction(undefined)
        setReactionCounts(c => ({
          ...c,
          [type]: Math.max((c[type] || 1) - 1, 0),
        }))
      } else {
        await upsertReaction(id as string, "post", type, accessToken)
        setMyReaction(type)
        setReactionCounts(c => ({
          ...c,
          [type]: (c[type] || 0) + 1,
          ...(myReaction
            ? { [myReaction]: Math.max((c[myReaction] || 1) - 1, 0) }
            : {}),
        }))
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật reaction.")
    }
  }


  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }


  if (!post) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}>
        <Text style={{ fontSize: 16, color: "#333" }}>
          Không tìm thấy bài viết.
        </Text>
      </View>
    )
  }


  const renderPostHeader = () => (
    <View
      style={{
        backgroundColor: "#fff",
        padding: 16,
        shadowColor: "#000",
      }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 10,
        }}>
      </View>
      <Text
        style={{
          fontSize: 16,
          lineHeight: 24,
          color: "#222",
          marginBottom: 10,
        }}>
        {post.description}
      </Text>
      {post.imageUrl ? (
        <Image
          source={{ uri: post.imageUrl }}
          style={{
            width: "100%",
            height: 260,
            borderRadius: 14,
            marginBottom: 14,
            backgroundColor: "#f3f3f3",
          }}
          contentFit="cover"
        />
      ) : null}
      {post.videoUrl ? (
        <View
          style={{
            marginBottom: 14,
            padding: 12,
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 12,
          }}>
          <Text style={{ color: "#444" }}>Video: {post.videoUrl}</Text>
        </View>
      ) : null}

      <ReactionBar
        selected={myReaction}
        onSelect={handleReaction}
        counts={reactionCounts}
        onCommentPress={() => {

        }}
      />
    </View>
  )


  const router = useRouter()


  const renderHeader = () => (
    <View
      style={{
        width: "100%",
        paddingTop: 15,
        paddingBottom: 14,
        paddingHorizontal: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderColor: "#eee",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View style={{ position: "absolute", left: 16 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>
        Chi tiết bài viết
      </Text>
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
          keyExtractor={item => item._id}
          ListHeaderComponent={renderPostHeader}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                padding: 14,
                backgroundColor: "#fff",
                borderBottomWidth: 1,
                borderColor: "#f3f3f3",
              }}>
              <Image
                source={{ uri: item.user?.avatar }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  marginRight: 10,
                  backgroundColor: "#eee",
                }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontWeight: "bold",
                    color: "#222",
                    marginBottom: 2,
                  }}>
                  {item.user?.name || "User"}
                </Text>

                <Text style={{ color: "#333", fontSize: 15 }}>
                  {item.content}
                </Text>
              </View>
            </View>
          )}
          contentContainerStyle={{
            paddingBottom: 180,
            backgroundColor: "#f3f3f3",
          }}
          keyboardShouldPersistTaps="handled"
        />
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#fff",
            paddingBottom: Platform.OS === "ios" ? 20 : 8,
          }}>
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