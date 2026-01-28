/**
 * Admin Single User API - View and Update
 *
 * Security:
 * - Requires admin authentication
 * - Rate limited
 * - Input validation
 * - Audit logging for sensitive actions
 * - Prevents self-demotion/ban
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyAdmin, logAdminAction } from '@/lib/admin'
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limit'
import { z } from 'zod'

// UUID validation
const uuidSchema = z.string().uuid()

// Update user schema
const updateUserSchema = z.object({
  rendersThisMonth: z.number().min(0).max(10000).optional(),
  isBanned: z.boolean().optional(),
  isAdmin: z.boolean().optional(),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/admin/users/[id] - Get user details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Validate user ID
    const idResult = uuidSchema.safeParse(id)
    if (!idResult.success) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      )
    }

    // Verify admin access
    const adminCheck = await verifyAdmin()
    if (!adminCheck.authorized) {
      return adminCheck.response
    }

    // Rate limiting
    const rateLimitKey = getRateLimitKey('api', adminCheck.userId!)
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.api)

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const supabase = await createClient()

    // Fetch user profile
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email, username, avatar_url, subscription_status, renders_this_month, renders_reset_at, is_banned, is_admin, created_at, updated_at')
      .eq('id', id)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch user's render count
    const { count: renderCount } = await supabase
      .from('renders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', id)

    // Fetch user's trade count
    const { count: tradeCount } = await supabase
      .from('trades')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', id)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatar_url,
        subscriptionStatus: user.subscription_status || 'free',
        rendersThisMonth: user.renders_this_month || 0,
        rendersResetAt: user.renders_reset_at,
        isBanned: user.is_banned || false,
        isAdmin: user.is_admin || false,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
      stats: {
        totalRenders: renderCount || 0,
        totalTrades: tradeCount || 0,
      },
    })
  } catch (error) {
    console.error('Admin user detail error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/users/[id] - Update user
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Validate user ID
    const idResult = uuidSchema.safeParse(id)
    if (!idResult.success) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      )
    }

    // Verify admin access
    const adminCheck = await verifyAdmin()
    if (!adminCheck.authorized) {
      return adminCheck.response
    }

    // Rate limiting
    const rateLimitKey = getRateLimitKey('api', adminCheck.userId!)
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.api)

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Security: Prevent admin from modifying themselves (to avoid accidental self-demotion/ban)
    if (id === adminCheck.userId) {
      return NextResponse.json(
        { error: 'Cannot modify your own account through admin panel' },
        { status: 403 }
      )
    }

    // Parse request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    const parseResult = updateUserSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const updates = parseResult.data
    const supabase = await createClient()

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('profiles')
      .select('id, is_admin')
      .eq('id', id)
      .single()

    if (fetchError || !existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Build update object
    const updateData: Record<string, unknown> = {}

    if (updates.rendersThisMonth !== undefined) {
      updateData.renders_this_month = updates.rendersThisMonth
    }

    if (updates.isBanned !== undefined) {
      updateData.is_banned = updates.isBanned
    }

    if (updates.isAdmin !== undefined) {
      updateData.is_admin = updates.isAdmin
    }

    // Perform update
    const { data: updatedUser, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select('id, email, username, subscription_status, renders_this_month, is_banned, is_admin')
      .single()

    if (updateError) {
      console.error('Admin user update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      )
    }

    // Audit log
    await logAdminAction(
      adminCheck.userId!,
      'UPDATE_USER',
      'user',
      id,
      { updates, previousAdmin: existingUser.is_admin }
    )

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        subscriptionStatus: updatedUser.subscription_status || 'free',
        rendersThisMonth: updatedUser.renders_this_month || 0,
        isBanned: updatedUser.is_banned || false,
        isAdmin: updatedUser.is_admin || false,
      },
      message: 'User updated successfully',
    })
  } catch (error) {
    console.error('Admin user update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
