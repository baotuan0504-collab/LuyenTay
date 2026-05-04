import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import React from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface ProfileHeaderProps {
  profile: any
  isMe: boolean
  friendshipStatus: string
  onMessage: () => void
  onFriendAction: () => void
  isStartingChat?: boolean
}

export const ProfileHeader = ({
  profile,
  isMe,
  friendshipStatus,
  onMessage,
  onFriendAction,
  isStartingChat,
}: ProfileHeaderProps) => {
  return (
    <View style={styles.container}>
      {/* Cover Photo */}
      <View style={styles.coverContainer}>
        {profile.coverPhoto ? (
          <Image source={{ uri: profile.coverPhoto }} style={styles.coverPhoto} />
        ) : (
          <View style={[styles.coverPhoto, styles.coverPlaceholder]} />
        )}
      </View>

      {/* Profile Info Section */}
      <View style={styles.infoSection}>
        <View style={styles.avatarWrapper}>
          {profile.avatar ? (
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {profile.name?.[0]?.toUpperCase() || "U"}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.username}>Tài Khoản: {profile.username || "Thành viên"}</Text>

        <View style={styles.actionButtons}>
          {!isMe && (
            <>
              <TouchableOpacity
                style={[
                  styles.button,
                  friendshipStatus === "accepted" ? styles.friendButton : styles.primaryButton,
                ]}
                onPress={onFriendAction}>
                <Ionicons
                  name={friendshipStatus === "accepted" ? "people" : "person-add"}
                  size={20}
                  color={friendshipStatus === "accepted" ? "#000" : "#fff"}
                />
                <Text
                  style={[
                    styles.buttonText,
                    friendshipStatus === "accepted" && styles.friendButtonText,
                  ]}>
                  {friendshipStatus === "accepted"
                    ? "Bạn bè"
                    : friendshipStatus === "pending"
                    ? "Đang chờ"
                    : "Thêm bạn bè"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={onMessage}>
                <Ionicons name="chatbubble" size={20} color="#fff" />
                <Text style={styles.buttonText}>Nhắn tin</Text>
              </TouchableOpacity>
            </>
          )}
          {isMe && (
            <TouchableOpacity style={[styles.button, styles.friendButton]}>
              <Ionicons name="create-outline" size={20} color="#000" />
              <Text style={styles.friendButtonText}>Chỉnh sửa trang cá nhân</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
  coverContainer: {
    height: 200,
    backgroundColor: "#ddd",
  },
  coverPhoto: {
    width: "100%",
    height: "100%",
  },
  coverPlaceholder: {
    backgroundColor: "#f0f2f5",
  },
  infoSection: {
    alignItems: "center",
    paddingBottom: 16,
    marginTop: -50,
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#fff",
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    backgroundColor: "#f0f2f5",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#666",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
  },
  username: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    paddingHorizontal: 16,
    width: "100%",
    justifyContent: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
    flex: 1,
    maxWidth: 180,
  },
  primaryButton: {
    backgroundColor: "#1877F2",
  },
  friendButton: {
    backgroundColor: "#e4e6eb",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  friendButtonText: {
    color: "#000",
  },
})
