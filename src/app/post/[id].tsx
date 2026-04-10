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
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

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


// FIX BUILD TREE
const buildCommentTree = (comments: any[]) => {
  const map: any = {}
  const roots: any[] = []

  comments.forEach((c) => {
    map[c._id] = {
      ...c,
      children: [],
    }
  })

  comments.forEach((c) => {
    const parentId = c.parentId || c.parentComment

    if (parentId && map[parentId]) {
      map[parentId].children.push(map[c._id])
    } else {
      roots.push(map[c._id])
    }
  })

  return flattenComments(roots)
}

const flattenComments = (comments: any[], level = 0): any[] => {
  let result: any[] = []

  comments.forEach((comment) => {
    result.push({
      ...comment,
      level,
    })

    if (comment.children && comment.children.length > 0) {
      result = result.concat(
        flattenComments(comment.children, level + 1),
      )
    }
  })

  return result
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams()
  const { accessToken } = useAuth()

  const [post, setPost] = useState<PostResponse | null>(null)
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [replyTo, setReplyTo] = useState<any>(null)

  const [myReaction, setMyReaction] = useState<string>()
  const [reactionCounts, setReactionCounts] = useState<any>({})

  const router = useRouter()

  const loadComments = async () => {
    const res = await getCommentsByPost(id as string)

    const raw = Array.isArray(res?.comments) ? res.comments : []

    console.log("RAW COMMENTS", raw)

    const tree = buildCommentTree(raw)

    console.log("TREE COMMENTS", tree)

    setComments(tree)
  }

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        const postRes = await getPostDetail(id as string, accessToken!)
        setPost(postRes)

        await loadComments()

        const myReact = await getMyReaction(
          id as string,
          "post",
          accessToken!,
        )

        setMyReaction(myReact?.reactionType)

        const counts = await getReactionCounts(id as string, "post")

        const obj: any = {}
        counts.forEach((r: any) => {
          obj[r._id] = r.count
        })

        setReactionCounts(obj)

      } catch {
        Alert.alert("Lỗi tải bài viết")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleReaction = async (type: string) => {
    if (myReaction === type) {
      await removeReaction(id as string, "post", accessToken!)
      setMyReaction(undefined)
    } else {
      await upsertReaction(id as string, "post", type, accessToken!)
      setMyReaction(type)
    }
  }

  const renderHeader = () => (
    <View
      style={{
        padding: 14,
        borderBottomWidth: 1,
        borderColor: "#eee",
        backgroundColor: "#fff",
        alignItems: "center",
      }}>
      <TouchableOpacity
        style={{
          position: "absolute",
          left: 16,
        }}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} />
      </TouchableOpacity>

      <Text style={{ fontWeight: "bold", fontSize: 18 }}>
        Chi tiết bài viết
      </Text>
    </View>
  )

  const renderPostHeader = () => (
    <View style={{ padding: 16, backgroundColor: "#fff" }}>
      <Text>{post?.description}</Text>

      {post?.imageUrl && (
        <Image
          source={{ uri: post.imageUrl }}
          style={{
            width: "100%",
            height: 260,
            borderRadius: 12,
            marginTop: 10,
          }}
        />
      )}

      <ReactionBar
        selected={myReaction}
        onSelect={handleReaction}
        counts={reactionCounts}
      />
    </View>
  )

  const renderComment = ({ item }: any) => (
    <View
      style={{
        flexDirection: "row",
        padding: 14,
        paddingLeft: 14 + item.level * 20,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderColor: "#eee",
      }}
    >
      <Image
        source={{ uri: item.user?.avatar }}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          marginRight: 10,
        }}
      />

      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: "bold" }}>
          {item.user?.name}
        </Text>

        <Text>{item.content}</Text>

        <TouchableOpacity
          onPress={() => setReplyTo(item)}
        >
          <Text style={{ color: "#1877f2" }}>
            Trả lời
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  )

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >

        {renderHeader()}

        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={item => item._id}
          ListHeaderComponent={renderPostHeader}
        />

        <CommentInput
          postId={id as string}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          onCommented={() => {
            setReplyTo(null)
            loadComments()
          }}
        />

      </KeyboardAvoidingView>

    </SafeAreaView>
  )
}