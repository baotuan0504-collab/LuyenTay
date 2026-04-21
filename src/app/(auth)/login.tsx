import LoginForm from "@/components/auth/login/LoginForm"
import LoginOtpStep from "@/components/auth/login/LoginOtpStep"
import SignupLink from "@/components/auth/login/SignupLink"
import TrustDeviceStep from "@/components/auth/login/TrustDeviceStep"
import { useAuth } from "@/context/AuthContext"
import { requireNetworkOrThrow } from "@/services/checkNetwork"
import { trustDevice } from "@/services/trustDevice"
import { useRouter } from "expo-router"
import { useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function LoginScreen() {
  const router = useRouter()
  const { signIn, verifyLoginOtp } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<"login" | "otp" | "trust">("login")
  const [otp, setOtp] = useState("")

  const handleLogin = async () => {
    setError("")
    setIsLoading(true)
    try {
      await requireNetworkOrThrow()
      // signIn should return { requireOtp: boolean }
      const result = await signIn(email, password)
      if (result && result.requireOtp) {
        setStep("otp")
      } else {
        router.push("/(tabs)")
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Login failed. Please check your credentials."
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    setError("")
    setIsLoading(true)
    try {
      await requireNetworkOrThrow()
      // Sau khi xác thực OTP thành công, chuyển sang màn trust device
      await verifyLoginOtp(email, otp, false)
      setStep("trust")
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "OTP verification failed."
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTrustDevice = async () => {
    setError("")
    setIsLoading(true)
    try {
      // Gọi API trustDevice chỉ với email (deviceId sẽ tự động gửi qua header)
      console.log("[TrustDevice] Gửi API:", { email })
      const res = await trustDevice(email)
      console.log("[TrustDevice] API response:", res)
      router.push("/(tabs)")
    } catch (err) {
      console.log("[TrustDevice] API error (full):", err)
      let message = "Trust device failed."
      if (err && typeof err === "object") {
        if (err instanceof Error && (err as any).status && err.message) {
          message = `[${(err as any).status}] ${err.message}`
        } else if ((err as any).message) {
          message = (err as any).message
        } else {
          message = JSON.stringify(err)
        }
      } else if (typeof err === "string") {
        message = err
      }
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkipTrustDevice = () => {
    router.push("/(tabs)")
  }

  const handleBackToLogin = () => {
    setStep("login")
    setOtp("")
    setError("")
  }

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign In to Continue</Text>
        {step === "login" && (
          <>
            <LoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              error={error}
              isLoading={isLoading}
              onLogin={handleLogin}
            />
            <SignupLink onPress={() => router.push("/(auth)/signup")} />
            <Text
              style={{
                color: "#007AFF",
                marginTop: 16,
                textAlign: "center",
                textDecorationLine: "underline",
              }}
              onPress={() => router.push("/(auth)/ForgotPasswordScreen")}>
              Forgot Password?
            </Text>
          </>
        )}
        {step === "otp" && (
          <LoginOtpStep
            otp={otp}
            setOtp={setOtp}
            isLoading={isLoading}
            onVerify={handleVerifyOtp}
            onBack={handleBackToLogin}
          />
        )}
        {step === "trust" && (
          <TrustDeviceStep
            onTrust={handleTrustDevice}
            onSkip={handleSkipTrustDevice}
            isLoading={isLoading}
          />
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: "center", padding: 24 },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
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
  },
  button: {
    backgroundColor: "#000",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkButton: {
    alignItems: "center",
    marginTop: 16,
  },
  linkButtonText: {
    color: "#666",
    fontSize: 14,
  },
  linkButtonTextBold: {
    fontWeight: "bold",
    color: "#000",
  },
  errorText: {
    color: "red",
    marginBottom: 16,
    textAlign: "center",
  },
})
