import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const PRESET_COLORS = [
  "#FF3B30", "#FF9500", "#FFCC00", "#34C759", "#007AFF", "#5856D6", "#AF52DE", 
  "#FF2D55", "#A2845E", "#8E8E93", "#1A1A1A", "#0066FF"
];

interface ColorPickerProps {
  selection?: string;
  onSelectionChange?: (color: string) => void;
}

export default function ColorPickerComponent({ selection, onSelectionChange }: ColorPickerProps) {
  const [activeColor, setActiveColor] = useState(selection || "#0066FF");

  const handleSelect = (color: string) => {
    setActiveColor(color);
    if (onSelectionChange) {
      onSelectionChange(color);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Chọn màu sắc</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.colorList}
      >
        {PRESET_COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorCircle,
              { backgroundColor: color },
              activeColor === color && styles.activeCircle
            ]}
            onPress={() => handleSelect(color)}
          >
            {activeColor === color && (
              <Ionicons name="checkmark" size={20} color="#FFF" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#FFF",
    borderRadius: 20,
    width: "100%",
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  colorList: {
    paddingRight: 16,
  },
  colorCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "transparent",
  },
  activeCircle: {
    borderColor: "rgba(0,0,0,0.1)",
    transform: [{ scale: 1.1 }],
  },
});
