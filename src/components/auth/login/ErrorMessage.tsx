import React from "react"
import { StyleSheet, Text } from "react-native"

interface ErrorMessageProps {
  message?: string
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null
  return <Text style={styles.errorText}>{message}</Text>
}

const styles = StyleSheet.create({
  errorText: {
    color: "red",
    marginBottom: 16,
    textAlign: "center",
  },
})
