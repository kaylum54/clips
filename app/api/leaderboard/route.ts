/**
 * Leaderboard API
 *
 * Security:
 * - Rate limited (public endpoint)
 * - Input validation with Zod
 * - Only returns public trades
 * - No sensitive user data exposed
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limit'

// Validation schema for query parameters
const querySchema = z.object({
  period: z.enum(['all', 'month', 'week', 'today']).default('all'),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
})

// Calculate date threshold based on period
function getDateThreshold(period: string): Date | null {
  const now = new Date()

  switch (period) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate())
    case 'week':
      const weekAgo = new Date(now)
      weekAgo.setDate(weekAgo.getDate() - 7)
      return weekAgo
    case 'month':
      const monthAgo = new Date(now)
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return monthAgo
    case 'all':
    default:
      return null
  }
}

// GET /api/leaderboard - Get public leaderboard
export async function GET(request: NextRequest) {
  try {
    // Rate limiting using IP (public endpoint)
    const identifier = request.headers.get('x-forwarded-for') || 'anonymous'
    const rateLimitKey = getRateLimitKey('api', identifier)
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.api)

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url)
    const parseResult = querySchema.safeParse({
      period: searchParams.get('period'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const { period, limit, offset } = parseResult.data
    const dateThreshold = getDateThreshold(period)

    const supabase = await createClient()

    // Build query for public trades with positive PnL, joined with profiles
    let query = supabase
      .from('trades')
      .select(`
        id,
        token_symbol,
        pnl_percent,
        created_at,
        user_id,
        profiles!inner (
          username,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('is_public', true)
      .not('pnl_percent', 'is', null)
      .order('pnl_percent', { ascending: false })

    // Apply date filter if not "all time"
    if (dateThreshold) {
      query = query.gte('created_at', dateThreshold.toISOString())
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: trades, error, count } = await query

    if (error) {
      console.error('Leaderboard query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      )
    }

    // Transform data to leaderboard format (sanitize user data)
    const leaderboard = (trades || []).map((trade, index) => {
      const profile = trade.profiles as { username: string | null; avatar_url: string | null }
      return {
        rank: offset + index + 1,
        tradeId: trade.id,
        username: profile?.username || 'Anonymous',
        avatarUrl: profile?.avatar_url || null,
        tokenSymbol: trade.token_symbol || 'Unknown',
        pnlPercent: trade.pnl_percent,
        createdAt: trade.created_at,
      }
    })

    return NextResponse.json({
      leaderboard,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
      period,
    })
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
