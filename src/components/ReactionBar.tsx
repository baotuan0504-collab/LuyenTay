import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const REACTIONS = [
  { type: "like", icon: "heart", color: "#1877F2" },
  { type: "love", icon: "heart", color: "#F33E58" },
  { type: "haha", icon: "happy", color: "#F7B125" },
  { type: "wow", icon: "star", color: "#F7B125" },
  { type: "sad", icon: "sad", color: "#F7B125" },
  { type: "angry", icon: "flame", color: "#E9710F" },
];

export interface ReactionBarProps {
  selected?: string;
  onSelect: (type: string) => void;
  counts?: Record<string, number>;
}

export const ReactionBar: React.FC<ReactionBarProps> = ({
  selected,
  onSelect,
  counts,
}) => {
  const [pickerVisible, setPickerVisible] = useState(false);
  const selectedReaction =
    REACTIONS.find(reaction => reaction.type === selected) ?? REACTIONS[0];
  const selectedCount = selected ? counts?.[selected] ?? 0 : 0;
  const totalCount = Object.values(counts ?? {}).reduce(
    (sum, value) => sum + value,
    0,
  );

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.mainButton}
        onPress={() => onSelect(selectedReaction.type)}
        onLongPress={() => setPickerVisible(true)}
      >
        <Ionicons
          name={selectedReaction.icon as any}
          size={28}
          color={selected ? selectedReaction.color : "#444"}
        />
        <Text
          style={[
            styles.mainLabel,
            selected && { color: selectedReaction.color },
          ]}
        >
          {selected ? selectedReaction.type : "React"}
        </Text>
        <Text style={styles.mainCount}>
          {selected ? selectedCount : totalCount || 0}
        </Text>
      </TouchableOpacity>

      {pickerVisible && (
        <View style={styles.picker}>
          {REACTIONS.map(reaction => (
            <TouchableOpacity
              key={reaction.type}
              style={styles.pickerButton}
              onPress={() => {
                setPickerVisible(false);
                onSelect(reaction.type);
              }}
            >
              <Ionicons
                name={reaction.icon as any}
                size={26}
                color={reaction.color}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    marginVertical: 8,
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
});
