import React from "react"
import { StyleSheet, View } from "react-native"
import OtpForm from "../otpForm"

interface LoginOtpStepProps {
  otp: string
  setOtp: (v: string) => void
  isLoading: boolean
  onVerify: () => void
  onBack: () => void
}

export default function LoginOtpStep({
  otp,
  setOtp,
  isLoading,
  onVerify,
  onBack,
}: LoginOtpStepProps) {
  return (
    <View style={styles.otpStep}>
      <OtpForm
        otp={otp}
        setOtp={setOtp}
        isLoading={isLoading}
        onRegister={onVerify}
        onBack={onBack}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  otpStep: {
    width: "100%",
  },
})
