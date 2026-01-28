/**
 * Video Render Worker
 *
 * Background worker process that processes render jobs from the queue.
 * Run with: npm run worker
 */

import { Worker } from 'bullmq'
import IORedis from 'ioredis'
import { processRenderJob } from './processor'
import type { RenderJobData } from '../lib/queue/types'

// Load environment variables
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const QUEUE_NAME = 'video-render'
const CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '2', 10)

// Create Redis connection for the worker
const redisUrl = process.env.REDIS_URL

if (!redisUrl) {
  console.error('[Worker] REDIS_URL environment variable is required')
  process.exit(1)
}

const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  // Upstash requires TLS
  tls: {
    rejectUnauthorized: false,
  },
  // Keep connection alive
  keepAlive: 30000, // 30 seconds
  // Reconnection settings
  retryStrategy: (times) => {
    if (times > 10) {
      console.error('[Worker] Redis: Max reconnection attempts reached')
      return null
    }
    const delay = Math.min(times * 200, 5000)
    console.log(`[Worker] Redis: Reconnecting in ${delay}ms (attempt ${times})`)
    return delay
  },
  // Connection timeout
  connectTimeout: 10000,
})

console.log('[Worker] Starting video render worker...')
console.log(`[Worker] Concurrency: ${CONCURRENCY}`)
console.log(`[Worker] Queue: ${QUEUE_NAME}`)

// Create the worker
const worker = new Worker<RenderJobData>(
  QUEUE_NAME,
  async (job) => {
    console.log(`[Worker] Processing job ${job.id}`)
    return processRenderJob(job)
  },
  {
    connection,
    concurrency: CONCURRENCY,
    limiter: {
      max: 10,
      duration: 60000, // Max 10 jobs per minute
    },
  }
)

// Event handlers
worker.on('ready', () => {
  console.log('[Worker] Ready and waiting for jobs...')
})

worker.on('active', (job) => {
  console.log(`[Worker] Job ${job.id} is now active`)
})

worker.on('completed', (job, result) => {
  console.log(`[Worker] Job ${job.id} completed successfully`)
  console.log(`[Worker] Result:`, result)
})

worker.on('failed', (job, error) => {
  console.error(`[Worker] Job ${job?.id} failed:`, error.message)

  if (job && job.attemptsMade < (job.opts.attempts || 3)) {
    console.log(`[Worker] Job ${job.id} will be retried (attempt ${job.attemptsMade + 1})`)
  }
})

worker.on('progress', (job, progress) => {
  console.log(`[Worker] Job ${job.id} progress: ${progress}%`)
})

worker.on('error', (error) => {
  console.error('[Worker] Worker error:', error)
})

// Graceful shutdown
async function shutdown() {
  console.log('[Worker] Shutting down...')

  // Close the worker (waits for active jobs to complete)
  await worker.close()

  // Close Redis connection
  connection.disconnect()

  console.log('[Worker] Shutdown complete')
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('[Worker] Uncaught exception:', error)
  shutdown()
})

process.on('unhandledRejection', (reason) => {
  console.error('[Worker] Unhandled rejection:', reason)
  shutdown()
})

console.log('[Worker] Worker started successfully')
