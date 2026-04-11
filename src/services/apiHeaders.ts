import AsyncStorage from "@react-native-async-storage/async-storage"
import { v4 as uuidv4 } from "uuid"

export async function getDefaultApiHeaders(token?: string) {
  let deviceId = await AsyncStorage.getItem("deviceId")
  if (!deviceId) {
    deviceId = uuidv4()
    await AsyncStorage.setItem("deviceId", deviceId)
  }
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Client-Type": "mobile",
    "X-Device-Id": deviceId,
    "Accept-Language": "vi",
    "Idempotency-Key": uuidv4(),
    ...(token ? { Authorization: token } : {}),
  } as Record<string, string>
}
