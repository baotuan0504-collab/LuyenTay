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

export default function NewPasswordScreen() {
  const { email } = useLocalSearchParams<{ email: string }>()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleNext = () => {
    setError("")
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
    // Chuyển sang màn xác thực OTP, truyền email và newPassword
    router.push({
      pathname: "/(auth)/ResetPasswordScreen",
      params: { email, newPassword },
    })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nhập mật khẩu mới</Text>
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu mới"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Nhập lại mật khẩu"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity
        style={styles.button}
        onPress={handleNext}
        disabled={!newPassword || !confirmPassword}>
        <Text style={styles.buttonText}>Tiếp tục</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.back()}
        disabled={false}>
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
})
