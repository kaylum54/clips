/**
 * Render Track API
 * Records a render and increments user's render count
 *
 * Security:
 * - Validates user session
 * - Rate limited to prevent abuse
 * - Server-side limit enforcement (double-check)
 * - Input validation with strict typing
 * - Uses database function for atomic increment
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limit'
import { FREE_RENDER_LIMIT } from '@/lib/constants'

// Input validation schema
const trackRenderSchema = z.object({
  tradeId: z.string().uuid().optional(),
  tokenSymbol: z.string().max(20).optional(),
  pnlPercent: z.number().min(-100).max(100000).optional(),
  renderDurationMs: z.number().int().positive().max(600000).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Rate limiting - prevent render abuse
    const rateLimitKey = getRateLimitKey('render', user.id)
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.render)

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
          },
        }
      )
    }

    // Parse and validate request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    const parseResult = trackRenderSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const { tradeId, tokenSymbol, pnlPercent, renderDurationMs } = parseResult.data

    // Get user profile to check limits
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

    // Security check: banned users cannot render
    if (profile.is_banned) {
      return NextResponse.json(
        { error: 'Account suspended' },
        { status: 403 }
      )
    }

    const isPro = profile.subscription_status === 'active' || profile.is_admin === true
    const rendersThisMonth = profile.renders_this_month ?? 0

    // Security check: enforce render limit server-side
    if (!isPro && rendersThisMonth >= FREE_RENDER_LIMIT) {
      return NextResponse.json(
        {
          error: 'Render limit reached',
          isPro: false,
          rendersThisMonth,
          renderLimit: FREE_RENDER_LIMIT,
        },
        { status: 403 }
      )
    }

    // Use database function to atomically increment render count
    const { error: incrementError } = await supabase.rpc('increment_render_count', {
      user_uuid: user.id,
    })

    if (incrementError) {
      console.error('Failed to increment render count:', incrementError)
      return NextResponse.json(
        { error: 'Failed to track render' },
        { status: 500 }
      )
    }

    // Record render in history
    const { data: render, error: renderError } = await supabase
      .from('renders')
      .insert({
        user_id: user.id,
        trade_id: tradeId || null,
        token_symbol: tokenSymbol || null,
        pnl_percent: pnlPercent ?? null,
        render_duration_ms: renderDurationMs ?? null,
      })
      .select()
      .single()

    if (renderError) {
      console.error('Failed to record render:', renderError)
      // Don't fail the request - the count was incremented
    }

    return NextResponse.json({
      success: true,
      renderId: render?.id,
      rendersThisMonth: rendersThisMonth + 1,
      rendersRemaining: isPro ? null : Math.max(0, FREE_RENDER_LIMIT - rendersThisMonth - 1),
    })
  } catch (error) {
    console.error('Render track error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
