/**
 * Single Trade API - Get, Update, Delete
 *
 * Security:
 * - Requires authentication
 * - Validates ownership (user can only access their own trades)
 * - Rate limited
 * - Input validation with Zod
 * - Public trades can be viewed by anyone
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limit'

// Validation schema for updating a trade
const updateTradeSchema = z.object({
  name: z.string().max(100).optional(),
  isPublic: z.boolean().optional(),
})

// Validate UUID format
const uuidSchema = z.string().uuid()

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/trades/[id] - Get single trade
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Validate trade ID format
    const idResult = uuidSchema.safeParse(id)
    if (!idResult.success) {
      return NextResponse.json(
        { error: 'Invalid trade ID format' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get current user (optional for public trades)
    const { data: { user } } = await supabase.auth.getUser()

    // Rate limiting (use IP for unauthenticated, user ID for authenticated)
    const identifier = user?.id || request.headers.get('x-forwarded-for') || 'anonymous'
    const rateLimitKey = getRateLimitKey('api', identifier)
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.api)

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Fetch the trade
    const { data: trade, error } = await supabase
      .from('trades')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !trade) {
      return NextResponse.json(
        { error: 'Trade not found' },
        { status: 404 }
      )
    }

    // Security: Check access permissions
    const isOwner = user?.id === trade.user_id
    const isPublic = trade.is_public

    if (!isOwner && !isPublic) {
      return NextResponse.json(
        { error: 'Trade not found' }, // Don't reveal that it exists
        { status: 404 }
      )
    }

    // Return trade with ownership flag
    return NextResponse.json({
      trade,
      isOwner,
    })
  } catch (error) {
    console.error('Get trade error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/trades/[id] - Update trade
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Validate trade ID format
    const idResult = uuidSchema.safeParse(id)
    if (!idResult.success) {
      return NextResponse.json(
        { error: 'Invalid trade ID format' },
        { status: 400 }
      )
    }

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

    const parseResult = updateTradeSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const updates = parseResult.data

    // Security: Only update if user owns the trade (RLS will also enforce this)
    const { data: trade, error: updateError } = await supabase
      .from('trades')
      .update({
        name: updates.name,
        is_public: updates.isPublic,
      })
      .eq('id', id)
      .eq('user_id', user.id) // Security: Ensure ownership
      .select()
      .single()

    if (updateError) {
      // Could be not found or permission denied
      return NextResponse.json(
        { error: 'Trade not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({ trade })
  } catch (error) {
    console.error('Update trade error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/trades/[id] - Delete trade
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Validate trade ID format
    const idResult = uuidSchema.safeParse(id)
    if (!idResult.success) {
      return NextResponse.json(
        { error: 'Invalid trade ID format' },
        { status: 400 }
      )
    }

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

    // Security: Only delete if user owns the trade (RLS will also enforce this)
    const { error: deleteError } = await supabase
      .from('trades')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id) // Security: Ensure ownership

    if (deleteError) {
      console.error('Delete trade error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete trade' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete trade error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
