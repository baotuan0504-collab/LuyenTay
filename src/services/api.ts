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
    let method: string = customPath
      ? "POST"
      : (options.method || "GET").toUpperCase()
    let path: string = customPath || endpoint
    let body: string | undefined

    // Đảm bảo khi gọi /auth/refresh thì path, body, token đều đúng chuẩn
    if (
      isAuthNoToken &&
      (customPath === "/auth/refresh" ||
        path === "/auth/refresh" ||
        endpoint === "/auth/refresh")
    ) {
      token = customToken
      path = "/auth/refresh"
      method = "POST"
      body = JSON.stringify({ refreshToken: customToken })
    } else {
      body = options.body
        ? typeof options.body === "string"
          ? options.body
          : JSON.stringify(options.body)
        : undefined
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
    const baseHeaders = customPath
      ? defaultHeaders
      : { ...defaultHeaders, ...options.headers }
    for (const [k, v] of Object.entries(baseHeaders)) {
      headers[k.toLowerCase()] = v as string
    }
    // Luôn đảm bảo Authorization là Bearer <refreshToken> khi refresh
    if (
      isAuthNoToken &&
      (path === "/auth/refresh" || endpoint === "/auth/refresh")
    ) {
      headers["authorization"] = token ? `Bearer ${token}` : "none"
    } else if (token && token !== "none") {
      headers["authorization"] = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`
    } else {
      headers["authorization"] = "none"
    }
    return headers
  }

  const executeRequest = async (token?: string) => {
    // Special handling for /auth/refresh: always use correct body and signature
    if (isAuthNoToken && token && url.endsWith("/auth/refresh")) {
      const refreshBody = JSON.stringify({ refreshToken: token })
      const headers = await getDefaultApiHeaders({
        method: "POST",
        path: "/auth/refresh",
        body: refreshBody,
        token,
      })
      // Log headers and body for debugging signature issues
      console.log("[DEBUG][/auth/refresh] Request Headers:", headers)
      console.log("[DEBUG][/auth/refresh] Request Body:", refreshBody)
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: refreshBody,
      })
      const data = await response.json().catch(() => null)
      return { response, data }
    } else {
      let headers = await getHeaders(token)
      let fetchOptions = { ...options, headers }
      const { headers: _obs, ...remainingOptions } = fetchOptions
      const response = await fetch(url, { ...remainingOptions, headers })
      const data = await response.json().catch(() => null)
      return { response, data }
    }
  }

  const handleResponse = (response: Response, data: any) => {
    if (!response.ok) {
      const message = data?.message || response.statusText || "Request failed"
      console.log(`[API Error] ${response.status} - ${message} for ${endpoint}`)
      // Always throw ApiError so caller can catch and Alert
      const error = new ApiError(message, response.status)
      if (response.status === 429) {
        error.handled = false // Let caller decide to Alert
      }
      throw error
    }
    return data
  }

  try {
    let { response, data } = await executeRequest()
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
        const refreshHeaders = await getHeaders(
          storedRefreshToken,
          "/auth/refresh",
        )
        const refreshRes = await fetch(
          BASE_URL("/auth/refresh") + "/auth/refresh",
          {
            method: "POST",
            headers: refreshHeaders,
            body: JSON.stringify({ refreshToken: storedRefreshToken }),
          },
        )
        if (!refreshRes.ok) throw new Error("Refresh Failed")
        const refreshData = await refreshRes.json()
        const newToken = refreshData.accessToken
        await SecureStore.setItemAsync("auth_accessToken", newToken)
        await SecureStore.setItemAsync(
          "auth_refreshToken",
          refreshData.refreshToken,
        )
        processQueue(null, newToken)
        isRefreshing = false
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
