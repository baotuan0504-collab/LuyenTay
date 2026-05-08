import redis from "../../config/redis";

export interface IOtpRateLimitService {
  checkOtpLock(email: string): Promise<{ isLocked: boolean; remaining: number }>;
  handleOtpFailure(email: string): Promise<{ fails: number; isLocked: boolean }>;
  resetFailures(email: string): Promise<void>;
}

export class OtpRateLimitService implements IOtpRateLimitService {
  private readonly FAIL_EXPIRY = 150; // 2.5 mins
  private readonly LOCK_EXPIRY = 3600; // 1 hour
  private readonly MAX_FAILS = 3;

  async checkOtpLock(email: string): Promise<{ isLocked: boolean; remaining: number }> {
    const lockKey = `otp_blocked:${email}`;
    const remaining = await redis.ttl(lockKey);
    return {
      isLocked: remaining > 0,
      remaining: Math.max(0, remaining),
    };
  }

  async handleOtpFailure(email: string): Promise<{ fails: number; isLocked: boolean }> {
    const failKey = `otp_fails:${email}`;
    const lockKey = `otp_blocked:${email}`;

    const fails = await redis.incr(failKey);
    await redis.expire(failKey, this.FAIL_EXPIRY);

    if (fails >= this.MAX_FAILS) {
      await redis.set(lockKey, "true", "EX", this.LOCK_EXPIRY);
      await redis.del(failKey);
      return { fails, isLocked: true };
    }

    return { fails, isLocked: false };
  }

  async resetFailures(email: string): Promise<void> {
    await redis.del(`otp_fails:${email}`);
    await redis.del(`otp_blocked:${email}`);
  }
}
