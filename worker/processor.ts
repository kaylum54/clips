/**
 * Render Job Processor
 *
 * Contains the core logic for processing render jobs.
 * Uses Remotion to render videos from candle data.
 */

import { Job } from 'bullmq'
import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'
import path from 'path'
import fs from 'fs'
import os from 'os'
import { createClient } from '@supabase/supabase-js'
import type { RenderJobData, RenderJobResult } from '@/lib/queue/types'

// Supabase admin client for the worker (lazy-loaded to ensure env vars are available)
let supabaseClient: ReturnType<typeof createClient> | null = null

function getSupabase() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
    }

    supabaseClient = createClient(supabaseUrl, supabaseServiceKey)
  }
  return supabaseClient
}

// Bundle caching
let cachedBundlePath: string | null = null
let bundleTimestamp: number = 0
const BUNDLE_CACHE_TTL = 1000 * 60 * 30 // 30 minutes for worker (longer cache)
const BUNDLE_VERSION = 7

let lastBundleVersion = 0

async function getBundlePath(): Promise<string> {
  const now = Date.now()

  // Return cached bundle if still valid
  if (
    cachedBundlePath &&
    fs.existsSync(cachedBundlePath) &&
    now - bundleTimestamp < BUNDLE_CACHE_TTL &&
    lastBundleVersion === BUNDLE_VERSION
  ) {
    console.log('[Worker] Using cached bundle')
    return cachedBundlePath
  }

  // Bundle the Remotion project
  const entryPoint = path.join(process.cwd(), 'remotion', 'index.ts')

  console.log('[Worker] Bundling Remotion project (version', BUNDLE_VERSION, ')...')
  cachedBundlePath = await bundle({
    entryPoint,
    webpackOverride: (config) => config,
  })
  bundleTimestamp = now
  lastBundleVersion = BUNDLE_VERSION
  console.log('[Worker] Bundle created at:', cachedBundlePath)

  return cachedBundlePath
}

async function updateJobStatus(
  jobId: string,
  status: string,
  updates: Record<string, unknown> = {}
) {
  // Type assertion needed - render_jobs table not in generated types
  const { error } = await (getSupabase()
    .from('render_jobs') as any)
    .update({
      status,
      ...updates,
      ...(status === 'processing' ? { started_at: new Date().toISOString() } : {}),
      ...(status === 'completed' || status === 'failed' ? { completed_at: new Date().toISOString() } : {}),
    })
    .eq('id', jobId)

  if (error) {
    console.error('[Worker] Failed to update job status:', error)
  }
}

async function updateJobProgress(jobId: string, progress: number) {
  const { error } = await (getSupabase()
    .from('render_jobs') as any)
    .update({ progress })
    .eq('id', jobId)

  if (error) {
    console.error('[Worker] Failed to update job progress:', error)
  }
}

async function recordRenderHistory(userId: string, tokenSymbol?: string, pnlPercent?: number) {
  // Note: renders_this_month is now incremented at render START time in /api/render/start
  // This function only records the render in the history table

  // Record render in history (type assertion - renders table not in generated types)
  const { error: insertError } = await (getSupabase()
    .from('renders') as any).insert({
    user_id: userId,
    token_symbol: tokenSymbol || null,
    pnl_percent: pnlPercent || null,
  })

  if (insertError) {
    console.error('[Worker] Failed to record render:', insertError)
  }
}

export async function processRenderJob(job: Job<RenderJobData>): Promise<RenderJobResult> {
  const { jobId, userId, inputData } = job.data
  const { candles, entryMarker, exitMarker, speed, tokenSymbol, startIndex, endIndex, isPro } = inputData

  const startTime = Date.now()

  console.log(`[Worker] Processing job ${jobId} for user ${userId}`)
  console.log(`[Worker] Candles: ${candles.length}, Speed: ${speed}x`)

  try {
    // Update status to processing
    await updateJobStatus(jobId, 'processing')

    // Calculate video duration
    const fps = 30
    const BASE_INTERVAL_MS = 200
    const msPerCandle = BASE_INTERVAL_MS / speed
    const framesPerCandle = Math.max(1, Math.round(msPerCandle / (1000 / fps)))
    const candlesToPlay = endIndex - startIndex + 1
    const durationInFrames = candlesToPlay * framesPerCandle

    console.log(`[Worker] Duration: ${durationInFrames} frames (${(durationInFrames / fps).toFixed(1)}s)`)

    // Get or create bundle
    const bundlePath = await getBundlePath()

    // Select the composition
    const composition = await selectComposition({
      serveUrl: bundlePath,
      id: 'ChartReplay',
      inputProps: {
        candles,
        entryMarker,
        exitMarker,
        speed,
        startIndex,
        tokenSymbol: tokenSymbol || '',
        isPro,
      },
    })

    // Override duration
    const compositionWithDuration = {
      ...composition,
      durationInFrames,
    }

    // Create temp output path
    const tempDir = os.tmpdir()
    const outputPath = path.join(tempDir, `render-${jobId}.mp4`)

    console.log(`[Worker] Rendering to: ${outputPath}`)

    // Render the video with progress updates
    await renderMedia({
      composition: compositionWithDuration,
      serveUrl: bundlePath,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: {
        candles,
        entryMarker,
        exitMarker,
        speed,
        startIndex,
        tokenSymbol: tokenSymbol || '',
        isPro,
      },
      onProgress: async ({ progress }) => {
        const progressPercent = Math.round(progress * 100)

        // Update BullMQ job progress
        await job.updateProgress(progressPercent)

        // Update database progress (throttled to every 10%)
        if (progressPercent % 10 === 0) {
          await updateJobProgress(jobId, progressPercent)
        }

        if (progressPercent % 25 === 0) {
          console.log(`[Worker] Job ${jobId}: ${progressPercent}%`)
        }
      },
    })

    const renderDurationMs = Date.now() - startTime
    console.log(`[Worker] Job ${jobId} completed in ${(renderDurationMs / 1000).toFixed(1)}s`)

    // Update job as completed with file path
    await updateJobStatus(jobId, 'completed', {
      temp_file_path: outputPath,
      progress: 100,
    })

    // Calculate PnL for tracking
    const pnlPercent = entryMarker && exitMarker && entryMarker.price > 0
      ? ((exitMarker.price - entryMarker.price) / entryMarker.price) * 100
      : undefined

    // Record render in history table (count already incremented at start time)
    await recordRenderHistory(userId, tokenSymbol, pnlPercent)

    return {
      tempFilePath: outputPath,
      renderDurationMs,
    }

  } catch (error) {
    console.error(`[Worker] Job ${jobId} failed:`, error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Update job as failed
    await updateJobStatus(jobId, 'failed', {
      error_message: errorMessage,
      attempts: job.attemptsMade + 1,
    })

    throw error // Re-throw to let BullMQ handle retries
  }
}
