import { Queue } from 'bullmq'
import { getIORedisConnection } from './connection'
import type { RenderJobData } from './types'

const QUEUE_NAME = 'video-render'

let renderQueue: Queue<RenderJobData> | null = null

export function getRenderQueue(): Queue<RenderJobData> {
  if (!renderQueue) {
    renderQueue = new Queue<RenderJobData>(QUEUE_NAME, {
      connection: getIORedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000, // 5s, then 25s, then 125s
        },
        removeOnComplete: {
          age: 3600, // 1 hour
          count: 100,
        },
        removeOnFail: {
          age: 86400, // 24 hours
        },
      },
    })
  }

  return renderQueue
}

// Priority levels: lower number = higher priority
export const RENDER_PRIORITY = {
  PRO: 1,      // Pro users get highest priority
  FREE: 10,    // Free users get lower priority
} as const

interface AddRenderJobOptions {
  isPro?: boolean
}

export async function addRenderJob(
  jobData: RenderJobData,
  options: AddRenderJobOptions = {}
): Promise<string> {
  const queue = getRenderQueue()

  // Pro users get priority queue (lower number = higher priority)
  const priority = options.isPro ? RENDER_PRIORITY.PRO : RENDER_PRIORITY.FREE

  const job = await queue.add('render', jobData, {
    jobId: jobData.jobId, // Use our database job ID as BullMQ job ID
    priority,
  })

  return job.id || jobData.jobId
}

export async function getQueuePosition(jobId: string): Promise<number> {
  const queue = getRenderQueue()

  const waitingJobs = await queue.getWaiting()
  const position = waitingJobs.findIndex(job => job.id === jobId)

  return position === -1 ? 0 : position + 1
}

export async function getQueueStats() {
  const queue = getRenderQueue()

  const [waiting, active, completed, failed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
  ])

  return { waiting, active, completed, failed }
}
