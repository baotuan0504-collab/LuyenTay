import React, { useState } from "react"
import { Platform, Text, TextInput, TouchableOpacity, View } from "react-native"
import { useAuth } from "../context/AuthContext"
import { apiFetch } from "../services/api"


export function CommentInput({
  postId,
  replyTo,
  onCommented,
  onCancelReply,
}: {
  postId: string
  replyTo?: any
  onCommented?: () => void
  onCancelReply?: () => void
}) {
  const { accessToken } = useAuth()
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)


  const handleSend = async () => {
    if (!content.trim() || !accessToken) return
    setLoading(true)
    try {
      await apiFetch("/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          targetId: postId,
          targetType: "post",
          content,
          parentId: replyTo?._id
        }),
      })
      setContent("")
      onCommented?.()
    } catch (error: unknown) {
      console.error("Failed to send comment:", error)
    } finally {
      setLoading(false)
    }
  }


  const canSend = Boolean(content.trim() && accessToken && !loading)

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: Platform.OS === "ios" ? 18 : 10,
        borderTopWidth: 1,
        borderColor: "#ddd",
        backgroundColor: "#fff",
      }}>
      <TextInput
        style={{
          flex: 1,
          minHeight: 44,
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 24,
          paddingHorizontal: 16,
          paddingVertical: Platform.OS === "ios" ? 12 : 8,
          backgroundColor: "#f9f9f9",
          marginRight: 10,
        }}
        value={content}
        onChangeText={setContent}
        placeholder="Viết bình luận..."
        placeholderTextColor="#999"
        editable={!loading}
        returnKeyType="send"
        onSubmitEditing={handleSend}
      />
      <TouchableOpacity
        onPress={handleSend}
        disabled={!canSend}
        style={{
          backgroundColor: canSend ? "#007aff" : "#ccc",
          paddingVertical: 12,
          paddingHorizontal: 18,
          borderRadius: 24,
        }}>
        <Text style={{ color: "#fff", fontWeight: "600" }}>Gửi</Text>
      </TouchableOpacity>
    </View>
  )
}



