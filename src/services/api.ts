// Helper to check if error is unauthorized
import * as SecureStore from "expo-secure-store"
import { getDefaultApiHeaders } from "./apiHeaders"
export const isUnauthorizedError = (error: unknown): error is ApiError => {
  return error instanceof ApiError && error.status === 401
}

// Global flag to prevent API calls after logout
let globalIsLoggedOut = false
export const setGlobalIsLoggedOut = (val: boolean) => {
  globalIsLoggedOut = val
}

const BASE_URL = (endpoint: string): string => {
  if (endpoint.startsWith("/auth")) {
    return "http://127.0.0.1:7001/api"
  }
  return "http://127.0.0.1:5201/api"
}

// Quản lý trạng thái refresh token
let isRefreshing = false
let failedQueue: any[] = []

// Listener để thông báo cho AuthContext khi token thay đổi
type TokenUpdateListener = (data: {
  accessToken: string | null
  refreshToken: string | null
  user?: any
}) => void
let tokenUpdateListener: TokenUpdateListener | null = null

export const setTokenUpdateListener = (listener: TokenUpdateListener) => {
  tokenUpdateListener = listener
}

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
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

export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<any> => {
  if (globalIsLoggedOut) {
    throw new ApiError("User is logged out", 401)
  }
  const url = BASE_URL(endpoint) + endpoint
  const isAuthNoToken =
    endpoint === "/auth/login" ||
    endpoint === "/auth/register" ||
    endpoint === "/auth/refresh"

  const getHeaders = async (customToken?: string, customPath?: string) => {
    let token: string | undefined = customToken
    let path: string = customPath || endpoint
    let method: string = (
      customPath ? "POST" : options.method || "GET"
    ).toUpperCase()
    let body: string | undefined = options.body
      ? typeof options.body === "string"
        ? options.body
        : JSON.stringify(options.body)
      : undefined

    // Nếu là refresh token request (dù là gọi trực tiếp hay từ interceptor)
    if (path === "/auth/refresh" || customPath === "/auth/refresh") {
      const storedToken =
        customToken || (await SecureStore.getItemAsync("auth_refreshToken"))
      token = storedToken || ""
      path = "/auth/refresh"
      method = "POST"
      body = JSON.stringify({ refreshToken: token })
    } else {
      if (!token) {
        token =
          (options.headers as any)?.["Authorization"] ||
          (options.headers as any)?.["authorization"]
        if (token && token.startsWith("Bearer ")) {
          token = token.replace(/^Bearer\s+/i, "")
        }
      }
      if (!token && !isAuthNoToken) {
        token = (await SecureStore.getItemAsync("auth_accessToken")) || ""
      }
    }

    const defaultHeaders = await getDefaultApiHeaders({
      token,
      method,
      path,
      body,
    })

    const headers: Record<string, string> = {}
    const baseHeaders = { ...defaultHeaders, ...options.headers }
    for (const [k, v] of Object.entries(baseHeaders)) {
      headers[k.toLowerCase()] = v as string
    }

    // Luôn đảm bảo Authorization là Bearer <token>
    if (token && token !== "none") {
      headers["authorization"] = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`
    } else {
      headers["authorization"] = "none"
    }

    return { headers, body }
  }

  const executeRequest = async (token?: string) => {
    const { headers, body } = await getHeaders(token)
    const response = await fetch(url, {
      ...options,
      headers,
      body: body || options.body,
    })
    const data = await response.json().catch(() => null)
    return { response, data }
  }

  const handleResponse = (response: Response, data: any) => {
    if (!response.ok) {
      const message = data?.message || response.statusText || "Request failed"
      console.log(`[API Error] ${response.status} - ${message} for ${endpoint}`)
      const error = new ApiError(message, response.status)
      if (response.status === 429) {
        error.handled = false
      }
      throw error
    }
    return data
  }

  try {
    let { response, data } = await executeRequest()

    // Tự động refresh token nếu gặp lỗi 401 (và không phải đang gọi API auth)
    if (response.status === 401 && !isAuthNoToken) {
      if (isRefreshing) {
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
        const storedRefreshToken =
          await SecureStore.getItemAsync("auth_refreshToken")
        if (!storedRefreshToken) throw new Error("No Refresh Token")

        // Gọi API refresh
        const refreshUrl = BASE_URL("/auth/refresh") + "/auth/refresh"
        const refreshBody = JSON.stringify({ refreshToken: storedRefreshToken })
        const refreshHeaders = await getDefaultApiHeaders({
          method: "POST",
          path: "/auth/refresh",
          body: refreshBody,
          token: storedRefreshToken,
        })

        const refreshRes = await fetch(refreshUrl, {
          method: "POST",
          headers: refreshHeaders,
          body: refreshBody,
        })

        if (!refreshRes.ok) throw new Error("Refresh Failed")

        const refreshData = await refreshRes.json()
        const newToken = refreshData.accessToken
        const newRefreshToken = refreshData.refreshToken

        // Lưu vào SecureStore
        await SecureStore.setItemAsync("auth_accessToken", newToken)
        await SecureStore.setItemAsync("auth_refreshToken", newRefreshToken)
        if (refreshData.user) {
          await SecureStore.setItemAsync(
            "auth_user",
            JSON.stringify(refreshData.user),
          )
        }

        // Thông báo cho AuthContext cập nhật state
        if (tokenUpdateListener) {
          tokenUpdateListener({
            accessToken: newToken,
            refreshToken: newRefreshToken,
            user: refreshData.user,
          })
        }

        processQueue(null, newToken)
        isRefreshing = false

        // Thực hiện lại request ban đầu với token mới
        const retry = await executeRequest(newToken)
        return handleResponse(retry.response, retry.data)
      } catch (err) {
        processQueue(err, null)
        isRefreshing = false

        if (globalIsLoggedOut) {
          throw new ApiError("User is logged out", 401)
        }
        throw new ApiError("Session Expired", 401)
      }
    }

    return handleResponse(response, data)
  } catch (error) {
    throw error
  }
}
