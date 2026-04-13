import React from "react"
import { StyleSheet, Text, TouchableOpacity } from "react-native"

interface SignupLinkProps {
  onPress: () => void
}

export default function SignupLink({ onPress }: SignupLinkProps) {
  return (
    <TouchableOpacity
      style={styles.linkButton}
      onPress={onPress}>
      <Text style={styles.linkButtonText}>
        Don't have an account?{" "}
        <Text style={styles.linkButtonTextBold}>Sign Up</Text>
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
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
})
