import { Alert } from "react-native"
import { getDefaultApiHeaders } from "./apiHeaders"

const BASE_URL = (endpoint: string): string => {
  if (endpoint.startsWith("/auth")) {
    // Đổi sang đúng port của authserver, ví dụ 7001
    return "http://127.0.0.1:7001/api"
  }
  return "http://127.0.0.1:5201/api"
}
// const BASE_URL = "http://10.10.33.245:5201/api"

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export const isUnauthorizedError = (error: unknown): error is ApiError => {
  return error instanceof ApiError && error.status === 401
}

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = BASE_URL(endpoint) + endpoint
  // Xác định đây có phải là login/register không
  const isAuthNoToken =
    endpoint === "/auth/login" || endpoint === "/auth/register"
  let token =
    (options.headers &&
      ((options.headers as any)["Authorization"] ||
        (options.headers as any)["authorization"])) ||
    undefined
  if (isAuthNoToken) token = undefined
  if (!token && !isAuthNoToken) token = ""
  // Lấy method, path, body đúng chuẩn để build signature
  const method = (options.method || "GET").toUpperCase()
  // path phải là endpoint đúng như backend nhận (KHÔNG có domain)
  const path = endpoint
  // body phải là string hoặc undefined
  let body: string | undefined = undefined
  if (options.body) {
    if (typeof options.body === "string") {
      body = options.body
    } else {
      try {
        body = JSON.stringify(options.body)
      } catch {
        body = undefined
      }
    }
  }
  const defaultHeaders = await getDefaultApiHeaders({
    token,
    method,
    path,
    body,
  })
  // Đảm bảo tất cả key header là lowercase
  const headers: Record<string, string> = {}
  for (const [k, v] of Object.entries({
    ...defaultHeaders,
    ...options.headers,
  })) {
    headers[k.toLowerCase()] = v as string
  }
  // Luôn đảm bảo có Authorization (dù là rỗng)
  if (!headers["authorization"]) headers["authorization"] = "none"
  console.log("[apiFetch] URL:", url)
  console.log("[apiFetch] Headers (lowercase):", headers)

  // Trích xuất các thuộc tính khác từ options, loại bỏ headers cũ để dùng headers mới đã gộp
  const { headers: _oldHeaders, ...remainingOptions } = options

  const response = await fetch(url, {
    ...remainingOptions,
    headers, // Sử dụng headers đã được gộp và chuẩn hóa ở trên
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message = data?.message || response.statusText || "Request failed"

    // Nếu là lỗi Rate Limit (429), hiển thị thông báo cho người dùng thay vì để lỗi đỏ
    if (response.status === 429) {
      Alert.alert("Thông báo", message)
    }

    throw new ApiError(message, response.status)
  }

  return data
}
