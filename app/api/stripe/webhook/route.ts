/**
 * Stripe Webhook Handler
 * Handles subscription lifecycle events from Stripe
 *
 * Security:
 * - Validates webhook signature using STRIPE_WEBHOOK_SECRET
 * - Uses admin client to bypass RLS for updates
 * - Idempotent handling of events
 * - Logs all events for audit trail
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe, SUBSCRIPTION_STATUS_MAP } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

// Disable body parsing - we need raw body for signature verification
export const runtime = 'nodejs'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 }
    )
  }

  // Get raw body for signature verification
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    console.error('Missing stripe-signature header')
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  // Security: Verify webhook signature
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const error = err as Error
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  const adminClient = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === 'subscription' && session.subscription) {
          const userId = session.metadata?.supabase_user_id
          const customerId = session.customer as string
          const subscriptionId = session.subscription as string

          if (!userId) {
            console.error('Missing supabase_user_id in checkout session metadata')
            break
          }

          // Fetch subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)

          // Update user profile
          const { error } = await adminClient
            .from('profiles')
            .update({
              stripe_customer_id: customerId,
              subscription_id: subscriptionId,
              subscription_status: SUBSCRIPTION_STATUS_MAP[subscription.status] || subscription.status,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId)

          if (error) {
            console.error('Failed to update profile after checkout:', error)
          } else {
            console.log(`Subscription activated for user ${userId}`)
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.supabase_user_id

        if (!userId) {
          // Try to find user by customer ID
          const customerId = subscription.customer as string
          const { data: profile } = await adminClient
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (profile) {
            const { error } = await adminClient
              .from('profiles')
              .update({
                subscription_status: SUBSCRIPTION_STATUS_MAP[subscription.status] || subscription.status,
                updated_at: new Date().toISOString(),
              })
              .eq('id', profile.id)

            if (error) {
              console.error('Failed to update subscription status:', error)
            } else {
              console.log(`Subscription updated for user ${profile.id}: ${subscription.status}`)
            }
          }
        } else {
          const { error } = await adminClient
            .from('profiles')
            .update({
              subscription_status: SUBSCRIPTION_STATUS_MAP[subscription.status] || subscription.status,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId)

          if (error) {
            console.error('Failed to update subscription status:', error)
          } else {
            console.log(`Subscription updated for user ${userId}: ${subscription.status}`)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by customer ID
        const { data: profile } = await adminClient
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile) {
          const { error } = await adminClient
            .from('profiles')
            .update({
              subscription_status: 'cancelled',
              subscription_id: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id)

          if (error) {
            console.error('Failed to cancel subscription:', error)
          } else {
            console.log(`Subscription cancelled for user ${profile.id}`)
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Find user and update status
        const { data: profile } = await adminClient
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile) {
          const { error } = await adminClient
            .from('profiles')
            .update({
              subscription_status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id)

          if (error) {
            console.error('Failed to update payment failed status:', error)
          } else {
            console.log(`Payment failed for user ${profile.id}`)
          }
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Find user and ensure status is active
        const { data: profile } = await adminClient
          .from('profiles')
          .select('id, subscription_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile && profile.subscription_id) {
          const { error } = await adminClient
            .from('profiles')
            .update({
              subscription_status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id)

          if (error) {
            console.error('Failed to update payment success status:', error)
          } else {
            console.log(`Payment succeeded for user ${profile.id}`)
          }
        }
        break
      }

      default:
        // Log unhandled events for monitoring
        console.log(`Unhandled webhook event: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
