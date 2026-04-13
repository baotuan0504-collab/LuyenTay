import { TextInput } from "react-native"

interface BirthDateInputProps {
  value: string
  onChange: (v: string) => void
}

export default function BirthDateInput({
  value,
  onChange,
}: BirthDateInputProps) {
  return (
    <TextInput
      placeholder="Birth Date (YYYY-MM-DD)"
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
