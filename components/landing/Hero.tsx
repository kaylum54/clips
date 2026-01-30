'use client'

/**
 * Hero Section
 * Main landing page hero with headline, subheadline, CTA, and product preview
 */

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'motion/react'
import { useAuth } from '@/components/AuthProvider'
import { BrowserMockup } from './BrowserMockup'

export function Hero() {
  const { user } = useAuth()

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      {/* Background layers */}
      <div className="absolute inset-0 bg-[#0a0a0a]" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34, 197, 94, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 197, 94, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* MotionClips logo background feature */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ opacity: 0.07 }}>
        <Image
          src="/motionlogo1.png"
          alt=""
          width={700}
          height={700}
          className="w-[700px] h-auto"
        />
      </div>

      {/* Hero glow - centered behind hero area */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 40%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'glow-pulse 4s ease-in-out infinite',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-8">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-green-400 font-medium">Now live — chart replays for every Solana token</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
          Hit a 10x But Forgot to Record?
          <br />
          <span className="bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">
            We Got You.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-[#a1a1aa] max-w-2xl mx-auto mb-10">
          Create chart replay videos from your Solana trades in seconds. Watch the candles
          move, see your entry and exit, and share the clip that proves you nailed it.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            href={user ? '/dashboard' : '/auth/login'}
            className="w-full sm:w-auto px-8 py-4 bg-green-500 hover:bg-[#16a34a] text-black font-semibold text-lg rounded-lg transition-all hover:-translate-y-0.5"
          >
            {user ? 'Go to Dashboard' : 'Create Your First Clip'}
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-8 py-4 bg-[#1a1a1a] hover:bg-[#222222] text-white font-medium text-lg rounded-lg border border-[#333333] transition-colors"
          >
            See an Example
          </a>
        </div>

        {/* Hero Video - 3D Browser Mockup */}
        <div className="max-w-4xl mx-auto mb-8" style={{ perspective: '1000px' }}>
          <motion.div
            initial={{ opacity: 0, rotateX: 8, scale: 0.95 }}
            whileInView={{ opacity: 1, rotateX: 4, rotateY: -2, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <BrowserMockup url="clips.app/dashboard" animatedGlow>
              <div className="aspect-video bg-[#0a0a0a] overflow-hidden">
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                >
                  <source src="/Hero Clip.mp4" type="video/mp4" />
                </video>
              </div>
            </BrowserMockup>
          </motion.div>
        </div>

        {/* Trust Bar */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#71717a]">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Free to start — no credit card needed
          </span>
          <span className="hidden sm:inline text-[#3a3a3a]">•</span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Works with every Solana token
          </span>
          <span className="hidden sm:inline text-[#3a3a3a]">•</span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Renders in under 60 seconds
          </span>
        </div>
      </div>

    </section>
  )
}
