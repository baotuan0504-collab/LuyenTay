import { AuthProvider } from "@/context/AuthContext"
import { ChatProvider } from "@/context/ChatContext"
import { Stack } from "expo-router"
import "react-native-get-random-values"




export default function RootLayout() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </ChatProvider>
    </AuthProvider>
  )
}
