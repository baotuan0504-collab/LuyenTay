import { TextInput } from "react-native"

interface LastNameInputProps {
  value: string
  onChange: (v: string) => void
}

export default function LastNameInput({ value, onChange }: LastNameInputProps) {
  return (
    <TextInput
      placeholder="Last Name"
      placeholderTextColor="#999"
      value={value}
      onChangeText={onChange}
      style={{
        backgroundColor: "#f5f5f5",
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#e0e0e0",
      }}
    />
  )
}
