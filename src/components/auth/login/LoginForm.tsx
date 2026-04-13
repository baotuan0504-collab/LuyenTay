import React from "react"
import { StyleSheet, TextInput, View } from "react-native"

import ErrorMessage from "./ErrorMessage"
import LoginButton from "./LoginButton"

interface LoginFormProps {
  email: string
  setEmail: (v: string) => void
  password: string
  setPassword: (v: string) => void
  error?: string
  isLoading: boolean
  onLogin: () => void
}

export default function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  error,
  isLoading,
  onLogin,
}: LoginFormProps) {
  return (
    <View style={styles.form}>
      <TextInput
        placeholder="Email..."
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoComplete="email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password..."
        placeholderTextColor="#999"
        secureTextEntry
        autoComplete="password"
        autoCapitalize="none"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <ErrorMessage message={error} />
      <LoginButton
        onPress={onLogin}
        isLoading={isLoading}
      />
    </View>
  )
}

const styles = StyleSheet.create({
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
})
