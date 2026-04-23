import { AuthProvider, useAuth } from "@/context/AuthContext"
import { ChatProvider } from "@/context/ChatContext"
import { Stack } from "expo-router"
import { ActivityIndicator, View } from "react-native"
import "react-native-get-random-values"

function RootStack() {
  const { user, isRestoring } = useAuth()

  if (isRestoring) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!user ? <Stack.Screen name="(auth)" /> : <Stack.Screen name="(tabs)" />}
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ChatProvider>
        <RootStack />
      </ChatProvider>
    </AuthProvider>
  )
}
