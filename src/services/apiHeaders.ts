import AsyncStorage from "@react-native-async-storage/async-storage"
import * as CryptoJS from "crypto-js"
import { v4 as uuidv4 } from "uuid"

/**
 * Lấy deviceId ổn định cho thiết bị.
 * - Lần đầu: tạo UUID mới → lưu vào AsyncStorage
 * - Các lần sau: đọc từ AsyncStorage
 *
 * NOTE: expo-application (getAndroidId / getIosIdForVendorAsync) là native module,
 * không hoạt động trên Expo Go. Dùng UUID persistent là phương án đúng và an toàn.
 */
async function getDeviceId(): Promise<string> {
  const STORAGE_KEY = "@app_device_id"
  try {
    let deviceId = await AsyncStorage.getItem(STORAGE_KEY)
    if (!deviceId) {
      deviceId = uuidv4()
      await AsyncStorage.setItem(STORAGE_KEY, deviceId)
      console.log("[getDeviceId] Generated new deviceId:", deviceId)
    }
    return deviceId
  } catch (e) {
    console.warn("[getDeviceId] AsyncStorage error:", e)
    // Fallback: trả về UUID ngắn hạn (không persistent) để không block app
    return uuidv4()
  }
}

/**
 * Tạo HMAC-SHA256 signature đồng bộ với backend.
 * Công thức: HMAC(method|path|timestamp|body, secret) → Base64
 */
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
  body: string
  secret: string
}): string {
  const rawData = [method, path, timestamp, body].join("|")
  console.log(`[buildSignature] rawData: "${rawData}"`)
  return CryptoJS.HmacSHA256(rawData, secret).toString(CryptoJS.enc.Base64)
}

/**
 * Xây dựng đầy đủ headers bảo mật cho mọi API request.
 *
 * - X-Device-Id    : UUID ổn định của thiết bị (persistent)
 * - Idempotency-Key: UUID mới mỗi request (chống duplicate)
 * - X-Timestamp    : Thời gian hiện tại (seconds)
 * - X-Signature    : HMAC-SHA256(method|path|timestamp|body, token)
 * - X-Client-Type  : "mobile"
 * - Authorization  : Bearer <token> hoặc "none"
 */
export async function getDefaultApiHeaders({
  method = "GET",
  path = "/",
  body = undefined,
  token = undefined,
}: {
  method?: string
  path?: string
  body?: string
  token?: string
}): Promise<Record<string, string>> {
  // 1. Lấy deviceId ổn định (UUID persistent trong AsyncStorage)
  const deviceId = await getDeviceId()

  // 2. Timestamp tính bằng giây
  const timestamp = Math.floor(Date.now() / 1000).toString()

  // 3. Idempotency-Key: UUID MỚI mỗi request (TÁCH BIỆT với deviceId)
  const idempotencyKey = uuidv4()

  // 4. Xác định secret để ký
  //    - Login/register (token rỗng hoặc "none") → dùng "default_secret"
  //    - Các request khác → dùng token (bỏ prefix "Bearer ")
  let secret: string
  if (!token || token === "none") {
    secret = "default_secret"
  } else {
    secret = String(token).replace(/^Bearer\s+/i, "").trim()
  }

  // 5. Chuẩn hóa body (luôn là string, không double-stringify)
  const bodyString = typeof body === "string" ? body : (body ? JSON.stringify(body) : "")

  // 6. Chuẩn hóa path: bỏ query string, đảm bảo có / đầu, không có / cuối
  const pathOnly = (path || "").split("?")[0]
  const normalizedPath = "/" + pathOnly.replace(/^\/+|\/+$/g, "")

  // 7. Tạo signature
  const signature = buildSignature({
    method: method.toUpperCase(),
    path: normalizedPath,
    timestamp,
    body: bodyString,
    secret,
  })

  // 8. Trả về headers hoàn chỉnh
  return {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-Client-Type": "mobile",
    "X-Device-Id": deviceId,      // deviceId ổn định
    "Accept-Language": "vi",
    "Idempotency-Key": idempotencyKey, // UUID mới mỗi request
    "X-Timestamp": timestamp,
    "X-Signature": signature,
    "Authorization": token ? String(token) : "none",
  }
}
