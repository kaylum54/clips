/**
 * Start Render Job API
 *
 * Adds a render job to the queue for async processing.
 * Returns immediately with a job ID for status polling.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRenderRateLimit } from '@/lib/rate-limit-redis'
import { addRenderJob, getQueuePosition } from '@/lib/queue/render-queue'
import type { RenderJobInput } from '@/lib/queue/types'
import type { Candle } from '@/types'

const FREE_RENDER_LIMIT = 5

interface StartRenderRequest {
  candles: Candle[]
  entryMarker: {
    candleIndex: number
    price: number
    time: number
  }
  exitMarker: {
    candleIndex: number
    price: number
    time: number
  }
  speed: number
  tokenSymbol?: string
  startIndex: number
  endIndex: number
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Require authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to render videos.' },
        { status: 401 }
      )
    }

    // Rate limiting with Redis
    const rateLimit = await checkRenderRateLimit(user.id)

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: 'Too many render requests. Please try again later.',
          remaining: rateLimit.remaining,
          resetTime: rateLimit.resetTime,
        },
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

    // Banned users cannot render
    if (profile.is_banned) {
      return NextResponse.json(
        { error: 'Account suspended' },
        { status: 403 }
      )
    }

    const isPro = profile.subscription_status === 'active' || profile.is_admin === true
    const rendersThisMonth = profile.renders_this_month ?? 0

    // Enforce render limits for free users
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

    // Parse and validate request body
    const body: StartRenderRequest = await request.json()
    const { candles, entryMarker, exitMarker, speed, tokenSymbol, startIndex, endIndex } = body

    // Validate candles
    if (!candles || !Array.isArray(candles) || candles.length === 0) {
      return NextResponse.json(
        { error: 'Invalid candles data' },
        { status: 400 }
      )
    }

    if (candles.length > 1000) {
      return NextResponse.json(
        { error: 'Too many candles. Maximum 1000 allowed.' },
        { status: 400 }
      )
    }

    // Validate markers
    if (!entryMarker || !exitMarker) {
      return NextResponse.json(
        { error: 'Missing entry or exit marker' },
        { status: 400 }
      )
    }

    // Validate speed
    if (!speed || speed <= 0 || speed > 10) {
      return NextResponse.json(
        { error: 'Invalid speed value. Must be between 0 and 10.' },
        { status: 400 }
      )
    }

    // Validate indices
    if (startIndex === undefined || endIndex === undefined) {
      return NextResponse.json(
        { error: 'Missing startIndex or endIndex' },
        { status: 400 }
      )
    }

    if (startIndex < 0 || endIndex < 0 || startIndex > candles.length || endIndex > candles.length) {
      return NextResponse.json(
        { error: 'Invalid startIndex or endIndex' },
        { status: 400 }
      )
    }

    // Create job input data
    const inputData: RenderJobInput = {
      candles,
      entryMarker,
      exitMarker,
      speed,
      tokenSymbol,
      startIndex,
      endIndex,
      isPro,
    }

    // Insert job into database using admin client
    const adminSupabase = createAdminClient()

    // Use type assertion for render_jobs table (not in generated types yet)
    const { data: job, error: insertError } = await (adminSupabase
      .from('render_jobs' as any) as any)
      .insert({
        user_id: user.id,
        status: 'pending',
        progress: 0,
        input_data: inputData,
      })
      .select('id')
      .single()

    if (insertError || !job) {
      console.error('Failed to create render job:', insertError)
      return NextResponse.json(
        { error: 'Failed to create render job' },
        { status: 500 }
      )
    }

    // Add job to BullMQ queue (Pro users get priority)
    try {
      await addRenderJob(
        {
          jobId: job.id,
          userId: user.id,
          inputData,
        },
        { isPro }
      )
    } catch (queueError) {
      console.error('Failed to add job to queue:', queueError)

      // Clean up the database record
      await (adminSupabase
        .from('render_jobs' as any) as any)
        .delete()
        .eq('id', job.id)

      return NextResponse.json(
        { error: 'Failed to queue render job. Please try again.' },
        { status: 500 }
      )
    }

    // Get queue position for user feedback
    const position = await getQueuePosition(job.id)

    // Estimate wait time (rough calculation)
    const estimatedSecondsPerJob = 45
    const estimatedWaitSeconds = position * estimatedSecondsPerJob

    return NextResponse.json({
      success: true,
      jobId: job.id,
      status: 'pending',
      position,
      estimatedWaitSeconds,
      isPro,
      message: position > 0
        ? isPro
          ? `Your video is #${position} in the priority queue. Estimated wait: ${Math.ceil(estimatedWaitSeconds / 60)} minutes.`
          : `Your video is #${position} in the queue. Estimated wait: ${Math.ceil(estimatedWaitSeconds / 60)} minutes.`
        : isPro
          ? 'Your video is being processed now with priority.'
          : 'Your video is being processed now.',
    })

  } catch (error) {
    console.error('Start render error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
