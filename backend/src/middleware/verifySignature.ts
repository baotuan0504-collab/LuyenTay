import type { NextFunction, Request, Response } from "express"
import { preRequestApi } from "../utils/preRequestApi"

/**
 * Middleware to verify signature and required headers for incoming API requests.
 * Requires: x-signature, x-timestamp, x-client-type, x-device-id, idempotency-key, etc.
 * Recomputes signature and compares with x-signature. Checks timestamp validity.
 */
export async function verifySignature(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const signature = (req.header("x-signature") || req.header("X-Signature")) as string
  const timestamp = (req.header("x-timestamp") || req.header("X-Timestamp")) as string
  let token = (req.header("authorization") || req.header("Authorization")) as string
  
  // Nếu là login/register, dùng secret mặc định
  if (!token || token === "none") token = "default_secret"
  
  const clientType = req.header("x-client-type") || req.header("X-Client-Type")
  const deviceId = req.header("x-device-id") || req.header("X-Device-Id")
  const idempotencyKey = req.header("idempotency-key") || req.header("Idempotency-Key")

  // Log all headers for debugging
  console.log(`[DEBUG] Incoming headers for ${req.method} ${req.originalUrl}:`, JSON.stringify(req.headers, null, 2))

  // Skip signature verification for OPTIONS requests (CORS pre-flight)
  if (req.method === "OPTIONS") {
    return next()
  }

  // Check required headers
  const required = {
    signature,
    timestamp,
    token,
    clientType,
    deviceId,
    idempotencyKey,
  }

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    console.log("[DEBUG] Missing headers detected:", missing)
    return res.status(400).json({
      message: "Missing required headers",
      missing,
    })
  }

  // Check timestamp (max 5 minutes drift)
  const now = Math.floor(Date.now() / 1000)
  const ts = parseInt(timestamp, 10)
  if (isNaN(ts) || Math.abs(now - ts) > 300) {
    return res.status(400).json({ message: "Invalid or expired timestamp" })
  }

  // Recompute signature
  // Frontend dùng endpoint (vd: /auth/login), Backend dùng originalUrl và bỏ tiền tố /api
  const fullPath = req.originalUrl.split("?")[0]
  const path = "/" + fullPath.replace(/^\/api/, "").replace(/^\/+|\/+$/g, "")
  
  // Quan trọng: Dùng chuỗi gốc chưa qua parse (rawBody) nếu có để đảm bảo khớp 100%
  const body = req.rawBody || ""

  // Log for POST debugging
  if (req.method !== "GET") {
    console.log(`[DEBUG] POST Body for signature: "${body}"`)
    console.log(`[DEBUG] Normalized Path: "${path}"`)
  }

  const { signature: expectedSignature } = await preRequestApi({
    method: req.method,
    path,
    token,
    body,
    timestamp,
  })

  if (signature !== expectedSignature) {
    console.log("[DEBUG] Backend Signature Mismatch:", {
      path,
      timestamp,
      expected: expectedSignature,
      received: signature,
      headers: req.headers,
    })
    return res.status(401).json({ 
      message: "Invalid signature",
      debug: {
        path,
        timestamp,
        method: req.method,
        expected: expectedSignature,
        received: signature,
      }
    })
  }

  next()
}
