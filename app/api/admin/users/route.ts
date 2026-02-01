/**
 * Admin Users API - List and Search
 *
 * Security:
 * - Requires admin authentication
 * - Rate limited
 * - Input validation
 * - Pagination limits
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdmin } from '@/lib/admin'
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limit'
import { z } from 'zod'

// Query params validation
const querySchema = z.object({
  search: z.string().max(100).optional(),
  status: z.enum(['all', 'free', 'pro', 'banned']).default('all'),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  sortBy: z.enum(['created_at', 'renders_this_month', 'username']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// GET /api/admin/users - List users
export async function GET(request: NextRequest) {
  try {
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

    // Parse and validate query params
    const { searchParams } = new URL(request.url)
    const parseResult = querySchema.safeParse({
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: searchParams.get('sortOrder') || undefined,
    })

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const { search, status, limit, offset, sortBy, sortOrder } = parseResult.data

    const supabase = createAdminClient()

    // Build query - select only necessary fields (no sensitive data like stripe_customer_id)
    let query = supabase
      .from('profiles')
      .select(
        'id, email, username, avatar_url, subscription_status, renders_this_month, renders_reset_at, is_banned, is_admin, created_at',
        { count: 'exact' }
      )

    // Apply status filter
    switch (status) {
      case 'free':
        query = query.or('subscription_status.is.null,subscription_status.neq.active')
        break
      case 'pro':
        query = query.eq('subscription_status', 'active')
        break
      case 'banned':
        query = query.eq('is_banned', true)
        break
      // 'all' - no filter
    }

    // Apply search filter (username or email)
    // Security: Escape PostgREST special characters to prevent filter injection
    if (search) {
      const sanitized = search.replace(/[%_*\\]/g, '\\$&')
      query = query.or(`username.ilike.%${sanitized}%,email.ilike.%${sanitized}%`)
    }

    // Apply sorting and pagination
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    const { data: users, error, count } = await query

    if (error) {
      console.error('Admin users query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    // Transform users to safe response format
    const safeUsers = (users || []).map((user) => ({
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
    }))

    return NextResponse.json({
      users: safeUsers,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    })
  } catch (error) {
    console.error('Admin users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
