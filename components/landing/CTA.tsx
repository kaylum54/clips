'use client'

/**
 * Final CTA Section
 * Bottom call-to-action before footer
 */

import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

export function CTA() {
  const { user } = useAuth()

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-green-500/5 to-transparent" />

      {/* Glow orbs */}
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-[100px]" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">
          Ready to share your wins?
        </h2>

        <Link
          href={user ? '/dashboard' : '/dashboard'}
          className="inline-flex items-center gap-2 px-8 py-4 bg-green-500 hover:bg-[#16a34a] text-black font-semibold text-lg rounded-lg transition-all hover:-translate-y-0.5"
        >
          Create Your First Clip
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>

        <p className="mt-6 text-sm text-[#71717a]">
          Free forever • No signup required
        </p>
      </div>
    </section>
  )
}
