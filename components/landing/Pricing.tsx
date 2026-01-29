'use client'

/**
 * Pricing Section
 * Shows free and pro pricing tiers
 */

import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get started with 5 clips per month',
    features: [
      '5 video renders per month',
      '1080p video quality',
      'All chart timeframes',
      'Download your clips',
      'All Solana tokens supported',
    ],
    cta: 'Get Started',
    href: '/auth/signup',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$20',
    period: '/month',
    description: 'Unlimited clips. Priority rendering. No limits.',
    features: [
      'Unlimited video renders',
      'Priority render queue (skip the line)',
      'Save & organize your trades',
      'Public profile page',
      'Leaderboard eligibility',
      'Make trades public or private',
      'Priority support',
    ],
    cta: 'Upgrade to Pro',
    href: '/auth/signup',
    highlighted: true,
  },
]

export function Pricing() {
  const { user } = useAuth()

  return (
    <section id="pricing" className="py-24 bg-[#111111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Start Free. Upgrade When You&apos;re Addicted.
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-green-500/10 to-transparent border-2 border-green-500/30'
                  : 'bg-[#141414] border border-[#2a2a2a]'
              }`}
            >
              {/* Popular badge */}
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-green-500 text-black text-sm font-bold rounded-full">
                  Most Popular
                </div>
              )}

              {/* Plan name */}
              <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
              <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-gray-500">{plan.period}</span>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <svg
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        plan.highlighted ? 'text-green-400' : 'text-gray-500'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={user ? '/dashboard' : plan.href}
                className={`block w-full py-3 text-center font-semibold rounded-xl transition-colors ${
                  plan.highlighted
                    ? 'bg-green-500 hover:bg-green-600 text-black'
                    : 'bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white border border-[#2a2a2a]'
                }`}
              >
                {user ? 'Go to Dashboard' : plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-gray-500 text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secure payments via Stripe</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span>No credit card for free tier</span>
          </div>
        </div>
      </div>
    </section>
  )
}
