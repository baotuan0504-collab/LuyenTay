import axios from "axios"
import crypto from "crypto"
import type { NextFunction, Request, Response } from "express"
import { preRequestApi } from "../utils/preRequestApi"

export type AuthRequest = Request & {
  userId?: string
}

export async function protectRoute(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const token = authHeader.split(" ")[1]
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    // Tạo signature cho request service-to-service sang authserver
    const AUTHSERVER_URL = process.env.AUTHSERVER_URL || "http://127.0.0.1:7001"
    const path = "/auth/verify"
    const method = "POST"
    const bodyObj = { token }
    const bodyStr = JSON.stringify(bodyObj)
    
    const { signature, timestamp } = await preRequestApi({
      method,
      path,
      token,
      body: bodyStr,
    })

    console.log(
      `[protectRoute] Calling AuthServer /verify with token: ${token.substring(0, 15)}...`
    )
    // Gọi sang authserver để xác thực token
    const response = await axios.post(`${AUTHSERVER_URL}/api/auth/verify`, bodyObj, {
      headers: {
        "x-signature": signature,
        "x-timestamp": timestamp,
        "x-client-type": "backend",
        "x-device-id": "system",
        "idempotency-key": crypto.randomUUID(),
        "authorization": `Bearer ${token}`
      }
    })
    
    console.log("[protectRoute] AuthServer Response Status:", response.status)
    console.log("[protectRoute] AuthServer Data:", response.data)
    if (!response.data || !response.data.userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }
    req.userId = response.data.userId
    next()
  } catch (error: any) {
    console.error(
      "[protectRoute] ERROR:",
      error?.message,
      error?.response?.data,
    )
    res
      .status(error.response?.status || 401)
      .json(error.response?.data || { message: "Unauthorized" })
  }
}
