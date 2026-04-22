import { forgotPasswordService } from "@/services/auth.service"
import { validatePassword } from "@/utils/validatePassword"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useState } from "react"
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function NewPasswordScreen() {
  const { email } = useLocalSearchParams<{ email: string }>()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleResetPassword = async () => {
    setError("")
    setSuccess("")
    
    if (!newPassword || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin")
      return
    }

    if (!validatePassword(newPassword)) {
      setError(
        "Mật khẩu phải từ 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt.",
      )
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.")
      return
    }
    
    setIsLoading(true)
    try {
      await forgotPasswordService.resetPassword(email, newPassword)
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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Đặt mật khẩu mới</Text>
        <Text style={styles.subtitle}>Thiết lập mật khẩu bảo mật mới cho tài khoản của bạn</Text>
        
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu mới"
            placeholderTextColor="#999"
            value={newPassword}
            onChangeText={v => {
              setNewPassword(v)
              setError("")
            }}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Nhập lại mật khẩu"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={v => {
              setConfirmPassword(v)
              setError("")
            }}
            secureTextEntry
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {success ? <Text style={styles.successText}>{success}</Text> : null}

          <TouchableOpacity
            style={styles.button}
            onPress={handleResetPassword}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Đổi mật khẩu</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.back()}>
            <Text style={styles.linkButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
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
  form: {
    width: "100%",
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    color: "#000",
  },
  button: {
    backgroundColor: "#000",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkButton: {
    marginTop: 24,
    alignItems: "center",
  },
  linkButtonText: {
    color: "#666",
    fontSize: 14,
  },
  errorText: {
    color: "#FF3B30",
    marginBottom: 16,
    textAlign: "center",
    fontSize: 14,
  },
  successText: {
    color: "#34C759",
    marginBottom: 16,
    textAlign: "center",
    fontSize: 14,
  },
})
