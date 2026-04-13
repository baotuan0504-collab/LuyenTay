import OtpForm from "@/components/auth/otpForm"
import AccountInformationForm from "@/components/auth/register/accountInformationForm"
import UserInformationForm from "@/components/auth/register/userInfomationForm"
import { useRouter } from "expo-router"
import { useState } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function SignUpScreen() {
  const [step, setStep] = useState(1)
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    gender: "",
  })
  const [accountInfo, setAccountInfo] = useState({
    email: "",
    password: "",
  })
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Step 3: Submit all data
  const handleRegister = async () => {
    setIsLoading(true)
    try {
      const res = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          step: 3,
          ...userInfo,
          ...accountInfo,
          otp,
        }),
      })
      // Success: go to login or onboarding
      alert("Registration complete!")
      router.push("/(auth)/login")
    } catch (error) {
      alert("Failed to register. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign Up to Get Started</Text>
        <View style={styles.form}>
          {step === 1 && (
            <UserInformationForm
              values={userInfo}
              onChange={setUserInfo}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <AccountInformationForm
              values={accountInfo}
              onChange={setAccountInfo}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <OtpForm
              otp={otp}
              setOtp={setOtp}
              isLoading={isLoading}
              onRegister={handleRegister}
              onBack={() => setStep(2)}
            />
          )}
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.linkButtonText}>
              Already have an account?{" "}
              <Text style={styles.linkButtonTextBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
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
    fontWeight: "600",
  },
  linkButton: {
    marginTop: 24,
    alignItems: "center",
  },
  linkButtonText: {
    color: "#666",
    fontSize: 14,
  },
  linkButtonTextBold: {
    fontWeight: "600",
    color: "#000",
  },
})
