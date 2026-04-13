import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity
} from "react-native"

export default function OtpForm({
  otp,
  setOtp,
  isLoading,
  onRegister,
  onBack,
}) {
  return (
    <>
      <TextInput
        placeholder="Enter OTP"
        placeholderTextColor="#999"
        value={otp}
        onChangeText={setOtp}
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
        onPress={onRegister}>
        {isLoading ? (
          <ActivityIndicator
            size={24}
            color="#fff"
          />
        ) : (
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
            Register
          </Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={{ marginTop: 24, alignItems: "center" }}
        onPress={onBack}>
        <Text style={{ color: "#666", fontSize: 14 }}>Back</Text>
      </TouchableOpacity>
    </>
  )
}
