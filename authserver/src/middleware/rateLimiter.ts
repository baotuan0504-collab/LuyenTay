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


export async function checkOtpLock(
  email: string,
): Promise<{ isLocked: boolean; remaining: number }> {
  const lockKey = `otp_blocked:${email}`
  const remaining = await redis.ttl(lockKey)
  return {
    isLocked: remaining > 0,
    remaining: Math.max(0, remaining),
  }
}

export async function handleOtpFailure(
  email: string,
): Promise<{ fails: number; isLocked: boolean }> {
  const failKey = `otp_fails:${email}`
  const lockKey = `otp_blocked:${email}`

  const fails = await redis.incr(failKey)
  await redis.expire(failKey, 150)

  if (fails >= 3) {
    await redis.set(lockKey, "true", "EX", 3600)
    await redis.del(failKey)
    return { fails, isLocked: true }
  }

  return { fails, isLocked: false }
}
