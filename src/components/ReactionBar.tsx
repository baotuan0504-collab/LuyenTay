import { FontAwesome5, Ionicons } from "@expo/vector-icons"
import React, { useState } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useRouter } from "../../.expo/types/router"


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
}


export const ReactionBar: React.FC<ReactionBarProps> = ({
  selected,
  onSelect,
  counts,
  onShowReactors,
  reactionUsers,
}) => {
  const [pickerVisible, setPickerVisible] = useState(false)
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
  


  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => onSelect(selectedReaction.type)}
          onLongPress={() => setPickerVisible(true)}>
          {selectedReaction.icon(selected ? selectedReaction.color : "#444")}
          <Text
            style={[
              styles.mainLabel,
              selected && { color: selectedReaction.color },
            ]}>
            {selected ? selectedReaction.type : ""}
          </Text>
          <TouchableOpacity
            style={styles.mainCountBtn}
            onPress={() => handleShowReactors()}>
            <Text style={styles.mainCount}>{totalCount || 0}</Text>
          </TouchableOpacity>
        </TouchableOpacity>
        {pickerVisible && (
          <View style={styles.picker}>
            {REACTIONS.map(reaction => (
              <TouchableOpacity
                key={reaction.type}
                style={styles.pickerButton}
                onPress={() => {
                  setPickerVisible(false)
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
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginRight: 16,
        }}
        onPress={() => router.push(`/post/${post.id}` as any)}>
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={20}
          color="#888"
          style={{ marginRight: 4 }}
        />
        <Text style={{ color: "#888" }}>Bình luận</Text>
      </TouchableOpacity>
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
  commentButton: {
    marginLeft: "auto",
    padding: 8,
  },
})



