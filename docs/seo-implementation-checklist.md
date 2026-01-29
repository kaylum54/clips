# SEO Implementation Checklist: Clips

**Created:** 2025-01-29
**Target Completion:** 2025-02-15 (3 weeks)
**Estimated Effort:** 40-50 developer hours

---

## Task Overview

This checklist provides specific implementation tasks with code snippets to address critical SEO gaps identified in the audit.

**Priority Breakdown:**
- **CRITICAL (Week 1):** 4 tasks - 8 hours
- **HIGH (Week 2):** 8 tasks - 16 hours
- **MEDIUM (Week 3):** 6 tasks - 15 hours

---

# CRITICAL PRIORITY (Week 1)

## Task 1: Create robots.ts File

**Severity:** CRITICAL
**Time Estimate:** 30 minutes
**File Location:** `app/robots.ts`

**Code:**
```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clips.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/dashboard/',
          '/trades/',
          '/auth/',
          '/private/',
        ],
      },
      {
        // Slower crawl for search engines to reduce load
        userAgent: 'Googlebot',
        crawlDelay: 0.5,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
```

**Validation:**
- [ ] File created at `app/robots.ts`
- [ ] Test with: `http://localhost:3000/robots.txt`
- [ ] Verify output matches expected format
- [ ] Check that private pages are blocked

**Notes:**
- Blocks crawling of private pages (admin, dashboard, auth)
- Keeps API routes out of search results
- Provides sitemap location to crawlers

---

## Task 2: Create sitemap.ts File

**Severity:** CRITICAL
**Time Estimate:** 45 minutes
**File Location:** `app/sitemap.ts`

**Code:**
```typescript
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clips.app'

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  // Dynamic routes - fetch from database if available
  let dynamicRoutes: MetadataRoute.Sitemap = []

  try {
    // TODO: Fetch public trader profiles from database
    // const traders = await db.traders.findPublic()
    // dynamicRoutes = traders.map(trader => ({
    //   url: `${baseUrl}/u/${trader.username}`,
    //   lastModified: trader.updatedAt,
    //   changeFrequency: 'daily' as const,
    //   priority: 0.7,
    // }))
  } catch (error) {
    console.error('Error fetching dynamic routes for sitemap:', error)
  }

  return [...staticRoutes, ...dynamicRoutes]
}
```

**Validation:**
- [ ] File created at `app/sitemap.ts`
- [ ] Test with: `http://localhost:3000/sitemap.xml`
- [ ] Verify all public routes are listed
- [ ] Check that private routes are NOT included
- [ ] Submit sitemap to Google Search Console

**Notes:**
- Currently includes static routes only
- Add database query for trader profiles when ready
- Update change frequency based on content updates
- Trader profiles should have priority 0.7 (below main pages)

---

## Task 3: Add Noindex to Private Pages

**Severity:** CRITICAL
**Time Estimate:** 30 minutes
**Files to Update:**
- `app/dashboard/layout.tsx`
- `app/admin/layout.tsx`
- `app/auth/layout.tsx`

**Code for Dashboard Layout:**
```typescript
import type { Metadata } from "next"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ... existing layout code ...
}
```

**Code for Admin Layout:**
```typescript
import type { Metadata } from "next"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ... existing layout code ...
}
```

**Code for Auth Layout:**
```typescript
import type { Metadata } from "next"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ... existing layout code ...
}
```

**Validation:**
- [ ] Dashboard pages have `noindex` meta tag
- [ ] Admin pages have `noindex` meta tag
- [ ] Auth pages have `noindex` meta tag
- [ ] Test by viewing page source
- [ ] Verify no duplicate content issues

**Notes:**
- `follow: false` prevents crawling of links from these pages
- `nocache: true` prevents caching of private pages
- Private pages still need proper password/auth to be secure

---

## Task 4: Add Global OG & Twitter Tags

**Severity:** CRITICAL
**Time Estimate:** 1 hour
**File Location:** `app/layout.tsx`

**Updated Code:**
```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clips.app'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Clips - Solana Chart Replay Videos | Create Trade Replays",
  description: "Turn your Solana trades into shareable chart replay videos. Mark your entries and exits, watch the action unfold, and share your wins. No recording software needed.",
  keywords: [
    "solana",
    "chart replay",
    "trade videos",
    "memecoin",
    "content creation",
    "trading tool",
    "video generator",
    "DeFi",
  ],
  authors: [{ name: "Clips" }],
  creator: "Clips",
  publisher: "Clips",

  // Open Graph Tags
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    title: "Clips - Solana Chart Replay Videos",
    description: "Turn your Solana trades into shareable chart replay videos in seconds.",
    siteName: "Clips",
    images: [
      {
        url: `${baseUrl}/og-image-hero.png`,
        width: 1200,
        height: 630,
        alt: "Clips - Chart Replay Video Tool",
        type: "image/png",
      },
      {
        url: `${baseUrl}/og-image-square.png`,
        width: 800,
        height: 800,
        alt: "Clips Logo",
        type: "image/png",
      },
    ],
  },

  // Twitter Card Tags
  twitter: {
    card: "summary_large_image",
    title: "Clips - Solana Chart Replay Videos",
    description: "Turn your Solana trades into shareable chart replay videos.",
    creator: "@ClipsApp",
    images: [`${baseUrl}/og-image-hero.png`],
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Alternate Links
  alternates: {
    canonical: baseUrl,
  },

  // Verification
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE', // Add this
    // yandex: 'YOUR_YANDEX_CODE',
  },

  // Additional
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Clips",
              "description": "Professional chart replay videos from Solana trades",
              "url": baseUrl,
              "applicationCategory": "BusinessApplication",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "150"
              }
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a] text-white min-h-screen`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

**Environment Variables:**
```
# .env.local
NEXT_PUBLIC_APP_URL=https://clips.app
```

**Validation:**
- [ ] `metadataBase` is set correctly
- [ ] Open Graph images exist (1200x630px recommended)
- [ ] Test with: https://ogp.me/ (paste your URL)
- [ ] Test Twitter cards: https://cards-dev.twitter.com/validator
- [ ] Verify in page source HTML

**Notes:**
- Create OG images (see task 7)
- Add Google verification code from Google Search Console
- Twitter Creator should be actual brand account
- JSON-LD schema provides rich snippets

---

# HIGH PRIORITY (Week 2)

## Task 5: Add Page-Level Metadata (Landing Page)

**Severity:** HIGH
**Time Estimate:** 1.5 hours
**File Location:** `app/(marketing)/page.tsx`

**Updated Code:**
```typescript
import { Metadata } from "next"
import { Hero } from '@/components/landing/Hero'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Pricing } from '@/components/landing/Pricing'
import { FAQ } from '@/components/landing/FAQ'
import { CTA } from '@/components/landing/CTA'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clips.app'

export const metadata: Metadata = {
  title: "Clips - Solana Chart Replay Videos | Create Trade Replays",
  description: "Turn your Solana trades into shareable chart replay videos. Mark your entries and exits, watch the action unfold, and share your wins. No recording software needed.",

  openGraph: {
    type: "website",
    url: `${baseUrl}/`,
    title: "Clips - Turn Your Solana Trades Into Shareable Videos",
    description: "Create professional chart replay videos from your Solana trades in seconds. No recording software needed.",
    images: [
      {
        url: `${baseUrl}/og-image-hero.png`,
        width: 1200,
        height: 630,
        alt: "Clips - Solana Chart Replay Tool",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Clips - Solana Chart Replay Videos",
    description: "Turn your Solana trades into shareable videos.",
    images: [`${baseUrl}/og-image-hero.png`],
  },

  alternates: {
    canonical: `${baseUrl}/`,
  },

  // Structured Data for Homepage
  other: {
    "script:ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Clips?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Clips is a tool that turns your Solana trades into professional chart replay videos. Paste your entry and exit transaction hashes, and Clips generates a video showing your trade unfold."
          }
        },
        // Add more FAQ items from FAQ section
      ]
    })
  }
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
```

**Validation:**
- [ ] Page has unique metadata
- [ ] Canonical URL is set
- [ ] OG tags are correct
- [ ] Test with Google's Rich Results Test
- [ ] Verify in GSC

---

## Task 6: Add Page-Level Metadata (Leaderboard)

**Severity:** HIGH
**Time Estimate:** 1 hour
**File Location:** `app/leaderboard/page.tsx`

**Updated Code:**
```typescript
import { Metadata } from "next"
import Link from 'next/link'
import { Leaderboard } from '@/components/Leaderboard'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clips.app'

export const metadata: Metadata = {
  title: "Solana Leaderboard: Top Trades & Best Performers | Clips",
  description: "Browse top-performing Solana memecoin trades. View verified gains from successful traders. See best trades, win rates, and trading strategies on our public leaderboard.",

  openGraph: {
    type: "website",
    url: `${baseUrl}/leaderboard`,
    title: "Solana Leaderboard - Top Traders & Verified Gains",
    description: "Discover top-performing Solana trades ranked by profit percentage.",
    images: [
      {
        url: `${baseUrl}/og-image-leaderboard.png`,
        width: 1200,
        height: 630,
        alt: "Clips Leaderboard - Top Solana Traders",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Solana Leaderboard - Top Traders",
    description: "See verified Solana trading wins ranked by gains.",
    images: [`${baseUrl}/og-image-leaderboard.png`],
  },

  alternates: {
    canonical: `${baseUrl}/leaderboard`,
  },

  other: {
    "script:ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": baseUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Leaderboard",
          "item": `${baseUrl}/leaderboard`
        }
      ]
    })
  }
}

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* ... existing code ... */}
    </div>
  )
}
```

**Validation:**
- [ ] Metadata added
- [ ] Breadcrumb schema is correct
- [ ] OG image path is correct
- [ ] Test on Google Rich Results

---

## Task 7: Create Open Graph Images

**Severity:** HIGH
**Time Estimate:** 2 hours
**Files to Create:**
- `public/og-image-hero.png` (1200x630px)
- `public/og-image-leaderboard.png` (1200x630px)
- `public/og-image-pricing.png` (1200x630px)

**Design Specifications:**

```
OG Image Requirements:
- Dimensions: 1200x630px (exact)
- Format: PNG (for transparency) or JPG (for compression)
- File Size: < 200KB
- Include: Logo, headline, key visual
- Font: Same as brand (Geist)
- Colors: Match brand colors (green on dark)
- Text: Large, readable on small previews
```

**Content Guidelines:**

**og-image-hero.png:**
- Headline: "Solana Chart Replay Videos"
- Subheading: "Turn Trades Into Shareable Content"
- Visual: Sample chart with entry/exit markers
- Logo: Top-left or bottom-right

**og-image-leaderboard.png:**
- Headline: "Leaderboard: Top Solana Trades"
- Subheading: "Verified Trading Wins"
- Visual: Trophy icon, ranking numbers
- Background: Dark with green accents

**og-image-pricing.png:**
- Headline: "Simple Pricing"
- Subheading: "Free + Pro Plans"
- Visual: Price cards
- CTA: "Start Free"

**Tools:**
- Use Figma, Canva, or ImageMagick
- Template: Recommended aspect ratio 1200x630
- Color: #22c55e (green) on #0a0a0a (dark)

**Validation:**
- [ ] All three images exist in `/public/`
- [ ] Images are exactly 1200x630px
- [ ] File size < 200KB each
- [ ] Test with ogp.me validator
- [ ] Test preview on Twitter, Discord, LinkedIn

---

## Task 8: Implement FAQ Schema

**Severity:** HIGH
**Time Estimate:** 1.5 hours
**File Location:** `components/landing/FAQ.tsx`

**Updated Code:**
```typescript
'use client'

import { useState } from 'react'
import { FAQ as FAQComponent } from './FAQComponent'

const faqs = [
  {
    question: 'What tokens does Clips support?',
    answer:
      'Clips supports all SPL tokens on Solana. This includes memecoins, DeFi tokens, and any token traded on Raydium, Jupiter, or other Solana DEXs.',
  },
  {
    question: 'How do I find my transaction hashes?',
    answer:
      'You can find your transaction hashes on any Solana explorer like Solscan or Solana FM. Look for your wallet address, find the buy and sell transactions for your trade, and copy the transaction signatures.',
  },
  // ... rest of FAQs
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  // Generate JSON-LD schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* FAQ Accordion */}
      <section id="faq" className="py-24 bg-[#0a0a0a]">
        {/* ... existing JSX ... */}
      </section>
    </>
  )
}
```

**Validation:**
- [ ] FAQ schema is in page source
- [ ] Test with Google Rich Results Test
- [ ] All Q&As have matching schema
- [ ] Verify markup is valid JSON-LD

---

## Task 9: Add Breadcrumb Navigation & Schema

**Severity:** HIGH
**Time Estimate:** 2 hours
**File Location:** `components/Breadcrumb.tsx` (new file)

**Code:**
```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment } from 'react'

interface BreadcrumbItem {
  name: string
  href: string
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const routes: Record<string, BreadcrumbItem> = {
    '/leaderboard': { name: 'Leaderboard', href: '/leaderboard' },
    '/trades': { name: 'My Trades', href: '/trades' },
    '/dashboard': { name: 'Dashboard', href: '/dashboard' },
    '/pricing': { name: 'Pricing', href: '/pricing' },
    '/auth/login': { name: 'Sign In', href: '/auth/login' },
    '/auth/signup': { name: 'Sign Up', href: '/auth/signup' },
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', href: '/' }
  ]

  // Handle dynamic routes like /u/[username]
  if (pathname.startsWith('/u/')) {
    const username = pathname.split('/')[2]
    breadcrumbs.push({
      name: username,
      href: pathname
    })
  } else if (routes[pathname]) {
    breadcrumbs.push(routes[pathname])
  }

  return breadcrumbs
}

export function Breadcrumb() {
  const pathname = usePathname()
  const breadcrumbs = generateBreadcrumbs(pathname)

  // Generate structured data
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": `${process.env.NEXT_PUBLIC_APP_URL || 'https://clips.app'}${crumb.href}`
    }))
  }

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Visual Breadcrumbs */}
      <nav aria-label="breadcrumb" className="py-3 px-4 text-sm">
        <ol className="flex items-center gap-2">
          {breadcrumbs.map((crumb, index) => (
            <Fragment key={crumb.href}>
              {index > 0 && (
                <span className="text-gray-500">/</span>
              )}
              {index === breadcrumbs.length - 1 ? (
                <span className="text-gray-400">{crumb.name}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {crumb.name}
                </Link>
              )}
            </Fragment>
          ))}
        </ol>
      </nav>
    </>
  )
}
```

**Validation:**
- [ ] Component renders breadcrumbs
- [ ] Schema is valid JSON-LD
- [ ] Test on all major pages
- [ ] Verify in Google Rich Results Test

---

## Task 10: Add Trader Profile Dynamic Metadata

**Severity:** HIGH
**Time Estimate:** 2 hours
**File Location:** `app/u/[username]/page.tsx`

**Code:**
```typescript
import { Metadata } from "next"
import { notFound } from "next/navigation"
import TraderProfile from '@/components/TraderProfile'

interface Props {
  params: { username: string }
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clips.app'

// Dynamic metadata generation
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = params

  // Fetch trader data (implement based on your DB)
  // const trader = await db.traders.findByUsername(username)

  // Placeholder - replace with actual data fetch
  const trader = {
    username,
    displayName: username,
    bestTrade: 125,
    avgGain: 45,
    winRate: 68,
    totalTrades: 24,
  }

  if (!trader) {
    notFound()
  }

  const title = `${trader.displayName}'s Solana Trades | ${trader.bestTrade}% Best Gain | Clips`
  const description = `View ${trader.displayName}'s verified Solana trades. ${trader.totalTrades} trades, ${trader.winRate}% win rate, ${trader.avgGain}% avg gain. Solana memecoin trading proof.`
  const profileUrl = `${baseUrl}/u/${username}`
  const ogImage = `${baseUrl}/api/og?username=${username}` // See Task 11

  return {
    title,
    description,

    openGraph: {
      type: "profile",
      url: profileUrl,
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${trader.displayName}'s Trading Profile`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },

    alternates: {
      canonical: profileUrl,
    },

    other: {
      "script:ld+json": JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": baseUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Traders",
            "item": `${baseUrl}/leaderboard`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": trader.displayName,
            "item": profileUrl
          }
        ]
      })
    }
  }
}

export default async function TraderProfilePage({ params }: Props) {
  return <TraderProfile username={params.username} />
}
```

**Validation:**
- [ ] Metadata is dynamic per trader
- [ ] Fallback to 404 if trader not found
- [ ] OG image is generated correctly
- [ ] Test multiple profile URLs

---

## Task 11: Create Dynamic OG Image API

**Severity:** HIGH
**Time Estimate:** 1.5 hours
**File Location:** `app/api/og/route.ts`

**Code:**
```typescript
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username') || 'Trader'
  const bestTrade = searchParams.get('bestTrade') || '100'
  const winRate = searchParams.get('winRate') || '75'
  const avgGain = searchParams.get('avgGain') || '50'

  try {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            fontSize: 48,
            color: 'white',
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
            width: '100%',
            height: '100%',
            padding: '40px',
            boxSizing: 'border-box',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px' }}>
            {/* Logo / Brand */}
            <div style={{ fontSize: '32px', color: '#22c55e', fontWeight: 'bold' }}>
              CLIPS
            </div>

            {/* Main Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h1 style={{ margin: 0, fontSize: '56px', fontWeight: 'bold' }}>
                {username}'s Trading Profile
              </h1>
              <p style={{ margin: 0, fontSize: '32px', color: '#a1a1aa' }}>
                Verified Solana Trade Wins
              </p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'flex', gap: '40px', marginTop: '20px' }}>
              <div>
                <p style={{ margin: '0 0 10px 0', fontSize: '28px', color: '#a1a1aa' }}>
                  Best Trade
                </p>
                <p style={{ margin: 0, fontSize: '48px', color: '#22c55e', fontWeight: 'bold' }}>
                  +{bestTrade}%
                </p>
              </div>
              <div>
                <p style={{ margin: '0 0 10px 0', fontSize: '28px', color: '#a1a1aa' }}>
                  Win Rate
                </p>
                <p style={{ margin: 0, fontSize: '48px', color: '#22c55e', fontWeight: 'bold' }}>
                  {winRate}%
                </p>
              </div>
              <div>
                <p style={{ margin: '0 0 10px 0', fontSize: '28px', color: '#a1a1aa' }}>
                  Avg Gain
                </p>
                <p style={{ margin: 0, fontSize: '48px', color: '#22c55e', fontWeight: 'bold' }}>
                  +{avgGain}%
                </p>
              </div>
            </div>

            {/* CTA */}
            <div style={{
              marginTop: '30px',
              padding: '15px 30px',
              background: '#22c55e',
              color: '#000',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '28px',
              width: 'fit-content',
            }}>
              View on Clips
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('OG image generation error:', error)
    return new Response('Failed to generate image', { status: 500 })
  }
}
```

**Validation:**
- [ ] API endpoint works: `/api/og?username=test`
- [ ] Image is generated dynamically
- [ ] Image dimensions are 1200x630
- [ ] Text is readable
- [ ] Colors match brand

**Notes:**
- Requires Next.js edge runtime
- Can be used for any dynamic page
- Cache for 1 hour with revalidation

---

# MEDIUM PRIORITY (Week 3)

## Task 12: Add Canonical URLs to All Pages

**Severity:** MEDIUM
**Time Estimate:** 1 hour
**Files to Update:** All page.tsx files

**Pattern to add to all pages:**
```typescript
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clips.app'

export const metadata: Metadata = {
  alternates: {
    canonical: `${baseUrl}/your-path-here`,
  },
}
```

---

## Task 13: Optimize Image Alt Text

**Severity:** MEDIUM
**Time Estimate:** 30 minutes
**Files to Update:**
- `components/landing/Hero.tsx` (Line 35-41)
- All image instances

**Update Hero background image:**
```typescript
// Before
<Image
  src="/motionlogo1.png"
  alt=""
  width={700}
  height={700}
/>

// After
<Image
  src="/motionlogo1.png"
  alt="Clips logo background pattern"
  width={700}
  height={700}
  style={{ opacity: 0.07 }}
/>
```

---

## Task 14: Add Internal Linking Strategy

**Severity:** MEDIUM
**Time Estimate:** 1.5 hours

**Add Links:**
1. Footer: Link all main pages
2. FAQ: Link to relevant pages (pricing, dashboard)
3. Hero CTA: Clear CTAs to signup/dashboard
4. Leaderboard: Link to trader profiles

**Example:**
```typescript
// In FAQ component
<a href="/pricing" className="text-green-400 hover:text-green-300">
  Upgrade to Pro
</a>
```

---

## Task 15: Setup Google Search Console

**Severity:** MEDIUM
**Time Estimate:** 1.5 hours

**Steps:**
1. [ ] Go to https://search.google.com/search-console
2. [ ] Add clips.app as property
3. [ ] Verify ownership (DNS/HTML)
4. [ ] Submit sitemap: `/sitemap.xml`
5. [ ] Request indexing for key pages
6. [ ] Set up Search Console alerts
7. [ ] Monitor crawl errors
8. [ ] Monitor core web vitals

---

## Task 16: Create robots.txt for Dynamic Content

**Severity:** MEDIUM
**Time Estimate:** 1 hour
**Update:** `app/robots.ts`

**Enhanced version:**
```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clips.app'

  return {
    rules: [
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/dashboard/',
          '/trades/',
          '/auth/',
        ],
        crawlDelay: 0.5,
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/dashboard/',
          '/trades/',
          '/auth/',
          '/*.json',
        ],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
    ],
    host: baseUrl,
  }
}
```

---

## Task 17: Add Page Load Performance Monitoring

**Severity:** MEDIUM
**Time Estimate:** 1.5 hours
**File Location:** `app/layout.tsx`

**Code:**
```typescript
// Add to root layout
<script
  dangerouslySetInnerHTML={{
    __html: `
      // Web Vitals measurement
      window.addEventListener('load', () => {
        // Measure Largest Contentful Paint
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          const lastEntry = entries[entries.length - 1]
          console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime)

          // Send to analytics
          if (window.gtag) {
            window.gtag('event', 'page_view', {
              'lcp': lastEntry.renderTime || lastEntry.loadTime
            })
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] })
      })
    `,
  }}
/>
```

---

## Task 18: Create Meta Tags Template

**Severity:** MEDIUM
**Time Estimate:** 1 hour
**File Location:** `utils/metadata.ts` (new file)

**Code:**
```typescript
import type { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clips.app'

export function createMetadata(
  title: string,
  description: string,
  path: string = '/',
  ogImage?: string,
  ogType: 'website' | 'profile' = 'website'
): Metadata {
  const fullUrl = `${baseUrl}${path}`
  const finalOgImage = ogImage || `${baseUrl}/og-image-hero.png`

  return {
    title,
    description,
    openGraph: {
      type: ogType,
      url: fullUrl,
      title,
      description,
      images: [
        {
          url: finalOgImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [finalOgImage],
    },
    alternates: {
      canonical: fullUrl,
    },
  }
}
```

**Usage:**
```typescript
import { createMetadata } from '@/utils/metadata'

export const metadata = createMetadata(
  'Page Title',
  'Page description',
  '/page-path'
)
```

---

# Validation & Testing Checklist

## SEO Testing Tools

- [ ] **Google Search Console**
  - Submit sitemap
  - Check for crawl errors
  - Review indexed pages
  - Monitor core web vitals

- [ ] **Google Rich Results Test**
  - https://search.google.com/test/rich-results
  - Test FAQ schema
  - Test breadcrumbs
  - Test organization schema

- [ ] **Twitter Card Validator**
  - https://cards-dev.twitter.com/validator
  - Test OG images on all pages

- [ ] **Open Graph Preview**
  - https://ogp.me/
  - Verify image display
  - Check text preview

- [ ] **Lighthouse Audit**
  - Run in Chrome DevTools
  - Target: 90+ on SEO
  - Target: 90+ on Performance
  - Check Core Web Vitals

- [ ] **Broken Link Checker**
  - Check internal links
  - Check external links
  - Fix 404s

## Browser Testing

- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Chrome
- [ ] Mobile Safari

---

# Timeline & Deliverables

## Week 1 (Critical - 8 hours)
- [ ] robots.ts
- [ ] sitemap.ts
- [ ] Noindex on private pages
- [ ] Global OG tags

**Deliverable:** SEO foundation complete

## Week 2 (High Priority - 16 hours)
- [ ] Page-level metadata
- [ ] OG images created
- [ ] FAQ schema
- [ ] Breadcrumbs
- [ ] Dynamic profile metadata
- [ ] Dynamic OG image API

**Deliverable:** Complete schema markup + social cards

## Week 3 (Medium Priority - 15 hours)
- [ ] Canonical URLs on all pages
- [ ] Image alt text audit
- [ ] Internal linking strategy
- [ ] Google Search Console setup
- [ ] Performance monitoring
- [ ] Template utilities

**Deliverable:** Fully optimized, production-ready

---

# Success Metrics (Month 1)

**By end of Week 1:**
- ✅ All critical SEO files created
- ✅ No crawl errors in GSC
- ✅ Sitemap submitted

**By end of Week 2:**
- ✅ 50%+ pages have rich snippets
- ✅ OG cards display correctly
- ✅ Lighthouse SEO: 95+

**By end of Week 3:**
- ✅ All public pages have metadata
- ✅ Core Web Vitals: Good
- ✅ 100%+ pages indexed

**By end of Month 1:**
- ✅ 100+ pages indexed
- ✅ 50+ keywords ranking
- ✅ 500+ organic impressions/month

---

# Notes & Best Practices

1. **Test Everything:** Use official Google tools for validation
2. **Monitor Progress:** Use GSC to track performance
3. **Content Quality:** SEO is 70% content, 30% technical
4. **Keep Updated:** Monitor algorithm changes
5. **User Experience:** SEO and UX are linked

---

# Support Resources

- Next.js Metadata API: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
- Schema.org Types: https://schema.org
- Google Search Central: https://developers.google.com/search
- Core Web Vitals Guide: https://web.dev/vitals/

---

**Created by:** SEO Agent
**Last Updated:** 2025-01-29
**Status:** Ready for Implementation
