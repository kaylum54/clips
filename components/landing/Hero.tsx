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
            href={user ? '/dashboard' : '/auth/login'}
            className="w-full sm:w-auto px-8 py-4 bg-green-500 hover:bg-[#16a34a] text-black font-semibold text-lg rounded-lg transition-all hover:-translate-y-0.5"
          >
            {user ? 'Go to Dashboard' : 'Create Your First Clip'}
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
            5 free renders/month
          </span>
          <span className="hidden sm:inline text-[#3a3a3a]">•</span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Quick signup with Google
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

// Static candle data (deterministic to avoid hydration mismatch)
const STATIC_CANDLES = [
  { isGreen: false, body: 8.2, wickTop: 3.1, wickBottom: 5.4 },
  { isGreen: true, body: 12.5, wickTop: 2.0, wickBottom: 4.1 },
  { isGreen: false, body: 6.8, wickTop: 5.5, wickBottom: 2.3 },
  { isGreen: true, body: 10.1, wickTop: 1.8, wickBottom: 6.7 },
  { isGreen: false, body: 14.3, wickTop: 4.2, wickBottom: 1.9 },
  { isGreen: true, body: 7.6, wickTop: 3.8, wickBottom: 3.5 },
  { isGreen: false, body: 11.9, wickTop: 6.1, wickBottom: 2.8 },
  { isGreen: true, body: 9.4, wickTop: 2.5, wickBottom: 5.0 },
  { isGreen: false, body: 5.7, wickTop: 7.3, wickBottom: 4.6 },
  { isGreen: true, body: 13.8, wickTop: 1.2, wickBottom: 3.2 },
  { isGreen: false, body: 8.9, wickTop: 4.7, wickBottom: 6.0 },
  { isGreen: true, body: 15.2, wickTop: 2.9, wickBottom: 1.5 },
  { isGreen: true, body: 11.4, wickTop: 3.4, wickBottom: 4.8 },
  { isGreen: false, body: 7.1, wickTop: 5.9, wickBottom: 2.1 },
  { isGreen: true, body: 16.7, wickTop: 1.6, wickBottom: 3.9 },
  { isGreen: true, body: 10.8, wickTop: 4.0, wickBottom: 5.7 },
  { isGreen: false, body: 6.3, wickTop: 7.1, wickBottom: 1.3 },
  { isGreen: true, body: 14.0, wickTop: 2.3, wickBottom: 4.4 },
  { isGreen: true, body: 9.7, wickTop: 3.6, wickBottom: 6.2 },
  { isGreen: false, body: 12.2, wickTop: 5.2, wickBottom: 2.6 },
  { isGreen: true, body: 17.5, wickTop: 1.0, wickBottom: 3.7 },
  { isGreen: true, body: 8.5, wickTop: 4.5, wickBottom: 5.3 },
  { isGreen: true, body: 13.1, wickTop: 2.7, wickBottom: 1.8 },
  { isGreen: false, body: 10.4, wickTop: 6.4, wickBottom: 4.0 },
  { isGreen: true, body: 15.8, wickTop: 1.4, wickBottom: 2.9 },
  { isGreen: true, body: 7.9, wickTop: 3.3, wickBottom: 5.8 },
  { isGreen: true, body: 18.3, wickTop: 2.1, wickBottom: 1.1 },
  { isGreen: false, body: 11.6, wickTop: 5.0, wickBottom: 3.4 },
  { isGreen: true, body: 14.7, wickTop: 3.9, wickBottom: 4.3 },
  { isGreen: true, body: 9.0, wickTop: 1.7, wickBottom: 6.5 },
  { isGreen: true, body: 16.2, wickTop: 4.3, wickBottom: 2.0 },
  { isGreen: false, body: 6.6, wickTop: 7.5, wickBottom: 3.0 },
  { isGreen: true, body: 13.5, wickTop: 2.6, wickBottom: 4.9 },
  { isGreen: true, body: 19.1, wickTop: 1.3, wickBottom: 1.6 },
  { isGreen: true, body: 10.0, wickTop: 3.7, wickBottom: 5.1 },
  { isGreen: false, body: 8.0, wickTop: 5.8, wickBottom: 2.4 },
  { isGreen: true, body: 15.4, wickTop: 2.2, wickBottom: 3.6 },
  { isGreen: true, body: 12.8, wickTop: 4.1, wickBottom: 4.7 },
  { isGreen: true, body: 17.0, wickTop: 1.9, wickBottom: 2.5 },
  { isGreen: false, body: 9.3, wickTop: 6.8, wickBottom: 3.3 },
]

function generateCandles() {
  return STATIC_CANDLES
}
