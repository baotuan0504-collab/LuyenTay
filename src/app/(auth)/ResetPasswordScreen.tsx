import { verifyForgotPasswordOtp } from "@/services/forgotPassword"
import { validatePassword } from "@/utils/validatePassword"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useState } from "react"
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email: string }>()
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleResetPassword = async () => {
    setError("")
    setSuccess("")
    if (!validatePassword(newPassword)) {
      setError(
        "Mật khẩu phải từ 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt.",
      )
      return
    }
    setIsLoading(true)
    try {
      await verifyForgotPasswordOtp(email, otp, newPassword)
      setSuccess("Đổi mật khẩu thành công! Đang chuyển về đăng nhập...")
      setTimeout(() => {
        router.replace("/(auth)/login")
      }, 1200)
    } catch (err: any) {
      setError(err?.message || "Đổi mật khẩu thất bại")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đổi mật khẩu mới</Text>
      <TextInput
        style={styles.input}
        placeholder="Mã OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={6}
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu mới"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}
      <TouchableOpacity
        style={styles.button}
        onPress={handleResetPassword}
        disabled={isLoading || !otp || !newPassword}>
        <Text style={styles.buttonText}>
          {isLoading ? "Đang đổi..." : "Đổi mật khẩu"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.back()}
        disabled={isLoading}>
        <Text style={styles.secondaryButtonText}>Quay lại</Text>
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
    backgroundColor: "#111",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  secondaryButton: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#111",
  },
  secondaryButtonText: { color: "#111", fontWeight: "bold" },
  error: { color: "red", marginBottom: 8, textAlign: "center" },
  success: { color: "green", marginBottom: 8, textAlign: "center" },
})
