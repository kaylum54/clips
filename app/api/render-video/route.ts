/**
 * Video Render API
 *
 * Security:
 * - Requires authentication
 * - Rate limited to prevent abuse
 * - Enforces render limits for free users
 * - Input validation
 */

import { NextRequest, NextResponse } from 'next/server'
import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'
import path from 'path'
import fs from 'fs'
import os from 'os'
import type { Candle, TradeMarker } from '@/types'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limit'

const FREE_RENDER_LIMIT = 5

interface RenderRequest {
  candles: Candle[]
  entryMarker: TradeMarker | null
  exitMarker: TradeMarker | null
  speed: number
  tokenSymbol?: string
  startIndex: number // Where playhead starts (entry)
  endIndex: number   // Where playhead ends (exit + buffer)
  trackRender?: boolean // Whether to track this render against quota
}

// Cache the bundle path to avoid re-bundling on every request
let cachedBundlePath: string | null = null
let bundleTimestamp: number = 0
const BUNDLE_CACHE_TTL = 1000 * 60 * 5 // 5 minutes (reduced for development)

// Force rebuild on code changes - increment this when composition code changes
const BUNDLE_VERSION = 7

let lastBundleVersion = 0

async function getBundlePath(): Promise<string> {
  const now = Date.now()

  // Return cached bundle if still valid and version matches
  if (
    cachedBundlePath &&
    fs.existsSync(cachedBundlePath) &&
    now - bundleTimestamp < BUNDLE_CACHE_TTL &&
    lastBundleVersion === BUNDLE_VERSION
  ) {
    console.log('Using cached bundle')
    return cachedBundlePath
  }

  // Bundle the Remotion project
  const entryPoint = path.join(process.cwd(), 'remotion', 'index.ts')

  console.log('Bundling Remotion project (version', BUNDLE_VERSION, ')...')
  cachedBundlePath = await bundle({
    entryPoint,
    // Use webpack config overrides if needed
    webpackOverride: (config) => config,
  })
  bundleTimestamp = now
  lastBundleVersion = BUNDLE_VERSION
  console.log('Bundle created at:', cachedBundlePath)

  return cachedBundlePath
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Security: Require authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to render videos.' },
        { status: 401 }
      )
    }

    // Rate limiting - prevent render abuse (more strict than general render tracking)
    const rateLimitKey = getRateLimitKey('render-video', user.id)
    const rateLimit = checkRateLimit(rateLimitKey, { maxRequests: 5, windowMs: 60000 }) // 5 per minute

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many render requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Check user profile and render limits
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_status, renders_this_month, is_banned, is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Security: Banned users cannot render
    if (profile.is_banned) {
      return NextResponse.json(
        { error: 'Account suspended' },
        { status: 403 }
      )
    }

    const isPro = profile.subscription_status === 'active' || profile.is_admin === true
    const rendersThisMonth = profile.renders_this_month ?? 0

    // Security: Enforce render limits for free users
    if (!isPro && rendersThisMonth >= FREE_RENDER_LIMIT) {
      return NextResponse.json(
        {
          error: 'Render limit reached. Upgrade to Pro for unlimited renders.',
          limitReached: true,
          rendersThisMonth,
          renderLimit: FREE_RENDER_LIMIT,
        },
        { status: 403 }
      )
    }

    const body: RenderRequest = await request.json()
    const { candles, entryMarker, exitMarker, speed, tokenSymbol, startIndex, endIndex, trackRender = true } = body

    // Validate input
    if (!candles || !Array.isArray(candles) || candles.length === 0) {
      return NextResponse.json(
        { error: 'Invalid candles data' },
        { status: 400 }
      )
    }

    // Security: Limit candle count to prevent memory exhaustion
    if (candles.length > 1000) {
      return NextResponse.json(
        { error: 'Too many candles. Maximum 1000 allowed.' },
        { status: 400 }
      )
    }

    if (!speed || speed <= 0 || speed > 10) {
      return NextResponse.json(
        { error: 'Invalid speed value. Must be between 0 and 10.' },
        { status: 400 }
      )
    }

    if (startIndex === undefined || endIndex === undefined) {
      return NextResponse.json(
        { error: 'Missing startIndex or endIndex' },
        { status: 400 }
      )
    }

    // Security: Validate index bounds
    if (startIndex < 0 || endIndex < 0 || startIndex > candles.length || endIndex > candles.length) {
      return NextResponse.json(
        { error: 'Invalid startIndex or endIndex' },
        { status: 400 }
      )
    }

    // Calculate duration based on playhead movement from startIndex to endIndex
    const fps = 30
    const BASE_INTERVAL_MS = 200 // Must match remotion/compositions/ChartReplay.tsx
    const msPerCandle = BASE_INTERVAL_MS / speed
    const framesPerCandle = Math.max(1, Math.round(msPerCandle / (1000 / fps)))
    const candlesToPlay = endIndex - startIndex + 1
    const durationInFrames = candlesToPlay * framesPerCandle

    console.log('=== VIDEO RENDER DEBUG ===')
    console.log(`Total candles received: ${candles.length}`)
    console.log(`Entry marker index: ${entryMarker?.candleIndex}`)
    console.log(`Exit marker index: ${exitMarker?.candleIndex}`)
    console.log(`startIndex: ${startIndex}, endIndex: ${endIndex}`)
    console.log(`Speed: ${speed}x`)
    console.log(`msPerCandle: ${msPerCandle}ms`)
    console.log(`framesPerCandle: ${framesPerCandle}`)
    console.log(`candlesToPlay: ${candlesToPlay}`)
    console.log(`durationInFrames: ${durationInFrames} (${(durationInFrames / fps).toFixed(1)}s)`)
    console.log('==========================')

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

    // Override duration based on actual candle count
    const compositionWithDuration = {
      ...composition,
      durationInFrames,
    }

    // Create temp output path
    const tempDir = os.tmpdir()
    const outputPath = path.join(tempDir, `${tokenSymbol || 'chart'}-replay-${Date.now()}.mp4`)

    console.log('Starting render to:', outputPath)

    // Render the video
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
      onProgress: ({ progress }) => {
        if (progress % 0.1 < 0.01) {
          console.log(`Render progress: ${(progress * 100).toFixed(0)}%`)
        }
      },
    })

    console.log('Render complete!')

    // Track the render against user's quota (if trackRender is true)
    if (trackRender) {
      const renderEndTime = Date.now()

      // Increment render count
      await supabase.rpc('increment_render_count', { user_uuid: user.id })

      // Record render in history
      await supabase.from('renders').insert({
        user_id: user.id,
        token_symbol: tokenSymbol || null,
        pnl_percent: entryMarker && exitMarker
          ? ((exitMarker.price - entryMarker.price) / entryMarker.price) * 100
          : null,
        render_duration_ms: renderEndTime - (Date.now() - durationInFrames * 33), // Approximate
      })
    }

    // Read the file and return it
    const videoBuffer = fs.readFileSync(outputPath)

    // Clean up temp file
    fs.unlinkSync(outputPath)

    // Return video as download
    return new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${tokenSymbol || 'chart'}-replay.mp4"`,
        'Content-Length': videoBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Video render error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to render video' },
      { status: 500 }
    )
  }
}
