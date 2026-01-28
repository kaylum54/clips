/**
 * Landing Page
 * Public marketing page for Clips
 */

import { Hero } from '@/components/landing/Hero'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Pricing } from '@/components/landing/Pricing'
import { FAQ } from '@/components/landing/FAQ'
import { CTA } from '@/components/landing/CTA'

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
