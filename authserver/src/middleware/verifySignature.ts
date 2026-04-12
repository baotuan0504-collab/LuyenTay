import type { NextFunction, Request, Response } from "express"
import { preRequestApi } from "../services/preRequestApi"

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
  const signature = req.headers["x-signature"] as string
  const timestamp = req.headers["x-timestamp"] as string
  let token = req.headers["authorization"] as string
  // Nếu là login/register, FE sẽ gửi 'none', backend sẽ dùng secret mặc định
  if (!token || token === "none") token = "default_secret"
  const clientType = req.headers["x-client-type"]
  const deviceId = req.headers["x-device-id"]
  const idempotencyKey = req.headers["idempotency-key"]

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
    console.log("[DEBUG] Missing headers:", missing)
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
  // Frontend dùng endpoint (vd: /auth/login), Backend middleware thấy req.path relative.
  // Chuẩn hóa dùng originalUrl và bỏ tiền tố /api
  const fullPath = req.originalUrl.split("?")[0]
  const path = fullPath.replace(/^\/api/, "").replace(/^\/+|\/+$/g, "")
  
  // Quan trọng: Dùng chuỗi gốc chưa qua parse (rawBody) nếu có để đảm bảo khớp 100%
  const body = req.rawBody || ""

  console.log("[DEBUG] verifySignature detail:", {
    method: req.method,
    originalUrl: req.originalUrl,
    normalizedPath: path,
    timestamp,
    bodyPreview: body.substring(0, 50),
    receivedSignature: signature,
  })

  const { signature: expectedSignature } = await preRequestApi({
    method: req.method,
    path,
    token,
    body,
    timestamp,
  })

  console.log("[DEBUG] expectedSignature:", expectedSignature)

  if (signature !== expectedSignature) {
    return res.status(401).json({
      message: "Invalid signature",
      debug: {
        path,
        timestamp,
        method: req.method,
        expected: expectedSignature,
        received: signature,
      },
    })
  }

  next()
}
