# Copy Audit: Clips Landing Page

## Current Landing Page Structure

| Section | Component | Purpose |
|---|---|---|
| Navbar | `Navbar.tsx` | Navigation + auth CTAs |
| Hero | `Hero.tsx` | Primary headline, subtext, CTA, product preview |
| How It Works | `HowItWorks.tsx` | 3-step process explanation |
| Pricing | `Pricing.tsx` | Free vs Pro comparison |
| FAQ | `FAQ.tsx` | 8 common questions |
| CTA | `CTA.tsx` | Final conversion push |
| Footer | `Footer.tsx` | Links, brand tagline, legal |

---

## Copy Touchpoint Audit

### 1. Hero Section

**Current Headline:** "Turn Your Trades Into Shareable Replays"
- Clarity: 7/10 -- Clear what it does, but "shareable replays" is generic
- Emotional Impact: 5/10 -- Functional, not exciting. Doesn't tap into CT culture
- Specificity: 6/10 -- "Trades" is broad. Doesn't say Solana or memecoins
- CTA Strength: N/A

**Current Subheadline:** "Create professional chart replay clips from your Solana trades in seconds. Mark your entries and exits, watch the action unfold, and share your wins."
- Clarity: 8/10 -- Good description of the process
- Emotional Impact: 5/10 -- "Professional" and "in seconds" are functional. "Share your wins" is the only emotional hit
- Specificity: 7/10 -- Mentions Solana, entries/exits
- CTA Strength: N/A

**Current Primary CTA:** "Create Your First Clip" / "Go to Dashboard"
- Clarity: 8/10 -- Clear action
- Emotional Impact: 5/10 -- Functional, not exciting
- Specificity: 7/10 -- "First clip" implies low commitment
- CTA Strength: 6/10 -- Could be stronger. Doesn't create urgency

**Current Secondary CTA:** "See How It Works"
- Appropriate for scroll-to-section anchor. No issues.

**Current Badge:** "Now supporting all Solana tokens"
- Clarity: 9/10 -- Clear
- Emotional Impact: 3/10 -- Informational, not emotional
- Specificity: 8/10 -- Specific about Solana
- CTA Strength: N/A

**Current Trust Bar:**
- "5 free renders/month" -- Good, sets expectations
- "Quick signup with Google" -- Good, reduces friction anxiety
- "Works with any Solana token" -- Redundant with badge above

### 2. How It Works Section

**Current Title:** "How It Works"
- Generic. Every SaaS uses this exact heading.

**Current Subtitle:** "Create professional trade replay clips in three simple steps"
- Repetitive with hero copy ("professional", "clips"). Could be more engaging.

**Steps:**
1. "Paste" -- "Paste any Solana token contract address"
2. "Mark" -- "Click to mark your entry and exit points"
3. "Play" -- "Watch your trade unfold in real-time"

- Clarity: 8/10 -- Very clear steps
- Emotional Impact: 4/10 -- Purely functional descriptions
- Specificity: 6/10 -- Step 1 is inaccurate (users paste transaction hashes, not just CAs)
- Issues: Step 1 description doesn't match the actual product flow (transaction hash input)

### 3. Pricing Section

**Current Title:** "Simple, Transparent Pricing"
- Clarity: 9/10 -- Good
- Emotional Impact: 4/10 -- Standard SaaS pricing header

**Free Plan Issues:**
- "Perfect for trying out Clips" -- Weak positioning. "Trying out" implies the product isn't worth using for free
- Feature list includes "1080p video quality" and "4K video quality" for Pro -- needs verification against actual implementation

**Pro Plan Issues:**
- "For serious traders and creators" -- "Serious" is a weak qualifier
- Some listed Pro features may not match actual implementation (verify: 4K, Twitter share integration)

**Trust Badges:** Good selection (Stripe, cancel anytime, no CC for free)

### 4. FAQ Section

**Current Title:** "Frequently Asked Questions" / "Got questions? We've got answers."
- Standard. Works but not memorable.

**FAQ Content Issues:**
- Q3 mentions "4K ultra HD exports for Pro" -- verify this feature actually exists in the codebase
- Q5 says "Pro users can share their trade replay videos directly to Twitter with a pre-filled caption" -- this is misleading. The share button copies text + link, it doesn't upload the video directly to Twitter
- Q4 says "Most videos render in under 30 seconds" -- may need verification with actual render times on EC2

### 5. CTA Section

**Current Headline:** "Ready to share your wins?"
- Clarity: 8/10 -- Clear
- Emotional Impact: 6/10 -- "Share your wins" taps into ego, but question format is passive
- Specificity: 5/10 -- Generic

**Current Subtext:** "5 free renders/month. Unlimited with Pro"
- Good. Clear value framing.

### 6. Footer

**Current Tagline:** "Turn your Solana trades into shareable video replays. Perfect for content creators, traders, and analysts."
- Clarity: 8/10 -- Good summary
- Issues: "Analysts" isn't really the target audience. Should be "degens" or "CT traders"

### 7. Meta Tags

**Current Title:** "Clips - Solana Chart Replay"
- Too generic. Doesn't communicate value.

**Current Description:** "Replay historical Solana token charts for content creation. Mark your entries and exits, control playback, and capture your best trades."
- Functional but not compelling. No emotional hook. Doesn't mention video or sharing.

---

## Overall Scoring

| Metric | Score | Notes |
|---|---|---|
| **Clarity** | 7/10 | Generally clear, but some inaccuracies (How It Works steps) |
| **Emotional Impact** | 4/10 | Very functional tone. Doesn't tap into CT culture, ego, FOMO, or flex mentality |
| **Specificity** | 6/10 | Mentions Solana but doesn't use CT-native language or specific scenarios |
| **CTA Strength** | 5/10 | CTAs are functional but lack urgency, excitement, or cultural resonance |

---

## Key Problems Identified

1. **Too corporate, not CT-native**: The copy reads like a generic SaaS product, not a tool built for crypto degens. Missing slang, energy, and cultural references.
2. **Feature-focused, not benefit-focused**: Copy describes WHAT the product does, not WHY the user should care. "Create professional chart replay clips" vs "Flex your 10x on CT."
3. **No emotional hooks**: The biggest driver for this product is ego/status/FOMO. Current copy is purely informational.
4. **Inaccurate How It Works**: Steps don't match the actual product flow (transaction hashes, not just token addresses).
5. **Unverified claims**: 4K video, direct Twitter sharing, and render time claims may not match actual implementation.
6. **Redundant messaging**: Badge and trust bar both say "all Solana tokens." Footer audience includes "analysts" which isn't the real target.
7. **Weak meta tags**: Title and description don't sell the product or target relevant search terms.

---

## Competitor Positioning Gaps

Based on competitor analysis, key messaging opportunities NOT being used by competitors:

| Opportunity | Current Competitor Approach | Clips Angle |
|---|---|---|
| Visual trade proof | Static screenshots, PnL numbers | Animated chart replay video |
| Content creation for traders | Analytics dashboards, journals | "Turn trades into content" |
| Building trading reputation | Copy trading followers, points | Visual portfolio, leaderboard |
| Retroactive trade capture | Must record live | Works after the trade |
| Entertainment value | Data/analysis focused | "Watch trades happen" |
| CT-native language | Professional/corporate tone | Degen-friendly, flex culture |

No competitor is positioned as a **trade content creation tool**. This is Clips' unique position.
