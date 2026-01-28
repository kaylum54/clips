/**
 * Admin Stats API
 *
 * Security:
 * - Requires admin authentication
 * - Rate limited
 * - No sensitive data exposure
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/admin'
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limit'

// GET /api/admin/stats - Get dashboard statistics
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

    const supabase = await createClient()

    // Get current date boundaries
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now)
    startOfWeek.setDate(startOfWeek.getDate() - 7)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Fetch all stats in parallel
    const [
      totalUsersResult,
      proUsersResult,
      rendersToday,
      rendersWeek,
      rendersMonth,
      totalTradesResult,
      publicTradesResult,
      recentSignups,
    ] = await Promise.all([
      // Total users
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true }),

      // Pro users (active subscriptions)
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('subscription_status', 'active'),

      // Renders today
      supabase
        .from('renders')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfToday.toISOString()),

      // Renders this week
      supabase
        .from('renders')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfWeek.toISOString()),

      // Renders this month
      supabase
        .from('renders')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString()),

      // Total trades
      supabase
        .from('trades')
        .select('id', { count: 'exact', head: true }),

      // Public trades
      supabase
        .from('trades')
        .select('id', { count: 'exact', head: true })
        .eq('is_public', true),

      // Recent signups (last 7 days)
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfWeek.toISOString()),
    ])

    const totalUsers = totalUsersResult.count || 0
    const proUsers = proUsersResult.count || 0
    const freeUsers = totalUsers - proUsers

    // Calculate conversion rate
    const conversionRate = totalUsers > 0 ? (proUsers / totalUsers) * 100 : 0

    // Calculate MRR (Pro users * $20/month)
    const mrr = proUsers * 20

    return NextResponse.json({
      users: {
        total: totalUsers,
        free: freeUsers,
        pro: proUsers,
        recentSignups: recentSignups.count || 0,
      },
      revenue: {
        mrr,
        conversionRate: conversionRate.toFixed(2),
      },
      renders: {
        today: rendersToday.count || 0,
        week: rendersWeek.count || 0,
        month: rendersMonth.count || 0,
      },
      trades: {
        total: totalTradesResult.count || 0,
        public: publicTradesResult.count || 0,
      },
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
