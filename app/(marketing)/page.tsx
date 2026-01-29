/**
 * Landing Page
 * Public marketing page for Clips
 */

import type { Metadata } from 'next'
import { Hero } from '@/components/landing/Hero'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Pricing } from '@/components/landing/Pricing'
import { FAQ } from '@/components/landing/FAQ'
import { CTA } from '@/components/landing/CTA'

export const metadata: Metadata = {
  title: "Clips - Replay Your Solana Trades for CT Content",
  description: "Hit a 10x but forgot to record? Clips replays any Solana trade from on-chain data. Paste your transaction hashes, watch price action unfold with your exact entry and exit, and share it. No recording needed.",
  openGraph: {
    title: "Clips - Hit a 10x But Forgot to Record?",
    description: "Replay any Solana trade from on-chain data. Paste hashes, get a chart replay video. Free forever.",
  },
  twitter: {
    title: "Clips - Replay Your Solana Trades",
    description: "Hit a 10x but forgot to record? Replay any Solana trade with perfect entry/exit markers. Free forever.",
  },
  alternates: {
    canonical: "/",
  },
}

export default function LandingPage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <CTA />
    </>
  )
}
