import AsyncStorage from "@react-native-async-storage/async-storage"
import * as CryptoJS from "crypto-js"
import DeviceInfo from "react-native-device-info"
import { v4 as uuidv4 } from "uuid"

// Hàm tạo signature đồng bộ backend
function buildSignature({ method, path, timestamp, body, secret }) {
  const rawData = [method, path, timestamp, body ?? ""].join("|")
  return CryptoJS.HmacSHA256(rawData, secret).toString(CryptoJS.enc.Base64)
}

// Hàm lấy deviceId thực từ thiết bị
async function getDeviceId() {
  try {
    const realDeviceId = DeviceInfo.getUniqueId()
    return realDeviceId
  } catch (e) {
    // fallback nếu lỗi
    let deviceId = await AsyncStorage.getItem("deviceId")
    if (!deviceId) {
      deviceId = uuidv4()
      await AsyncStorage.setItem("deviceId", deviceId)
    }
    return deviceId
  }
}

// Hàm trả về headers đầy đủ cho mọi API
export async function getDefaultApiHeaders({
  method = "GET",
  path = "/",
  body = undefined,
  token = undefined,
}) {
  const deviceId = await getDeviceId()
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const idempotencyKey = uuidv4()
  // secret để ký là token (bỏ tiền tố Bearer nếu có)
  const secret = token ? token.replace(/^Bearer\s+/i, "").trim() : ""
  const bodyString = body ? JSON.stringify(body) : ""
  const signature = buildSignature({
    method,
    path,
    timestamp,
    body: bodyString,
    secret,
  })
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Client-Type": "mobile",
    "X-Device-Id": deviceId,
    "Accept-Language": "vi",
    "Idempotency-Key": idempotencyKey,
    "X-Timestamp": timestamp,
    "X-Signature": signature,
    ...(token ? { Authorization: token } : {}),
  } as Record<string, string>
}
