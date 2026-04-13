import React from "react"
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native"

interface LoginButtonProps {
  onPress: () => void
  isLoading: boolean
  label?: string
}

export default function LoginButton({
  onPress,
  isLoading,
  label = "Login",
}: LoginButtonProps) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      disabled={isLoading}>
      {isLoading ? (
        <ActivityIndicator
          size={24}
          color="#fff"
        />
      ) : (
        <Text style={styles.buttonText}>{label}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
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
})
