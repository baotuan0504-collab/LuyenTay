import { StyleProp, TextInput, TextStyle } from "react-native"

interface LastNameInputProps {
  value: string
  onChange: (v: string) => void
  style?: StyleProp<TextStyle>
}

export default function LastNameInput({
  value,
  onChange,
  style,
}: LastNameInputProps) {
  return (
    <TextInput
      placeholder="Last Name"
      placeholderTextColor="#999"
      value={value}
      onChangeText={onChange}
      style={[
        {
          backgroundColor: "#f5f5f5",
          borderRadius: 12,
          padding: 16,
          fontSize: 16,
          borderWidth: 1,
          borderColor: "#e0e0e0",
        },
        style,
      ]}
    />
  )
}