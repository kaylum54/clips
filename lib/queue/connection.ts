import { Redis as UpstashRedis } from '@upstash/redis'
import IORedis from 'ioredis'

// Upstash REST client (for rate limiting and simple operations)
export const upstashRedis = new UpstashRedis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// IORedis connection for BullMQ (requires TCP connection)
// Upstash provides a Redis URL for TCP connections
let ioRedisConnection: IORedis | null = null

export function getIORedisConnection(): IORedis {
  if (!ioRedisConnection) {
    const redisUrl = process.env.REDIS_URL

    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is required for BullMQ')
    }

    ioRedisConnection = new IORedis(redisUrl, {
      maxRetriesPerRequest: null, // Required for BullMQ
      enableReadyCheck: false,
    })

    ioRedisConnection.on('error', (err) => {
      console.error('Redis connection error:', err)
    })

    ioRedisConnection.on('connect', () => {
      console.log('Redis connected')
    })
  }

  return ioRedisConnection
}

// Clean up connection on process exit
if (typeof process !== 'undefined') {
  process.on('beforeExit', () => {
    if (ioRedisConnection) {
      ioRedisConnection.disconnect()
    }
  })
}
