

import { compressImage, compressVideo } from "@/lib/media";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { VideoView, useVideoPlayer } from "expo-video";
import * as VideoThumbnails from "expo-video-thumbnails";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";


import { useAuth } from "@/context/AuthContext";
import { Post, usePosts } from "@/hooks/usePosts";
import { formatTimeAgo, formatTimeRemaining } from "@/lib/date-helper";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";


interface PostCardProps {
  post: Post;
  currentUserId?: string;
}


const PostCard = ({ post, currentUserId }: PostCardProps) => {
  const postUser = post.profiles;
  const isOwnPost = post.user_id === currentUserId;
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const player = useVideoPlayer(post.video_url ?? null, (player) => {
    player.loop = true;
    player.muted = false;
    player.volume = 1;
  });

  useEffect(() => {
    if (!post.video_url) return;
    if (isPlaying) {
      player.play();
    } else {
      player.pause();
    }
  }, [isPlaying, player, post.video_url]);


  return (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
           <TouchableOpacity
            style={styles.userInfo}
            onPress={() => router.push(`/profile/${post.user_id}`)}
          >
            {postUser?.profile_image_url ? (
              <Image
                cachePolicy={"none"}
                source={{ uri: postUser.profile_image_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {postUser?.name?.[0]?.toUpperCase() || "U"}
                </Text>
              </View>
            )}

            <View>
              <Text style={styles.username}>
                {isOwnPost ? "You" : `@${postUser?.username}`}
              </Text>
              <Text style={styles.timeAgo}>{formatTimeAgo(post.created_at)}</Text>
            </View>
          </TouchableOpacity>

        {/* Post content */}
        <View style={styles.timeRemainingBadge}>
          <Text style={styles.timeRemainingText}>
            {formatTimeRemaining(post.expires_at)}
          </Text>
        </View>
      </View>


      {post.description ? (
        <View style={styles.postDescriptionContainer}>
          <Text style={styles.postDescription}>{post.description}</Text>
        </View>
      ) : null}


      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => post.video_url && setIsPlaying(!isPlaying)}
        style={styles.mediaContainer}
      >
        {post.video_url && isPlaying ? (
          <View style={styles.videoWrapper}>
            <VideoView
              player={player}
              nativeControls
              contentFit="cover"
              useExoShutter
              onFirstFrameRender={() => setVideoReady(true)}
              style={[styles.postImage, { backgroundColor: "#000" }]}
            />
            {!videoReady && (
              <View style={styles.videoCover}>
                <Image
                  cachePolicy={"none"}
                  source={{ uri: post.image_url }}
                  style={[styles.postImage, styles.coverImage]}
                  contentFit="cover"
                />
                <ActivityIndicator size="large" color="#fff" />
              </View>
            )}
          </View>
        ) : (
          <View>
            <Image
              cachePolicy={"none"}
              source={{ uri: post.image_url }}
              style={styles.postImage}
              contentFit="cover"
            />
            {post.video_url && (
              <View style={styles.playButtonOverlay}>
                <Ionicons name="play" size={50} color="#fff" />
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};


export default function Index() {
  const [showPreview, setShowPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [description, setDescription] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const previewPlayer = useVideoPlayer(previewVideo ?? null, (player) => {
    player.loop = true;
    player.muted = false;
    player.volume = 1;
  });


  const router = useRouter();
  const { createPost, posts, refreshPosts } = usePosts();
  const { user } = useAuth();




  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshPosts();
    } catch (error) {
      console.error("Error refreshing posts:", error);
    } finally {
      setRefreshing(false);
    }
  };


  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "We need camera roll permissions to select a profile image.",
      );
      return;
    }


    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
       const uri = result.assets[0].uri;
        setIsUploading(true);
        try {
          const compressed = await compressImage(uri);
          setPreviewImage(compressed.uri);
          setPreviewVideo(null);
          setShowPreview(true);
          setDescription("");
        } catch (error) {
          console.warn("Image compression failed, using original image:", error);
          setPreviewImage(uri);
          setPreviewVideo(null);
          setShowPreview(true);
          setDescription("");
        } finally {
          setIsUploading(false);
        }
    }
  };


  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "We need camera roll permissions to select a video.",
      );
      return;
    }


    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const videoUri = result.assets[0].uri;
      setIsUploading(true);
      try {
         const compressedVideoUri = await compressVideo(videoUri);
         setPreviewVideo(compressedVideoUri);
         setPreviewImage(null);
         try {
           const { uri } = await VideoThumbnails.getThumbnailAsync(compressedVideoUri, {
             time: 0,
           });
           setPreviewImage(uri);
         } catch (e) {
           console.warn("Video thumbnail generation failed:", e);
         }
         setShowPreview(true);
         setDescription("");
      } catch (e) {
        console.warn("Video thumbnail generation failed:", e);
        setPreviewVideo(videoUri);
         try {
           const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
             time: 0,
           });
           setPreviewImage(uri);
         } catch (error) {
           console.error("Error generating video thumbnail:", error);
         }
         setShowPreview(true);
         setDescription("");
      } finally {
        setIsUploading(false);
      }
    }
  };


  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "We need camera permissions to take a photo.",
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setIsUploading(true);
        try {
          const compressed = await compressImage(uri);
          setPreviewImage(compressed.uri);
          setPreviewVideo(null);
          setShowPreview(true);
          setDescription("");
        } catch (error) {
          console.error("Image compression failed:", error);
          setPreviewImage(uri);
          setPreviewVideo(null);
          setShowPreview(true);
          setDescription("");
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error) {
      console.error("Camera launch failed:", error);
      Alert.alert(
        "Camera unavailable",
        "Camera is not available on this device or simulator.",
      );
    }
  };


  const recordVideo = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "We need camera permissions to record a video.",
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["videos"],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        const videoUri = result.assets[0].uri;
        setIsUploading(true);
        try {
          const compressedUri = await compressVideo(videoUri);
          setPreviewVideo(compressedUri);
          setPreviewImage(null);
          try {
            const { uri } = await VideoThumbnails.getThumbnailAsync(compressedUri, {
              time: 0,
            });
            setPreviewImage(uri);
          } catch (e) {
            console.warn("Video thumbnail generation failed:", e);
          }
          setShowPreview(true);
          setDescription("");
        } catch (e) {
          console.error("Video compression failed:", e)
          setPreviewVideo(videoUri);
          try {
            const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
              time: 0,
            });
            setPreviewImage(uri);
          } catch (error) {
            console.error("Error generating video thumbnail:", error);
          }
          setShowPreview(true);
          setDescription("");
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error) {
      console.error("Camera launch failed:", error);
      Alert.alert(
        "Camera unavailable",
        "Camera is not available on this device or simulator.",
      );
    }
  };


  const showImagePicker = () => {
    Alert.alert("Create Post", "Choose an option", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Record Video", onPress: recordVideo },
      { text: "Photo Library (Image)", onPress: pickImage },
      { text: "Photo Library (Video)", onPress: pickVideo },
      { text: "Cancel", style: "cancel" },
    ]);
  };


  const handlePost = async () => {
    if (!previewImage) return;


    setIsUploading(true);
    try {
      await createPost(previewImage, description, previewVideo || undefined);
      setPreviewImage(null);
      setPreviewVideo(null);
      setDescription("");
      setShowPreview(false);
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", "Failed to create post. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };


  const renderPost = ({ item }: { item: Post }) => (
    <PostCard post={item} currentUserId={user?.id} />
  );


  return (
    <View style={styles.container}>
      {/* LIST */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
        contentContainerStyle={
          posts.length === 0 ? styles.emptyContent : styles.content
        }
        ListEmptyComponent={<Text>No posts found</Text>}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />


      <TouchableOpacity style={styles.fab} onPress={showImagePicker}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>


      <Modal visible={showPreview} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Preview Your Post</Text>
            {(previewImage || previewVideo) && (
              <View style={styles.previewMediaContainer}>
                {previewImage ? (
                  <Image
                    cachePolicy={"none"}
                    source={{ uri: previewImage }}
                    style={styles.previewImage}
                    contentFit="cover"
                  />
                ) : (
                  <VideoView
                    player={previewPlayer}
                    nativeControls
                    contentFit="cover"
                    style={styles.previewImage}
                  />
                )}
                {previewVideo && (
                  <View style={styles.previewVideoOverlay}>
                    <Ionicons name="videocam" size={40} color="#fff" />
                  </View>
                )}
              </View>
            )}
            <TextInput
              style={styles.descriptionInput}
              placeholder="Add a description (optional)"
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowPreview(false);
                  setPreviewImage(null);
                  setDescription("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.postButton]}
                onPress={handlePost}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator size={24} color="#fff" />
                ) : (
                  <Text style={styles.postButtonText}>Post</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor : "#fff",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "300",
    lineHeight: 32,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  previewImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 16,
  },
  descriptionInput: {
    width: "100%",
    minHeight: 80,
    maxHeight: 120,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    color: "#000",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  cancelButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  postButton: {
    backgroundColor: "#000",
  },
  postButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },


  content: {
    padding: 0,
    paddingBottom: 80,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },


  postContainer: {
    backgroundColor: "#fff",
    marginBottom:24,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  timeAgo: {
    fontSize: 12,
    color: "#666",
  },
  timeRemainingBadge: {
    backgroundColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timeRemainingText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  postImage: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#f5f5f5",
  },
  postDescriptionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  postFooter: {
     paddingHorizontal: 16,
     paddingVertical: 12,    
  },
  postDescription: {
    fontSize: 15,
    color: "#000",
    lineHeight: 20,
  },
  postInfo: {
    fontSize: 14,
    color: "#666",
  },
  mediaContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 1,
  },
  videoWrapper: {
    position: "relative",
  },
  videoCover: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  coverImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  playButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  previewMediaContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 1,
    marginBottom: 16,
  },
  previewVideoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 12,
  },
});
