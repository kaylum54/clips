/**
 * Trades API - List and Create
 *
 * Security:
 * - Requires authentication
 * - Rate limited
 * - Input validation with Zod
 * - RLS enforced at database level
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limit'

// Validation schema for creating a trade
const createTradeSchema = z.object({
  name: z.string().max(100).optional(),
  tokenAddress: z.string().min(32).max(44), // Solana address length
  tokenSymbol: z.string().max(20).optional(),
  entryHash: z.string().min(64).max(128), // Transaction signature
  exitHash: z.string().min(64).max(128),
  entryPrice: z.number().positive().optional(),
  exitPrice: z.number().positive().optional(),
  pnlPercent: z.number().min(-100).max(1000000).optional(),
  isPublic: z.boolean().default(false),
})

// GET /api/trades - List user's trades
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Require authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Rate limiting
    const rateLimitKey = getRateLimitKey('api', user.id)
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.api)

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? true : false

    // Validate sortBy to prevent SQL injection
    const allowedSortFields = ['created_at', 'pnl_percent', 'token_symbol', 'name']
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at'

    // Fetch user's trades
    const { data: trades, error, count } = await supabase
      .from('trades')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order(safeSortBy, { ascending: sortOrder })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Failed to fetch trades:', error)
      return NextResponse.json(
        { error: 'Failed to fetch trades' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      trades,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    })
  } catch (error) {
    console.error('Trades list error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/trades - Create a new trade
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Require authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Rate limiting
    const rateLimitKey = getRateLimitKey('api', user.id)
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.api)

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Check if user is banned
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_banned')
      .eq('id', user.id)
      .single()

    if (profile?.is_banned) {
      return NextResponse.json(
        { error: 'Account suspended' },
        { status: 403 }
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

    const parseResult = createTradeSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const {
      name,
      tokenAddress,
      tokenSymbol,
      entryHash,
      exitHash,
      entryPrice,
      exitPrice,
      pnlPercent,
      isPublic,
    } = parseResult.data

    // Check for duplicate trade (same entry and exit hash)
    const { data: existingTrade } = await supabase
      .from('trades')
      .select('id')
      .eq('user_id', user.id)
      .eq('entry_hash', entryHash)
      .eq('exit_hash', exitHash)
      .single()

    if (existingTrade) {
      return NextResponse.json(
        { error: 'This trade already exists', tradeId: existingTrade.id },
        { status: 409 }
      )
    }

    // Create the trade
    const { data: trade, error: insertError } = await supabase
      .from('trades')
      .insert({
        user_id: user.id,
        name: name || null,
        token_address: tokenAddress,
        token_symbol: tokenSymbol || null,
        entry_hash: entryHash,
        exit_hash: exitHash,
        entry_price: entryPrice ?? null,
        exit_price: exitPrice ?? null,
        pnl_percent: pnlPercent ?? null,
        is_public: isPublic,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Failed to create trade:', insertError)
      return NextResponse.json(
        { error: 'Failed to save trade' },
        { status: 500 }
      )
    }

    return NextResponse.json({ trade }, { status: 201 })
  } catch (error) {
    console.error('Trade creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
