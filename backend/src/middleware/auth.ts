import axios from "axios"
import type { NextFunction, Request, Response } from "express"

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

    // Gọi sang authserver để xác thực token
    const AUTHSERVER_URL = process.env.AUTHSERVER_URL
    const response = await axios.post(`${AUTHSERVER_URL}/api/auth/verify`, {
      token,
    })
    if (!response.data || !response.data.userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }
    req.userId = response.data.userId
    next()
  } catch (error: any) {
    res
      .status(error.response?.status || 401)
      .json(error.response?.data || { message: "Unauthorized" })
  }
}
