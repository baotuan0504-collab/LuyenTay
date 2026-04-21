import type { NextFunction, Request, Response } from "express"
import redis from "../config/redis"

/**
 * Middleware giới hạn tốc độ gọi API chung (Global Rate Limiter)
 * Mặc định: 30 request / 30 giây cho mỗi IP mỗi endpoint
 */
export async function globalRateLimiter(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const ip = req.ip || req.headers["x-forwarded-for"] || "unknown"
  const path = req.path
  const key = `ratelimit:global:${ip}:${path}`

  try {
    const current = await redis.incr(key)
    if (current === 1) {
      await redis.expire(key, 30) // Window 30 giây
    }

    if (current > 10) {
      return res.status(429).json({
        message: "Bạn thao tác nhanh quá, vui lòng bình tĩnh lại!",
        success: false,
      })
    }
    next()
  } catch (err) {
    // Nếu Redis lỗi, vẫn cho qua để không treo app khách hàng
    next()
  }
}

/**
 * Helper kiểm tra xem Email có đang bị khóa OTP hay không
 */
export async function checkOtpLock(email: string): Promise<{ isLocked: boolean; remaining: number }> {
  const lockKey = `otp_blocked:${email}`
  const remaining = await redis.ttl(lockKey)
  return {
    isLocked: remaining > 0,
    remaining: Math.max(0, remaining),
  }
}

/**
 * Helper xử lý khi nhập sai OTP: Tăng bộ đếm, nếu quá 3 lần thì khóa 1 giờ
 */
export async function handleOtpFailure(email: string): Promise<{ fails: number; isLocked: boolean }> {
  const failKey = `otp_fails:${email}`
  const lockKey = `otp_blocked:${email}`

  const fails = await redis.incr(failKey)
  // Mỗi lần sai sẽ reset thời gian chờ của bộ đếm về 150s (khớp với thời gian sống của OTP)
  await redis.expire(failKey, 150)

  if (fails >= 3) {
    await redis.set(lockKey, "true", "EX", 3600) // Khóa 1 giờ (3600s)
    await redis.del(failKey)
    return { fails, isLocked: true }
  }

  return { fails, isLocked: false }
}
