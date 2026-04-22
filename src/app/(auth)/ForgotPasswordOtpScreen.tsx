import LoginOtpStep from "@/components/auth/login/LoginOtpStep"
import { forgotPasswordService } from "@/services/auth.service"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function ForgotPasswordOtpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>()
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleVerifyOtp = async () => {
    setError("")
    setIsLoading(true)
    try {
      await forgotPasswordService.verifyOtpOnly(email, otp)
      // Success: Chuyển trang ngay lập tức không thông báo
      router.push({
        pathname: "/(auth)/NewPasswordScreen",
        params: { email },
      })
    } catch (err: any) {
      setError(err?.message || "Xác thực OTP thất bại")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Nhập mã OTP</Text>
        <Text style={styles.subtitle}>
          Mã xác thực đã được gửi đến {email}
        </Text>

        <LoginOtpStep
          otp={otp}
          setOtp={setOtp}
          isLoading={isLoading}
          onVerify={handleVerifyOtp}
          onBack={() => router.back()}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1, justifyContent: "center", padding: 24 },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    color: "#666",
  },
  errorText: {
    color: "#FF3B30",
    marginTop: 16,
    textAlign: "center",
    fontSize: 14,
  },
})
