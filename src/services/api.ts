import { getDefaultApiHeaders } from "./apiHeaders";

const BASE_URL = endpoint => {
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
  const token =
    (options.headers && (options.headers as any)["Authorization"]) || undefined
  const defaultHeaders = await getDefaultApiHeaders(token)
  const headers = {
    ...defaultHeaders,
    ...options.headers,
  }
  console.log("[apiFetch] URL:", url)
  console.log("[apiFetch] Headers:", headers)
  const response = await fetch(url, {
    headers,
    ...options,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message = data?.message || response.statusText || "Request failed"
    throw new ApiError(message, response.status)
  }

  return data
}
