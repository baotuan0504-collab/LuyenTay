import type { Request } from "express"
import { preRequestApi } from "./preRequestApi"

/**
 * Build headers for requests to authservice, including signature and timestamp (shared logic).
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
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Client-Type": req.headers["x-client-type"],
    "X-Device-Id": req.headers["x-device-id"],
    "Accept-Language": req.headers["accept-language"],
    "Idempotency-Key": req.headers["idempotency-key"],
    "x-timestamp": timestamp,
    "x-signature": signature,
  }
  console.log("[buildAuthServiceHeaders] Generated headers:", headers)
  return headers
}
