import LoginOtpStep from "@/components/auth/login/LoginOtpStep"
import { verifyForgotPasswordOtpOnly } from "@/services/forgotPassword"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useState } from "react"
import { StyleSheet, Text, View } from "react-native"

export default function ForgotPasswordOtpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>()
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
      await verifyForgotPasswordOtpOnly(email, otp)
      setSuccess("Xác thực OTP thành công! Vui lòng đặt mật khẩu mới.")
      setTimeout(() => {
        router.push({
          pathname: "/(auth)/NewPasswordScreen",
          params: { email },
        })
      }, 1000)
    } catch (err: any) {
      setError(err?.message || "Xác thực OTP thất bại")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nhập mã OTP</Text>
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
  error: { color: "red", marginBottom: 8, textAlign: "center" },
  success: { color: "green", marginBottom: 8, textAlign: "center" },
})
