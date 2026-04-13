import React from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface TrustDeviceStepProps {
  onTrust: () => void
  onSkip: () => void
  isLoading: boolean
}

export default function TrustDeviceStep({
  onTrust,
  onSkip,
  isLoading,
}: TrustDeviceStepProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trust This Device?</Text>
      <Text style={styles.desc}>
        If you trust this device, you won't be asked for OTP on future logins
        from here.
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={onTrust}
        disabled={isLoading}>
        <Text style={styles.buttonText}>Trust Device</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.skipButton]}
        onPress={onSkip}
        disabled={isLoading}>
        <Text style={[styles.buttonText, styles.skipButtonText]}>Skip</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: "center", padding: 24 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  desc: { fontSize: 15, color: "#666", marginBottom: 32, textAlign: "center" },
  button: {
    backgroundColor: "#000",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
    width: 200,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  skipButton: { backgroundColor: "#eee" },
  skipButtonText: { color: "#000" },
})
