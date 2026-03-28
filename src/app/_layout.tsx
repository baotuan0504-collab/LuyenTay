import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";


export default function RootLayout() {
  const router = useRouter();
  let isAuth = false;
  useEffect(() => {
      if (!isAuth) {
        router.push("/(auth)/login");
      }else{
        router.push("/(tabs)");
      }
  }, []);
  return (
    <Stack screenOptions={{
      headerShown: false,
    
    }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
    </Stack>
  );
}
