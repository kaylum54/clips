import { upstashRedis } from './queue/connection'

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
}

// Redis-based rate limiting using sliding window
export async function checkRateLimitRedis(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = `ratelimit:${identifier}`
  const now = Date.now()
  const windowStart = now - config.windowMs

  try {
    // Use Upstash Redis pipeline for atomic operations
    const pipeline = upstashRedis.pipeline()

    // Remove old entries outside the window
    pipeline.zremrangebyscore(key, 0, windowStart)
    // Add current request with timestamp as score
    pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` })
    // Count requests in the window
    pipeline.zcard(key)
    // Set expiry on the key
    pipeline.expire(key, Math.ceil(config.windowMs / 1000))

    const results = await pipeline.exec()
    const requestCount = results[2] as number

    return {
      success: requestCount <= config.maxRequests,
      remaining: Math.max(0, config.maxRequests - requestCount),
      resetTime: now + config.windowMs,
    }
  } catch (error) {
    console.error('Redis rate limit error:', error)
    // Fail open - allow request if Redis is unavailable
    return {
      success: true,
      remaining: config.maxRequests,
      resetTime: now + config.windowMs,
    }
  }
}

// Pre-configured rate limits
export const RATE_LIMITS = {
  render: { maxRequests: 5, windowMs: 60000 }, // 5 per minute
  api: { maxRequests: 30, windowMs: 60000 }, // 30 per minute
  auth: { maxRequests: 5, windowMs: 60000 }, // 5 per minute
}

// Convenience function for render rate limiting
export async function checkRenderRateLimit(userId: string): Promise<RateLimitResult> {
  return checkRateLimitRedis(`render:${userId}`, RATE_LIMITS.render)
}
