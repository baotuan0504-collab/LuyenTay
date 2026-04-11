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
  const token = req.headers["authorization"] as string
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
  const method = req.method
  const path = req.path
  const body =
    req.body && Object.keys(req.body).length > 0 ? JSON.stringify(req.body) : ""
  const { signature: expectedSignature } = await preRequestApi({
    method,
    path,
    token,
    body,
  })

  if (signature !== expectedSignature) {
    return res.status(401).json({ message: "Invalid signature" })
  }

  next()
}
