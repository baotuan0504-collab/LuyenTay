import React, { useState } from "react"
import {
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"

import { useAuth } from "../context/AuthContext"
import { apiFetch } from "../services/api"

interface Props {
  postId: string
  replyTo?: any
  onCommented?: () => void
  onCancelReply?: () => void
}

export function CommentInput({
  postId,
  replyTo,
  onCommented,
  onCancelReply,
}: Props) {
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
          parentId: replyTo?._id || null,
        }),
      })

      setContent("")
      onCommented?.()

    } catch (error: unknown) {
      console.error("Send comment error:", error)
    } finally {
      setLoading(false)
    }
  }

  const canSend = Boolean(content.trim() && accessToken && !loading)

  return (
    <View
      style={{
        borderTopWidth: 1,
        borderColor: "#ddd",
        backgroundColor: "#fff",
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: Platform.OS === "ios" ? 18 : 10,
      }}
    >
      
      {replyTo && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <Text style={{ color: "#555" }}>
            Đang trả lời{" "}
            <Text style={{ fontWeight: "bold" }}>
              {replyTo?.user?.name}
            </Text>
          </Text>

          <TouchableOpacity onPress={onCancelReply}>
            <Text style={{ color: "red" }}>
              Huỷ
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
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
          placeholder={
            replyTo
              ? `Trả lời ${replyTo?.user?.name}...`
              : "Viết bình luận..."
          }
          placeholderTextColor="#999"
          editable={!loading}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />

        <TouchableOpacity
          onPress={handleSend}
          disabled={!canSend}
          style={{
            backgroundColor: canSend ? "black" : "#ccc",
            paddingVertical: 12,
            paddingHorizontal: 18,
            borderRadius: 24,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>
            Gửi
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  )
}