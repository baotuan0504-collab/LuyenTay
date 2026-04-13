import { Text, TouchableOpacity, View } from "react-native"

const GENDERS = ["male", "female", "other"]

interface GenderPickerProps {
  value: string
  onChange: (v: string) => void
}

export default function GenderPicker({ value, onChange }: GenderPickerProps) {
  return (
    <View style={{ flexDirection: "row", marginBottom: 16 }}>
      {GENDERS.map(g => (
        <TouchableOpacity
          key={g}
          style={{
            flex: 1, // 👈 chia đều 3 cột
            backgroundColor: value === g ? "#000" : "#f5f5f5",
            borderRadius: 12,
            padding: 14,
            marginHorizontal: 4, // 👈 khoảng cách đều
            borderWidth: 1, // 👈 border
            borderColor: "#e0e0e0",
            alignItems: "center", // 👈 căn giữa text
          }}
          onPress={() => onChange(g)}
        >
          <Text
            style={{
              color: value === g ? "#fff" : "#000",
              fontWeight: "500",
            }}
          >
            {g.charAt(0).toUpperCase() + g.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}