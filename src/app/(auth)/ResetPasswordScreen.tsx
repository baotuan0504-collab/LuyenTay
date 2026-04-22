import LoginOtpStep from "@/components/auth/login/LoginOtpStep"
import { forgotPasswordService } from "@/services/auth.service"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useState } from "react"
import { StyleSheet, Text, View } from "react-native"

export default function ResetPasswordScreen() {
  const { email, newPassword } = useLocalSearchParams<{
    email: string
    newPassword: string
  }>()
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleVerifyOtp = async () => {
    setError("")
    setSuccess("")
    setIsLoading(true)
    try {
      await forgotPasswordService.resetPassword(email, newPassword)
      setSuccess("Đổi mật khẩu thành công...")
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
      <Text style={styles.title}>Xác thực OTP</Text>
      <LoginOtpStep
        otp={otp}
        setOtp={setOtp}
        isLoading={isLoading}
        onVerify={handleVerifyOtp}
        onBack={() => router.back()}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}
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
