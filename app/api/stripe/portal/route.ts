/**
 * Stripe Billing Portal API
 * Creates a portal session for subscription management
 *
 * Security:
 * - Validates user session
 * - Verifies user has a Stripe customer ID
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, createBillingPortalSession } from '@/lib/stripe'

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

    // Get user profile with Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, is_banned')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Security: Banned users cannot access portal
    if (profile.is_banned) {
      return NextResponse.json(
        { error: 'Account suspended' },
        { status: 403 }
      )
    }

    // Must have a customer ID to access portal
    if (!profile.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No billing history found' },
        { status: 400 }
      )
    }

    // Get base URL for redirect
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL

    // Create billing portal session
    const session = await createBillingPortalSession(
      profile.stripe_customer_id,
      `${origin}/dashboard`
    )

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Portal error:', error)

    // Handle specific Stripe errors
    if (error instanceof stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}
