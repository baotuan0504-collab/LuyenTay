import crypto from "crypto"

/**
 * Generate signature and timestamp for authservice API requests (same logic as authservice).
 * @param method HTTP method (GET, POST, etc.)
 * @param path API path (e.g., /api/auth/verify-login-otp)
 * @param token Bearer token string
 * @param body Request body (stringified JSON or undefined)
 */
export async function preRequestApi({
  method,
  path,
  token,
  body,
  timestamp: providedTimestamp,
}: {
  token: string
  path: string
  method: string
  body?: BodyInit | null | undefined
  timestamp?: string
}): Promise<{
  signature: string
  timestamp: string
}> {
  const timestamp = providedTimestamp || Math.floor(Date.now() / 1000).toString()
  const rawData = method + "|" + path + "|" + timestamp + "|" + (body ?? "")
  const signature = crypto
    .createHmac("sha256", token.replace(/^Bearer\s+/i, "").trim())
    .update(rawData)
    .digest("base64")
  return {
    signature,
    timestamp,
  }
}
