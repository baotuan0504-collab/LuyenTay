import { Post } from "@/hooks/usePosts";
import { formatTimeAgo } from "@/lib/date-helper";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { VideoView, useVideoPlayer } from "expo-video";
import React, { useEffect, useRef, useState } from "react";
import { ReactionBar } from "./ReactionBar";
import { getMyReaction, getReactionCounts, upsertReaction, removeReaction, getReactionUsers } from "@/services/reaction.service";
import {
  Animated,
  Dimensions,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");
const STORY_DURATION = 5000; // 5 seconds for images

interface StoryViewerProps {
  visible: boolean;
  stories: Post[];
  initialIndex: number;
  onClose: () => void;
}

export const StoryViewer = ({
  visible,
  stories,
  initialIndex = 0,
  onClose,
}: StoryViewerProps) => {
  const [index, setIndex] = useState(initialIndex);
  const progress = useRef(new Animated.Value(0)).current;
  const currentStory = stories[index];
  
  // Reaction states
  const [myReaction, setMyReaction] = useState<string | undefined>();
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});
  const [showReactors, setShowReactors] = useState(false);
  const [reactors, setReactors] = useState<any[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const progressValue = useRef(0);
  
  // Track progress value
  useEffect(() => {
    const listener = progress.addListener(({ value }) => {
      progressValue.current = value;
    });
    return () => progress.removeListener(listener);
  }, [progress]);
 
  // Initialize player with a stable null source to prevent recreation crashes
  const player = useVideoPlayer(null, (player) => {
    player.loop = false;
    player.muted = false;
    player.volume = 1;
  });

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex, visible]);

  useEffect(() => {
    // If not visible or no video, just pause existing player safely
    if (!visible || !currentStory?.video_url) {
      try {
        player.pause();
      } catch (e) {
        // Ignore native object missing
      }
      return;
    }

    try {
      // Use replace for the current story video
      player.replace(currentStory.video_url);
      player.play();
    } catch (error) {
      console.warn("Error playing story video:", error);
    }

    return () => {
      try {
        player.pause();
      } catch (e) {
        // Safe cleanup
      }
    };
  }, [index, visible, currentStory?.video_url, player]);

  // Reset progress when index or visibility changes
  useEffect(() => {
    if (visible && currentStory) {
      progressValue.current = 0;
      progress.setValue(0);
      setIsPaused(false);
    }
  }, [index, visible, currentStory]);

  useEffect(() => {
    if (!visible || !currentStory) return;

    if (isPaused) {
      progress.stopAnimation();
      // Pause video if applicable
      try {
        if (currentStory.video_url) player.pause();
      } catch (e) {}
      return;
    }

    // Resume video if applicable
    try {
      if (currentStory.video_url) player.play();
    } catch (e) {}

    // Calculate remaining duration
    const remainingTime = STORY_DURATION * (1 - progressValue.current);
    if (remainingTime <= 0) return;

    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: remainingTime,
      useNativeDriver: false,
    });

    animation.start(({ finished }) => {
      if (finished && !isPaused) {
        handleNext();
      }
    });

    return () => {
      animation.stop();
    };
  }, [index, visible, currentStory, isPaused]);

  useEffect(() => {
    if (!visible || !currentStory) return;

    // Fetch reactions for current story
    const fetchReactions = async () => {
      try {
        const myReact = await getMyReaction(currentStory.id, "story");
        setMyReaction(myReact?.reactionType);

        const counts = await getReactionCounts(currentStory.id, "story");
        const obj: any = {};
        if (Array.isArray(counts)) {
          counts.forEach((r: any) => {
            obj[r._id] = r.count;
          });
        }
        setReactionCounts(obj);
      } catch (e) {
        console.error("Error fetching story reactions:", e);
      }
    };
    fetchReactions();
  }, [index, visible, currentStory]);

  const handleReaction = async (type: string) => {
    if (!currentStory) return;
    try {
      if (myReaction === type) {
        // Remove reaction
        await removeReaction(currentStory.id, "story");
        setMyReaction(undefined);
        setReactionCounts(c => ({
          ...c,
          [type]: Math.max((c[type] || 1) - 1, 0),
        }));
      } else {
        // Upsert reaction
        await upsertReaction(currentStory.id, "story", type);
        setMyReaction(type);
        setReactionCounts(c => ({
          ...c,
          [type]: (c[type] || 0) + 1,
          ...(myReaction
            ? { [myReaction]: Math.max((c[myReaction] || 1) - 1, 0) }
            : {}),
        }));
      }
    } catch (error) {
      console.error("Story reaction request failed:", error);
    }
  };

  const handleNext = () => {
    if (index < stories.length - 1) {
      setIndex(index + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (index > 0) {
      setIndex(index - 1);
    } else {
      // Re-start current story if at 0
      progress.setValue(0);
      setIndex(0);
    }
  };

  const handlePress = (evt: any) => {
    const x = evt.nativeEvent.locationX;
    if (x < width / 3) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  if (!visible || !currentStory) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
       
        {/* Background Media */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={handlePress}
          style={styles.mediaContainer}
        >
          {currentStory.video_url ? (
            <VideoView
              player={player}
              nativeControls={false}
              contentFit="cover"
              style={styles.media}
            />
          ) : (
            <Image
              source={{ uri: currentStory.image_url }}
              style={styles.media}
              contentFit="contain"
            />
          )}
        </TouchableOpacity>
        {/* Top Overlay */}
        <View style={styles.topOverlay}>
          {/* Progress Bars */}
          <View style={styles.progressContainer}>
            {stories.map((_, i) => (
              <View key={i} style={styles.progressBarBackground}>
                <Animated.View
                  style={[
                    styles.progressBarForeground,
                    {
                      width: i < index ? "100%" : i === index ? progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", "100%"],
                      }) : "0%",
                    },
                  ]}
                />
              </View>
            ))}
          </View>

          {/* User Info */}
          <View style={styles.userInfoContainer}>
            <View style={styles.userInfo}>
              <Image
                source={{ uri: currentStory.profiles?.profile_image_url }}
                style={styles.userAvatar}
              />
              <View>
                <Text style={styles.userName}>{currentStory.profiles?.name}</Text>
                <Text style={styles.timeAgo}>{formatTimeAgo(currentStory.created_at)}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Description if any */}
        {currentStory.description ? (
          <View style={styles.bottomOverlay}>
            <Text style={styles.description}>{currentStory.description}</Text>
          </View>
        ) : null}

        {/* Reaction Bar */}
        <View style={styles.reactionOverlay}>
          <ReactionBar
            layout="vertical"
            selected={myReaction}
            onSelect={handleReaction}
            counts={reactionCounts}
            onShowReactors={() => {}}
            onCommentPress={undefined}
            onPickerVisibilityChange={(pickerVisible) => setIsPaused(pickerVisible)}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  mediaContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  media: {
    width: width,
    height: height,
  },
  topOverlay: {
    position: "absolute",
    top: 40, // Below notch/status bar area
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  progressContainer: {
    flexDirection: "row",
    height: 3,
    gap: 4,
    marginBottom: 12,
  },
  progressBarBackground: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarForeground: {
    height: "100%",
    backgroundColor: "#fff",
  },
  userInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#fff",
  },
  userName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  timeAgo: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
  },
  closeButton: {
    padding: 4,
  },
  bottomOverlay: {
    position: "absolute",
    bottom: 90, // Push up to make room for reaction bar
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  reactionOverlay: {
    position: "absolute",
    bottom: 20,
    right: 10,
  },
  description: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
});
