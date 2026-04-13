import { StyleProp, TextInput, TextStyle } from "react-native"

interface FirstNameInputProps {
  value: string
  onChange: (v: string) => void
  style?: StyleProp<TextStyle>
}

export default function FirstNameInput({
  value,
  onChange,
  style,
}: FirstNameInputProps) {
  return (
    <TextInput
      placeholder="First Name"
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