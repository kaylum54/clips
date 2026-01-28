/**
 * Stripe Checkout API
 * Creates a checkout session for subscription upgrade
 *
 * Security:
 * - Validates user session
 * - Rate limited to prevent abuse
 * - Server-side customer creation
 * - Stores customer ID in database for audit trail
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  stripe,
  STRIPE_PRICES,
  getOrCreateCustomer,
  createCheckoutSession,
} from '@/lib/stripe'
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limit'

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

    // Rate limiting - prevent checkout abuse
    const rateLimitKey = getRateLimitKey('checkout', user.id)
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.checkout)

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

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, subscription_status, is_banned, email')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Security: Banned users cannot subscribe
    if (profile.is_banned) {
      return NextResponse.json(
        { error: 'Account suspended' },
        { status: 403 }
      )
    }

    // Security: Already subscribed users should use portal
    if (profile.subscription_status === 'active') {
      return NextResponse.json(
        { error: 'Already subscribed. Use billing portal to manage subscription.' },
        { status: 400 }
      )
    }

    // Validate price ID is configured
    if (!STRIPE_PRICES.PRO_MONTHLY) {
      console.error('STRIPE_PRICE_PRO_MONTHLY not configured')
      return NextResponse.json(
        { error: 'Subscription not available' },
        { status: 503 }
      )
    }

    // Get or create Stripe customer
    const email = profile.email || user.email
    if (!email) {
      return NextResponse.json(
        { error: 'Email required for subscription' },
        { status: 400 }
      )
    }

    const customerId = await getOrCreateCustomer(
      user.id,
      email,
      profile.stripe_customer_id
    )

    // Store customer ID if new
    if (!profile.stripe_customer_id) {
      const adminClient = createAdminClient()
      await adminClient
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // Get base URL for redirects
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL

    // Create checkout session
    const session = await createCheckoutSession(
      customerId,
      STRIPE_PRICES.PRO_MONTHLY,
      `${origin}/dashboard?checkout=success`,
      `${origin}/dashboard?checkout=cancelled`,
      user.id
    )

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)

    // Handle specific Stripe errors
    if (error instanceof stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
