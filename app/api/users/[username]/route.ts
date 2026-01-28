/**
 * Public User Profile API
 *
 * Security:
 * - Rate limited
 * - Only returns public information
 * - No sensitive data (email, stripe IDs, etc.)
 * - Input validation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limit'

// Username validation (alphanumeric, underscores, 3-30 chars)
const usernameSchema = z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/)

interface RouteParams {
  params: Promise<{ username: string }>
}

// GET /api/users/[username] - Get public profile
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { username } = await params

    // Validate username format
    const usernameResult = usernameSchema.safeParse(username)
    if (!usernameResult.success) {
      return NextResponse.json(
        { error: 'Invalid username format' },
        { status: 400 }
      )
    }

    // Rate limiting
    const identifier = request.headers.get('x-forwarded-for') || 'anonymous'
    const rateLimitKey = getRateLimitKey('api', identifier)
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.api)

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const supabase = await createClient()

    // Fetch user profile (only public fields)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, created_at')
      .eq('username', username)
      .eq('is_banned', false) // Don't show banned users
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch user's public trades (for stats calculation)
    const { data: publicTrades, error: tradesError } = await supabase
      .from('trades')
      .select('id, token_symbol, pnl_percent, created_at')
      .eq('user_id', profile.id)
      .eq('is_public', true)
      .order('pnl_percent', { ascending: false })
      .limit(50)

    if (tradesError) {
      console.error('Fetch user trades error:', tradesError)
    }

    const trades = publicTrades || []

    // Calculate stats from public trades only
    const stats = {
      totalPublicTrades: trades.length,
      bestTrade: trades.length > 0 ? Math.max(...trades.map(t => t.pnl_percent || 0)) : null,
      avgGain: trades.length > 0
        ? trades.reduce((sum, t) => sum + (t.pnl_percent || 0), 0) / trades.length
        : null,
      winRate: trades.length > 0
        ? (trades.filter(t => (t.pnl_percent || 0) > 0).length / trades.length) * 100
        : null,
    }

    return NextResponse.json({
      profile: {
        username: profile.username,
        avatarUrl: profile.avatar_url,
        joinedAt: profile.created_at,
      },
      stats,
      trades: trades.map(t => ({
        id: t.id,
        tokenSymbol: t.token_symbol,
        pnlPercent: t.pnl_percent,
        createdAt: t.created_at,
      })),
    })
  } catch (error) {
    console.error('User profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
