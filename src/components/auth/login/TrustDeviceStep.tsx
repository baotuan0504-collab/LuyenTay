import React, { useEffect, useState } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { getDeviceId } from "@/services/apiHeaders"

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
  const [deviceId, setDeviceId] = useState<string>("")

  useEffect(() => {
    getDeviceId().then(setDeviceId)
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trust This Device?</Text>
      <Text style={styles.desc}>
        If you trust this device, you won't be asked for OTP on future logins
        from here.
      </Text>

      {deviceId ? (
        <View style={styles.debugBox}>
          <Text style={styles.debugLabel}>Current Device ID (IDFV):</Text>
          <Text style={styles.debugId} selectable>{deviceId}</Text>
          <Text style={styles.debugNote}>
            Note: This is different from the simulator's UDID.
          </Text>
        </View>
      ) : null}

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
  debugBox: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    width: "100%",
  },
  debugLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  debugId: {
    fontSize: 11,
    fontFamily: "monospace",
    color: "#333",
    backgroundColor: "#fff",
    padding: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  debugNote: {
    fontSize: 10,
    color: "#999",
    marginTop: 4,
    fontStyle: "italic",
  },
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
