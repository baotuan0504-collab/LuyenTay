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
            backgroundColor: value === g ? "#000" : "#f5f5f5",
            borderRadius: 12,
            padding: 12,
            marginRight: 8,
          }}
          onPress={() => onChange(g)}>
          <Text style={{ color: value === g ? "#fff" : "#000" }}>
            {g.charAt(0).toUpperCase() + g.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}
