import React from "react"
import { StyleSheet, Text, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface ProfileAboutProps {
  profile: any
}

export const ProfileAbout = ({ profile }: ProfileAboutProps) => {
  const infoItems = [
    { icon: "school", label: "Từng học tại", value: profile.school },
    { icon: "home", label: "Đến từ", value: profile.hometown },
    { icon: "heart", label: "Tình trạng", value: profile.relationship },
    { icon: "calendar", label: "Ngày sinh", value: profile.birthday },
    { icon: "star", label: "Sở thích", value: profile.interests },
    { 
      icon: "time", 
      label: "Tham gia vào", 
      value: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("vi-VN") : undefined 
    },
  ]

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chi tiết</Text>
      
      {infoItems.map((item, index) => item.value ? (
        <View key={index} style={styles.infoRow}>
          <Ionicons name={item.icon as any} size={20} color="#65676b" style={styles.icon} />
          <Text style={styles.infoText}>
            {item.label} <Text style={styles.boldText}>{item.value}</Text>
          </Text>
        </View>
      ) : null)}

      {!infoItems.some(item => item.value) && (
        <Text style={styles.emptyText}>Chưa có thông tin giới thiệu chi tiết.</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  icon: {
    width: 28,
  },
  infoText: {
    fontSize: 16,
    color: "#050505",
  },
  boldText: {
    fontWeight: "bold",
  },
  emptyText: {
    color: "#65676b",
    textAlign: "center",
    marginTop: 20,
  }
})
