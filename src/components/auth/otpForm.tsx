import { useState } from "react"
import { ActivityIndicator, Text, TouchableOpacity } from "react-native"
import OtpInput from "./OtpInput"
import { validateOtp } from "./register/registerValidation"

interface OtpFormProps {
  otp: string
  setOtp: (v: string) => void
  isLoading: boolean
  onRegister: () => void
  onBack: () => void
}

export default function OtpForm({
  otp,
  setOtp,
  isLoading,
  onRegister,
  onBack,
}: OtpFormProps) {
  const [error, setError] = useState<string | null>(null)

  const handleRegister = () => {
    const err = validateOtp(otp)
    if (err) {
      setError(err)
      return
    }
    setError(null)
    onRegister()
  }

  return (
    <>
      <OtpInput
        value={otp}
        onChange={setOtp}
        length={6}
      />
      {error && <Text style={{ color: "red", marginBottom: 8 }}>{error}</Text>}
      <TouchableOpacity
        style={{
          backgroundColor: "#000",
          borderRadius: 12,
          padding: 16,
          alignItems: "center",
        }}
        onPress={handleRegister}>
        {isLoading ? (
          <ActivityIndicator
            size={24}
            color="#fff"
          />
        ) : (
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
            Verify OTP
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
