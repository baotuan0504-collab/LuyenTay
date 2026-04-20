import * as Application from "expo-application"
import AsyncStorage from "@react-native-async-storage/async-storage" // Ensure AsyncStorage is imported
import * as CryptoJS from "crypto-js"
import { Platform } from "react-native"
import { v4 as uuidv4 } from "uuid"

// Hàm tạo signature đồng bộ backend
function buildSignature({
  method,
  path,
  timestamp,
  body,
  secret,
}: {
  method: string
  path: string
  timestamp: string
  body?: string
  secret: string
}): string {
  const rawData = [method, path, timestamp, body ?? ""].join("|")
  console.log(`[DEBUG] Frontend RawData for ${path}: "${rawData}"`)
  return CryptoJS.HmacSHA256(rawData, secret).toString(CryptoJS.enc.Base64)
}

// Hàm lấy deviceId thực từ thiết bị
async function getDeviceId(): Promise<string> {
  const key = "deviceId"
  let deviceId = await AsyncStorage.getItem(key)

  if (!deviceId) {
    try {
      if (Platform.OS === "android") {
        deviceId = (await Application.getAndroidId()) || ""
      } else if (Platform.OS === "ios") {
        deviceId = (await Application.getIosIdForVendorAsync()) || ""
      }
    } catch (error) {
      console.error("[getDeviceId] Error getting native device ID:", error)
    }

    if (!deviceId) {
      deviceId = uuidv4()
    }

    await AsyncStorage.setItem(key, deviceId)
  }
  return deviceId || "unknown-device"
}

// Hàm trả về headers đầy đủ cho mọi API
export async function getDefaultApiHeaders({
  method = "GET",
  path = "/",
  body = undefined,
  token = undefined,
}: {
  method?: string
  path?: string
  body?: any
  token?: string
}): Promise<Record<string, string>> {
  const deviceId = await getDeviceId()
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const idempotencyKey = uuidv4()
  // Nếu token là 'none' (login/register), dùng secret mặc định giống backend
  let secret = ""
  if (!token || token === "none") {
    secret = "default_secret"
  } else {
    secret = String(token)
      .replace(/^Bearer\s+/i, "")
      .trim()
  }
  // Đảm bảo không bị double-stringify nếu body đã là chuỗi
  const bodyString = typeof body === "string" ? body : (body ? JSON.stringify(body) : "")
  // Loại bỏ query string và chuẩn hóa đường dẫn (luôn có / ở đầu, không có / ở cuối)
  const pathOnly = (path || "").split("?")[0]
  const normalizedPath = "/" + pathOnly.replace(/^\/+|\/+$/g, "")
  const signature = buildSignature({
    method: method || "GET",
    path: normalizedPath,
    timestamp,
    body: bodyString,
    secret,
  })
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Client-Type": "mobile",
    "X-Device-Id": deviceId,
    "Accept-Language": "vi",
    "Idempotency-Key": idempotencyKey,
    "X-Timestamp": timestamp,
    "X-Signature": signature,
  }
  // Luôn gửi Authorization, nếu không có token thì để rỗng
  headers["Authorization"] = token ? String(token) : "none"
  return headers
}
