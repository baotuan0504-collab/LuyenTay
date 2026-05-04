import { Image } from "expo-image"
import React from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface ProfilePhotosProps {
  posts: any[]
}

export const ProfilePhotos = ({ posts }: ProfilePhotosProps) => {
  // Only take posts with images
  const photoPosts = posts.filter(p => p.image_url).slice(0, 6)

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {photoPosts.map((post, index) => (
          <View key={post.id || index} style={styles.photoWrapper}>
            <Image source={{ uri: post.image_url }} style={styles.photo} />
          </View>
        ))}
        {/* Fill empty spots if less than 6 */}
        {[...Array(Math.max(0, 6 - photoPosts.length))].map((_, i) => (
          <View key={`empty-${i}`} style={[styles.photoWrapper, styles.emptyPhoto]} />
        ))}
      </View>

      <TouchableOpacity style={styles.allPhotosButton}>
        <Text style={styles.allPhotosText}>Xem tất cả</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  photoWrapper: {
    width: "31.5%",
    aspectRatio: 1,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f0f2f5",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  emptyPhoto: {
    backgroundColor: "#f0f2f5",
  },
  allPhotosButton: {
    backgroundColor: "#e4e6eb",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  allPhotosText: {
    fontWeight: "600",
    color: "#000",
  },
})
