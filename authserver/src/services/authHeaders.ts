import type { Request } from "express"
import { preRequestApi } from "./preRequestApi"

/**
 * Generate common headers for authservice API requests, including signature and timestamp.
 * @param req Express request object
 * @param token Bearer token string
 * @param method HTTP method (GET, POST, etc.)
 * @param path API path (e.g., /api/auth/verify-login-otp)
 * @param body Request body (stringified JSON or undefined)
 */
export async function buildAuthServiceHeaders({
  req,
  token,
  method,
  path,
  body,
}: {
  req: Request
  token: string
  method: string
  path: string
  body?: string
}) {
  const { signature, timestamp } = await preRequestApi({
    method,
    path,
    token,
    body,
  })
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Client-Type": req.headers["x-client-type"],
    "X-Device-Id": req.headers["x-device-id"],
    "Accept-Language": req.headers["accept-language"],
    "Idempotency-Key": req.headers["idempotency-key"],
    "x-timestamp": timestamp,
    "x-signature": signature,
  }
}
