import { apiFetch } from "@/services/api"
import { useState } from "react"
import { Text, TextInput, TouchableOpacity } from "react-native"
import { validateAccountInfo } from "./registerValidation"

export interface AccountInfo {
  email: string
  password: string
}

interface AccountInformationFormProps {
  values: AccountInfo
  onChange: (v: AccountInfo) => void
  onNext: () => void
  onBack: () => void
}

export default function AccountInformationForm({
  values,
  onChange,
  onNext,
  onBack,
}: AccountInformationFormProps) {
  const { email, password } = values
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleNext = async () => {
    const err = validateAccountInfo(values)
    if (err) {
      setError(err)
      return
    }
    setError(null)
    setIsLoading(true)
    try {
      // Gọi API tới authserver kiểm tra email và gửi OTP
      const res = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ step: 2, email }),
      })
      if (!res.success) {
        setError(res.message || "Unknown error")
        setIsLoading(false)
        return
      }
      onNext()
    } catch (e: any) {
      setError(e?.message || "Server error")
    } finally {
      setIsLoading(false)
    }
  }

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
      {error && <Text style={{ color: "red", marginBottom: 8 }}>{error}</Text>}
      <TouchableOpacity
        style={{
          backgroundColor: "#000",
          borderRadius: 12,
          padding: 16,
          alignItems: "center",
        }}
        onPress={handleNext}
        disabled={isLoading}>
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
          {isLoading ? "Checking..." : "Next"}
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
