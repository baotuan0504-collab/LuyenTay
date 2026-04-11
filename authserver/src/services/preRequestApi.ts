import crypto from "crypto"

/**
 * Generate signature and timestamp for authservice API requests.
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
}: {
  token: string
  path: string
  method: string
  body?: BodyInit | null | undefined
}): Promise<{
  signature: string
  timestamp: string
}> {
  const timestamp = Math.floor(Date.now() / 1000).toString()
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
