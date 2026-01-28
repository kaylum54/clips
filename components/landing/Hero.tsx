'use client'

/**
 * Hero Section
 * Main landing page hero with headline, subheadline, CTA, and product preview
 */

import Link from 'next/link'
import Image from 'next/image'
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
          <span className="text-sm text-green-400 font-medium">Now supporting all Solana tokens</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
          Turn Your Trades Into
          <br />
          <span className="bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">
            Shareable Replays
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-[#a1a1aa] max-w-2xl mx-auto mb-10">
          Create professional chart replay clips from your Solana trades in seconds.
          Mark your entries and exits, watch the action unfold, and share your wins.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            href={user ? '/dashboard' : '/dashboard'}
            className="w-full sm:w-auto px-8 py-4 bg-green-500 hover:bg-[#16a34a] text-black font-semibold text-lg rounded-lg transition-all hover:-translate-y-0.5"
          >
            Create Your First Clip
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-8 py-4 bg-[#1a1a1a] hover:bg-[#222222] text-white font-medium text-lg rounded-lg border border-[#333333] transition-colors"
          >
            See How It Works
          </a>
        </div>

        {/* Hero Image - Browser Mockup */}
        <div className="max-w-4xl mx-auto mb-8">
          <BrowserMockup url="clips.app/dashboard">
            {/* Chart Preview */}
            <div className="aspect-video bg-[#0a0a0a] relative overflow-hidden">
              {/* Grid background */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px',
                }}
              />

              {/* Candles */}
              <div className="absolute inset-4 flex items-end justify-around gap-0.5">
                {generateCandles().map((candle, i) => (
                  <div key={i} className="flex flex-col items-center" style={{ height: '100%' }}>
                    {/* Wick */}
                    <div
                      className={`w-px ${candle.isGreen ? 'bg-green-500/40' : 'bg-red-500/40'}`}
                      style={{ height: `${candle.wickTop}%`, marginTop: 'auto' }}
                    />
                    {/* Body */}
                    <div
                      className={`w-full rounded-sm ${candle.isGreen ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ height: `${candle.body}%` }}
                    />
                    {/* Wick bottom */}
                    <div
                      className={`w-px ${candle.isGreen ? 'bg-green-500/40' : 'bg-red-500/40'}`}
                      style={{ height: `${candle.wickBottom}%` }}
                    />
                  </div>
                ))}
              </div>

              {/* Entry marker line */}
              <div className="absolute left-[25%] top-[55%] right-0 border-t border-dashed border-green-500/50" />
              <div className="absolute left-[25%] top-[55%] -translate-y-1/2 -translate-x-1/2">
                <div className="px-2 py-1 bg-green-500/20 border border-green-500/40 rounded text-xs text-green-400 whitespace-nowrap">
                  ENTRY $0.00028946
                </div>
              </div>

              {/* Exit marker line */}
              <div className="absolute left-[70%] top-[30%] right-0 border-t border-dashed border-red-500/50" />
              <div className="absolute left-[70%] top-[30%] -translate-y-1/2 -translate-x-1/2">
                <div className="px-2 py-1 bg-red-500/20 border border-red-500/40 rounded text-xs text-red-400 whitespace-nowrap">
                  EXIT $0.00062469
                </div>
              </div>

              {/* P&L Badge */}
              <div className="absolute top-4 right-4 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                <span className="text-2xl font-bold text-green-400">+115.81%</span>
              </div>

              {/* Playback controls */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center gap-4">
                  {/* Play button */}
                  <button className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600 transition-colors">
                    <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>

                  {/* Timeline */}
                  <div className="flex-1">
                    <div className="h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
                      <div className="w-[35%] h-full bg-green-500 rounded-full" />
                    </div>
                  </div>

                  {/* Speed control */}
                  <div className="px-2 py-1 bg-[#2a2a2a] rounded text-xs text-gray-400">
                    1x
                  </div>

                  {/* Fullscreen */}
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </BrowserMockup>
        </div>

        {/* Trust Bar */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#71717a]">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Free to use
          </span>
          <span className="hidden sm:inline text-[#3a3a3a]">•</span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            No signup required
          </span>
          <span className="hidden sm:inline text-[#3a3a3a]">•</span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Works with any Solana token
          </span>
        </div>
      </div>

      {/* Glow animation keyframes */}
      <style jsx>{`
        @keyframes glow-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </section>
  )
}

// Generate realistic-looking candle data
function generateCandles() {
  const candles = []
  let trend = 0.5 // Start neutral, will trend up

  for (let i = 0; i < 40; i++) {
    // Gradually trend upward (for the winning trade visual)
    if (i > 10) trend = 0.6
    if (i > 25) trend = 0.7

    const isGreen = Math.random() < trend
    const body = 5 + Math.random() * 15
    const wickTop = Math.random() * 8
    const wickBottom = Math.random() * 8

    candles.push({ isGreen, body, wickTop, wickBottom })
  }

  return candles
}
