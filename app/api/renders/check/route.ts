/**
 * Render Check API
 * Checks if user can perform a render based on their subscription and usage
 *
 * Security: Validates user session, checks limits server-side
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const FREE_RENDER_LIMIT = 5

export async function GET() {
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

    // Get user profile with subscription info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_status, renders_this_month, renders_reset_at, is_banned, is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Check if user is banned
    if (profile.is_banned) {
      return NextResponse.json(
        { error: 'Account suspended' },
        { status: 403 }
      )
    }

    const isPro = profile.subscription_status === 'active' || profile.is_admin === true
    const rendersThisMonth = profile.renders_this_month ?? 0
    const canRender = isPro || rendersThisMonth < FREE_RENDER_LIMIT

    return NextResponse.json({
      canRender,
      isPro,
      rendersThisMonth,
      renderLimit: isPro ? null : FREE_RENDER_LIMIT,
      rendersRemaining: isPro ? null : Math.max(0, FREE_RENDER_LIMIT - rendersThisMonth),
    })
  } catch (error) {
    console.error('Render check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
