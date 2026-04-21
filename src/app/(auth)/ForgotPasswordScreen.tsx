import { sendForgotPasswordOtp } from "@/services/forgotPassword"
import { useRouter } from "expo-router"
import { useState } from "react"
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSendOtp = async () => {
    setError("")
    setSuccess("")
    setIsLoading(true)
    try {
      await sendForgotPasswordOtp(email)
      setSuccess("Đã gửi mã OTP về email. Vui lòng kiểm tra hộp thư!")
      setTimeout(() => {
        router.push({
          pathname: "/(auth)/ResetPasswordScreen",
          params: { email },
        })
      }, 1200)
    } catch (err: any) {
      setError(err?.message || "Gửi OTP thất bại")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quên mật khẩu</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập email của bạn"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}
      <TouchableOpacity
        style={styles.button}
        onPress={handleSendOtp}
        disabled={isLoading || !email}>
        <Text style={styles.buttonText}>
          {isLoading ? "Đang gửi..." : "Gửi mã OTP"}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  error: { color: "red", marginBottom: 8, textAlign: "center" },
  success: { color: "green", marginBottom: 8, textAlign: "center" },
})
