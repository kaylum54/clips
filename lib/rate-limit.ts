/**
 * Rate Limiting Utility
 * Simple in-memory rate limiter for API routes
 *
 * Security: Prevents abuse and brute force attacks
 * Note: For production, consider using Redis or Upstash for distributed rate limiting
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean up every minute

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
}

/**
 * Check and update rate limit for a given identifier
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 }
): RateLimitResult {
  const now = Date.now()
  const key = identifier

  let entry = rateLimitStore.get(key)

  // Create new entry or reset if window expired
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
    }
  }

  // Increment count
  entry.count++
  rateLimitStore.set(key, entry)

  const remaining = Math.max(0, config.maxRequests - entry.count)
  const success = entry.count <= config.maxRequests

  return {
    success,
    remaining,
    resetTime: entry.resetTime,
  }
}

/**
 * Create a rate limit key from request info
 */
export function getRateLimitKey(
  type: string,
  identifier: string
): string {
  return `${type}:${identifier}`
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // Auth endpoints - stricter to prevent brute force
  auth: { maxRequests: 5, windowMs: 60000 }, // 5 per minute

  // Checkout - prevent abuse
  checkout: { maxRequests: 3, windowMs: 60000 }, // 3 per minute

  // Render tracking - allow reasonable usage
  render: { maxRequests: 10, windowMs: 60000 }, // 10 per minute

  // General API - moderate limits
  api: { maxRequests: 30, windowMs: 60000 }, // 30 per minute
} as const
