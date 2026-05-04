import { FontAwesome5, Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import React, { useState } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"


const REACTIONS = [
  {
    type: "like",
    icon: (color: string) => (
      <FontAwesome5
        name="thumbs-up"
        size={28}
        color={color}
      />
    ),
    color: "#1877F2",
  },
  {
    type: "love",
    icon: (color: string) => (
      <FontAwesome5
        name="heart"
        size={28}
        color={color}
      />
    ),
    color: "#F33E58",
  },
  {
    type: "haha",
    icon: (color: string) => (
      <FontAwesome5
        name="laugh-beam"
        size={28}
        color={color}
      />
    ),
    color: "#F7B125",
  },
  {
    type: "wow",
    icon: (color: string) => (
      <FontAwesome5
        name="surprise"
        size={28}
        color={color}
      />
    ),
    color: "#F7B125",
  },
  {
    type: "sad",
    icon: (color: string) => (
      <FontAwesome5
        name="sad-tear"
        size={28}
        color={color}
      />
    ),
    color: "#5A8DEE",
  },
  {
    type: "angry",
    icon: (color: string) => (
      <FontAwesome5
        name="angry"
        size={28}
        color={color}
      />
    ),
    color: "#E9710F",
  },
]


export interface ReactionBarProps {
  selected?: string
  onSelect: (type: string) => void
  counts?: Record<string, number>
  onShowReactors?: (reactionType?: string) => void
  reactionUsers?: Record<
    string,
    Array<{ _id: string; name: string; avatar?: string }>
  >
  onCommentPress?: () => void // thêm prop này để xử lý sự kiện bình luận
  commentLabel?: string // tuỳ chọn: label cho nút bình luận
  layout?: "horizontal" | "vertical" // layout cho Reels/Story
  onPickerVisibilityChange?: (visible: boolean) => void // Để StoryViewer pause
}


export const ReactionBar: React.FC<ReactionBarProps> = ({
  selected,
  onSelect,
  counts,
  onShowReactors,
  reactionUsers,
  onCommentPress,
  layout,
  onPickerVisibilityChange,
}) => {
  const [pickerVisible, setPickerVisible] = useState(false)
  
  const handleSetPickerVisible = (visible: boolean) => {
    setPickerVisible(visible);
    onPickerVisibilityChange && onPickerVisibilityChange(visible);
  }
  const selectedReaction =
    REACTIONS.find(reaction => reaction.type === selected) ?? REACTIONS[0]
  const totalCount = Object.values(counts ?? {}).reduce(
    (sum, value) => sum + value,
    0,
  )


  // Xem danh sách người thả reaction cho từng loại
  const handleShowReactors = (reactionType?: string) => {
    onShowReactors && onShowReactors(reactionType)
  }
  const router = useRouter()
  const isVertical = layout === "vertical"

  return (
    <View style={isVertical ? styles.verticalRow : styles.row}>
      <View style={isVertical ? styles.verticalLeft : styles.left}>
        <TouchableOpacity
          style={isVertical ? styles.verticalMainButton : styles.mainButton}
          onPress={() => onSelect(selectedReaction.type)}
          onLongPress={() => handleSetPickerVisible(true)}>
          {selectedReaction.icon(selected ? selectedReaction.color : isVertical ? "#fff" : "#444")}
          {!isVertical && (
            <Text
              style={[
                styles.mainLabel,
                selected && { color: selectedReaction.color },
              ]}>
              {selected ? selectedReaction.type : ""}
            </Text>
          )}
          <TouchableOpacity
            style={isVertical ? styles.verticalCountBtn : styles.mainCountBtn}
            onPress={() => handleShowReactors()}>
            <Text style={isVertical ? styles.verticalCount : styles.mainCount}>{totalCount || 0}</Text>
          </TouchableOpacity>
        </TouchableOpacity>
        {pickerVisible && (
          <View style={isVertical ? styles.verticalPicker : styles.picker}>
            {REACTIONS.map(reaction => (
              <TouchableOpacity
                key={reaction.type}
                style={styles.pickerButton}
                onPress={() => {
                  handleSetPickerVisible(false)
                  onSelect(reaction.type)
                }}
                onLongPress={() => handleShowReactors(reaction.type)}>
                {reaction.icon(reaction.color)}
                {reactionUsers && reactionUsers[reaction.type]?.length > 0 && (
                  <Text
                    style={{
                      fontSize: 10,
                      color: "#888",
                      textAlign: "center",
                    }}>
                    {reactionUsers[reaction.type].length}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      {onCommentPress && (
        <TouchableOpacity
          style={isVertical ? styles.verticalCommentBtn : styles.commentBtn}
          onPress={onCommentPress}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={isVertical ? 32 : 20}
            color={isVertical ? "#fff" : "#888"}
            style={!isVertical ? { marginRight: 4 } : {}}
          />
        </TouchableOpacity>
      )}
    </View>
  )
}


const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 8,
    width: "100%",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  mainButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  mainLabel: {
    marginLeft: 8,
    marginRight: 10,
    fontSize: 14,
    color: "#444",
    textTransform: "capitalize",
  },
  mainCount: {
    fontSize: 12,
    color: "#888",
  },
  mainCountBtn: {
    marginHorizontal: 6,
  },
  picker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 8,
    backgroundColor: "rgba(255,255,255,0.98)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  pickerButton: {
    marginHorizontal: 6,
  },
  commentBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  // Vertical styles for Story/Reels layout
  verticalRow: {
    alignItems: "flex-end", // align items to the right side
    justifyContent: "flex-end",
    paddingRight: 8,
    paddingBottom: 20,
  },
  verticalLeft: {
    alignItems: "center",
    position: "relative",
  },
  verticalMainButton: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
  },
  verticalCountBtn: {
    marginTop: 4,
    alignItems: "center",
  },
  verticalCount: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  verticalPicker: {
    position: "absolute",
    right: 60, // pop out to the left
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.98)",
    borderRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  verticalCommentBtn: {
    alignItems: "center",
    marginVertical: 12,
    marginRight: 0,
  },
})



