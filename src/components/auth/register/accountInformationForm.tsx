import { Text, TextInput, TouchableOpacity } from "react-native"

export default function AccountInformationForm({
  values,
  onChange,
  onNext,
  onBack,
}) {
  const { email, password } = values
  return (
    <>
      <TextInput
        placeholder="Email"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoComplete="email"
        autoCapitalize="none"
        value={email}
        onChangeText={v => onChange({ ...values, email: v })}
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
      <TextInput
        placeholder="Password"
        placeholderTextColor="#999"
        autoComplete="password"
        secureTextEntry
        autoCapitalize="none"
        value={password}
        onChangeText={v => onChange({ ...values, password: v })}
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
      <TouchableOpacity
        style={{
          backgroundColor: "#000",
          borderRadius: 12,
          padding: 16,
          alignItems: "center",
        }}
        onPress={onNext}>
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
          Next
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ marginTop: 24, alignItems: "center" }}
        onPress={onBack}>
        <Text style={{ color: "#666", fontSize: 14 }}>Back</Text>
      </TouchableOpacity>
    </>
  )
}
