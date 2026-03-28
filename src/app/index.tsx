import { Redirect } from "expo-router";

export default function Index() {
  const isAuth = false;

  if (!isAuth) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}