import type { NextFunction, Request, Response } from "express"
import redis from "../config/redis"


export async function globalRateLimiter(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const ip = req.ip || req.headers["x-forwarded-for"] || "unknown"
  const path = req.path
  const method = req.method.toUpperCase()
  const key = `ratelimit:global:${ip}:${method}:${path}`

  try {
    const current = await redis.incr(key)
    if (current === 1) {
      await redis.expire(key, 30)
    }

    const limit = method === "GET" ? 50 : 40

    if (current > limit) {
      return res.status(429).json({
        message: "Bạn thao tác nhanh quá, vui lòng bình tĩnh lại!",
        success: false,
      })
    }
    next()
  } catch (err) {
    next()
  }
}
