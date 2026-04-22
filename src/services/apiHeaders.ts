import AsyncStorage from "@react-native-async-storage/async-storage"
import * as CryptoJS from "crypto-js"
import { Platform } from "react-native"
import { v4 as uuidv4 } from "uuid"

const DEVICE_ID_KEY = "@app_device_id"

/**
 * Lấy hardware ID thực của thiết bị qua expo-application.
 * Dùng dynamic require (KHÔNG phải static import) để tránh crash trên Expo Go.
 *
 * - Android: getAndroidId() → chuỗi hex 16 ký tự, vd: "9774d56d682e549c"
 * - iOS:     getIosIdForVendorAsync() → UUID từ hardware, vd: "68753A44-4D6F-..."
 * - Expo Go / Web: trả về null, sẽ dùng UUID persistent thay thế
 */
async function getNativeHardwareId(): Promise<string | null> {
  if (Platform.OS !== "android" && Platform.OS !== "ios") return null
  try {
    // Dynamic require – chỉ chạy khi hàm được gọi, KHÔNG crash khi import file
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Application = require("expo-application")
    if (Platform.OS === "android") {
      if (typeof Application.getAndroidId === "function") {
        const id: string | null = await Application.getAndroidId()
        if (id && id.length > 0) return id
      }
    } else {
      if (typeof Application.getIosIdForVendorAsync === "function") {
        const id: string | null = await Application.getIosIdForVendorAsync()
        if (id && id.length > 0) return id
      }
    }
  } catch {
    // Native module không tồn tại (Expo Go) – tiếp tục với fallback
  }
  return null
}

/**
 * Lấy deviceId ổn định cho thiết bị.
 *
 * Ưu tiên:
 *   1. Đã lưu trong AsyncStorage → dùng luôn (không gọi lại hardware)
 *   2. Chưa có → thử lấy từ hardware (expo-application)
 *   3. Không lấy được hardware → tạo UUID mới, lưu vĩnh viễn vào AsyncStorage
 *
 * Kết quả:
 *   - Build native (expo run:android/ios): ID thật của máy
 *   - Expo Go / Web: UUID persistent (stable qua các lần mở app)
 */
async function getDeviceId(): Promise<string> {
  try {
    // Bước 1: Đọc từ cache
    const cached = await AsyncStorage.getItem(DEVICE_ID_KEY)
    if (cached) return cached

    // Bước 2: Thử lấy hardware ID
    const hardwareId = await getNativeHardwareId()
    const deviceId = hardwareId || uuidv4()

    // Bước 3: Lưu để dùng lại
    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId)
    console.log(`[Device] ID stored: ${deviceId} (source: ${hardwareId ? "hardware" : "uuid-fallback"})`)
    return deviceId
  } catch (e) {
    console.warn("[Device] AsyncStorage error, using ephemeral ID:", e)
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
  console.log(`[Signature] rawData: "${rawData}"`)
  return CryptoJS.HmacSHA256(rawData, secret).toString(CryptoJS.enc.Base64)
}

/**
 * Xây dựng đầy đủ headers bảo mật cho mọi API request.
 *
 * Headers gửi đi:
 *   X-Device-Id     → deviceId ổn định của máy (hardware hoặc UUID persistent)
 *   Idempotency-Key → UUID MỚI mỗi request (chống duplicate, KHÔNG phải deviceId)
 *   X-Timestamp     → Unix timestamp (giây)
 *   X-Signature     → HMAC-SHA256(method|path|timestamp|body, secret)
 *   X-Client-Type   → "mobile"
 *   Authorization   → Bearer <token> hoặc "none"
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
  // 1. deviceId: stable theo thiết bị
  const deviceId = await getDeviceId()

  // 2. Timestamp tính bằng giây
  const timestamp = Math.floor(Date.now() / 1000).toString()

  // 3. Idempotency-Key: UUID MỚI mỗi request (KHÁC với deviceId)
  const idempotencyKey = uuidv4()

  // 4. Secret để ký HMAC
  let secret: string
  if (!token || token === "none") {
    secret = "default_secret" // login / register
  } else {
    secret = String(token).replace(/^Bearer\s+/i, "").trim()
  }

  // 5. Body: không double-stringify
  const bodyString =
    typeof body === "string" ? body : body ? JSON.stringify(body) : ""

  // 6. Chuẩn hóa path: bỏ query string, đảm bảo dẫn đầu /
  const normalizedPath =
    "/" + (path || "").split("?")[0].replace(/^\/+|\/+$/g, "")

    // 7. Tạo signature
    const signature = buildSignature({
      method: method.toUpperCase(),
      path: normalizedPath,
      timestamp,
      body: bodyString,
      secret,
    })
  
    // 8. Định dạng Header Authorization (phải có Bearer cho Backend)
    let authHeader = "none"
    if (token && token !== "none") {
      authHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`
    }
  
    return {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "X-Client-Type": "mobile",
      "X-Device-Id": deviceId,
      "Accept-Language": "vi",
      "Idempotency-Key": idempotencyKey,
      "X-Timestamp": timestamp,
      "X-Signature": signature,
      "Authorization": authHeader,
    }
}
