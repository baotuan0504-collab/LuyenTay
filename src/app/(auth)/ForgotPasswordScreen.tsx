import { sendForgotPasswordOtp } from "@/services/forgotPassword"
import { MaterialCommunityIcons } from "@expo/vector-icons"
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
          pathname: "/(auth)/ForgotPasswordOtpScreen",
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
      <TouchableOpacity
        style={styles.backIcon}
        onPress={() => router.back()}>
        <MaterialCommunityIcons
          name="arrow-left"
          size={32}
          color="#111"
        />
      </TouchableOpacity>
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
    backgroundColor: "#111", // màu đen
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  backIcon: {
    position: "absolute",
    top: 32,
    left: 16,
    zIndex: 10,
    padding: 4,
    backgroundColor: "#fff",
    borderRadius: 24,
    elevation: 2,
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
  },
  error: { color: "red", marginBottom: 8, textAlign: "center" },
  success: { color: "green", marginBottom: 8, textAlign: "center" },
})
