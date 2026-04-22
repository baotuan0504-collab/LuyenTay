import * as SecureStore from "expo-secure-store"
import { Alert } from "react-native"
import { getDefaultApiHeaders } from "./apiHeaders"

const BASE_URL = (endpoint: string): string => {
  if (endpoint.startsWith("/auth")) {
    return "http://127.0.0.1:7001/api"
  }
  return "http://127.0.0.1:5201/api"
}

// Quản lý trạng thái refresh token
let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

export class ApiError extends Error {
  readonly status: number
  handled: boolean = false

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export const isUnauthorizedError = (error: unknown): error is ApiError => {
  return error instanceof ApiError && error.status === 401
}

export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<any> => {
  const url = BASE_URL(endpoint) + endpoint
  
  const isAuthNoToken =
    endpoint === "/auth/login" ||
    endpoint === "/auth/register" ||
    endpoint === "/auth/refresh"

  const getHeaders = async (customToken?: string, customPath?: string) => {
    let token = customToken
    if (!token) {
      token = (options.headers as any)?.["Authorization"] || (options.headers as any)?.["authorization"]
      if (token && token.startsWith("Bearer ")) {
        token = token.replace(/^Bearer\s+/i, "")
      }
    }

    if (isAuthNoToken && !customToken) token = undefined
    if (!token && !isAuthNoToken) {
      token = (await SecureStore.getItemAsync("auth_accessToken")) || ""
    }

    const method = customPath ? "POST" : (options.method || "GET").toUpperCase()
    const path = customPath || endpoint
    const body = customPath 
      ? JSON.stringify({ refreshToken: customToken }) 
      : (options.body ? (typeof options.body === "string" ? options.body : JSON.stringify(options.body)) : undefined)

    const defaultHeaders = await getDefaultApiHeaders({ token, method, path, body })

    const headers: Record<string, string> = {}
    // Nếu là customPath (thường là refresh), không trộn headers cũ để tránh ghi đè Token/Signature
    const baseHeaders = customPath ? defaultHeaders : { ...defaultHeaders, ...options.headers }
    
    for (const [k, v] of Object.entries(baseHeaders)) {
      headers[k.toLowerCase()] = v as string
    }
    
    // Đảm bảo header authorization luôn dùng token mới nhất và đúng định dạng Bearer
    if (token && token !== "none") {
      headers["authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`
    } else {
      headers["authorization"] = "none"
    }
    return headers
  }

  const executeRequest = async (token?: string) => {
    const headers = await getHeaders(token)
    const { headers: _obs, ...remainingOptions } = options
    const response = await fetch(url, { ...remainingOptions, headers })
    const data = await response.json().catch(() => null)
    return { response, data }
  }

  const handleResponse = (response: Response, data: any) => {
    if (!response.ok) {
      const message = data?.message || response.statusText || "Request failed"
      console.log(`[API Error] ${response.status} - ${message} for ${endpoint}`)
      
      if (response.status === 429) {
        Alert.alert("Thông báo", message)
        const error = new ApiError(message, response.status)
        error.handled = true
        throw error
      }
      throw new ApiError(message, response.status)
    }
    return data
  }

  try {
    let { response, data } = await executeRequest()

    // 1. Nếu lỗi 401 (và không phải API đặc biệt), tiến hành refresh token
    if (response.status === 401 && !isAuthNoToken) {
      if (isRefreshing) {
        // Xếp hàng đợi nếu đang có tiến trình refresh khác chạy
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: async (token: string) => {
              try {
                const retry = await executeRequest(token)
                resolve(handleResponse(retry.response, retry.data))
              } catch (err) {
                reject(err)
              }
            },
            reject: (err: any) => reject(err),
          })
        })
      }

      isRefreshing = true

      try {
        const storedRefreshToken = await SecureStore.getItemAsync("auth_refreshToken")
        if (!storedRefreshToken) throw new Error("No Refresh Token")

        const refreshHeaders = await getHeaders(storedRefreshToken, "/auth/refresh")
        const refreshRes = await fetch(BASE_URL("/auth/refresh") + "/auth/refresh", {
          method: "POST",
          headers: refreshHeaders,
          body: JSON.stringify({ refreshToken: storedRefreshToken }),
        })

        if (!refreshRes.ok) throw new Error("Refresh Failed")

        const refreshData = await refreshRes.json()
        const newToken = refreshData.accessToken
        
        console.log(`[Auth] Refresh Success. New Token: ${newToken.substring(0, 15)}...`)
        
        await SecureStore.setItemAsync("auth_accessToken", newToken)
        await SecureStore.setItemAsync("auth_refreshToken", refreshData.refreshToken)

        processQueue(null, newToken)
        isRefreshing = false

        console.log(`[Auth] Retrying original request: ${endpoint}`)
        const retry = await executeRequest(newToken)
        return handleResponse(retry.response, retry.data)
      } catch (err) {
        processQueue(err, null)
        isRefreshing = false
        throw new ApiError("Session Expired", 401)
      }
    }

    // 2. Xử lý phản hồi (thành công hoặc lỗi khác)
    return handleResponse(response, data)
  } catch (error) {
    throw error
  }
}
