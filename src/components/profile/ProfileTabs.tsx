import React from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

export const ProfileTabs = () => {
  const tabs = ["Video ngắn", "Ảnh", "Bạn bè", "Giới thiệu"]
  const activeTab = "Ảnh"

  return (
    <View style={styles.container}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.activeTab]}>
          <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f0f2f5",
    paddingHorizontal: 8,
    backgroundColor: "#fff",
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#1877F2",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#65676b",
  },
  activeTabText: {
    color: "#1877F2",
  },
})
