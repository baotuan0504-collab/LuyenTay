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
  const signature = req.headers["x-signature"] as string
  const timestamp = req.headers["x-timestamp"] as string
  let token = req.headers["authorization"] as string
  
  // Nếu là login/register, dùng secret mặc định
  if (!token || token === "none") token = "default_secret"
  
  const clientType = req.headers["x-client-type"]
  const deviceId = req.headers["x-device-id"]
  const idempotencyKey = req.headers["idempotency-key"]

  // Check required headers
  if (
    !signature ||
    !timestamp ||
    !token ||
    !clientType ||
    !deviceId ||
    !idempotencyKey
  ) {
    return res.status(400).json({ message: "Missing required headers" })
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
  const path = fullPath.replace(/^\/api/, "")
  
  // Quan trọng: Dùng chuỗi gốc chưa qua parse (rawBody) nếu có để đảm bảo khớp 100%
  const body = req.rawBody || ""

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
      received: signature
    })
    return res.status(401).json({ 
      message: "Invalid signature",
      debug: {
        path,
        timestamp,
        method: req.method,
      }
    })
  }

  next()
}
