# Product Brief: Clips

## What It Does

Clips is a web-based tool that transforms Solana memecoin trades into professional chart replay videos. Users paste their entry and exit transaction hashes, and Clips automatically fetches the candlestick data, marks the exact trade points on the chart, and generates a cinematic video replay showing the price action unfold from entry to exit -- complete with P&L overlay. The result is a shareable video clip that proves the trade happened and visualizes the gains (or losses) in a format optimized for social media.

---

## Key Features

### Core Product
- **Transaction-Based Chart Replay**: Paste entry/exit Solana transaction hashes to auto-generate a chart replay of your trade. Uses Helius API for transaction parsing and Birdeye API for OHLCV candle data.
- **Professional Video Rendering**: Server-side video rendering via Remotion + headless Chrome on EC2. Generates MP4 clips with candlestick charts, entry/exit markers, and animated P&L card reveal.
- **Interactive Chart Viewer**: Real-time candlestick chart powered by lightweight-charts with playback controls (play/pause, step, scrub, speed 1x-10x), marker placement, and fullscreen mode.
- **Automatic P&L Calculation**: Calculates profit/loss percentage from entry and exit prices, displayed as a branded overlay card in the video.

### Social & Community
- **Public Trade Leaderboard**: Top trades ranked by P&L percentage, filterable by time period (today/week/month/all). Encourages competition and discovery.
- **Public Trader Profiles** (`/u/[username]`): Displays a trader's public trades, stats (best trade, avg gain, win rate), and history. Shareable link for CT clout.
- **Trade Saving & Management**: Save trades with custom names, toggle public/private visibility, replay saved trades.

### Monetization
- **Freemium Model**: 5 free renders/month for all users. Pro subscription ($20/month via Stripe) unlocks unlimited renders and priority queue placement.
- **Stripe Integration**: Full subscription lifecycle -- checkout, billing portal, webhook handling for status changes.

### Platform
- **Google/GitHub/X OAuth**: Quick signup with social providers via Supabase Auth.
- **Admin Dashboard**: Full user management (search, filter, ban/unban, adjust render counts), platform stats (MRR, signups, conversion rate, render volume), and trade oversight.
- **Async Render Queue**: BullMQ + Upstash Redis job queue with priority (Pro users first), progress tracking, retry logic, and download management.

---

## Target Audience

### Primary: Solana Memecoin Traders (Degens)
- **Demographics**: 18-35, predominantly male, crypto-native, active on Twitter/X
- **Behavior**: Trade memecoins on Solana daily, chase 10x-100x pumps, celebrate wins publicly on Crypto Twitter (CT)
- **Pain Point**: Hit a massive trade but have no proof. Screenshots are static, screen recordings are clunky, and they often forget to record before the trade happens.
- **Motivation**: Social validation, building a trading reputation, attracting followers/copiers, bragging rights
- **Tech Comfort**: High -- familiar with wallets, DEXes, Solscan, Phantom

### Secondary: Crypto Content Creators & Trading Educators
- **Demographics**: 20-40, building an audience around trading content
- **Behavior**: Create Twitter threads, YouTube videos, and Discord community content about trades
- **Pain Point**: Need professional-looking trade visualizations without manual chart annotation or complex video editing
- **Motivation**: Content that gets engagement, builds authority, and attracts paid community members
- **Tech Comfort**: Very high -- use multiple tools for content creation

### Tertiary: Trading Groups & Alpha Callers
- **Behavior**: Run paid Discord/Telegram groups, need to prove their trade calls
- **Pain Point**: Need verifiable trade proof that looks professional and is hard to fake
- **Motivation**: Credibility, subscriber retention, marketing material

---

## User Journey

1. **Sign Up**: User lands on marketing page, signs up with Google/GitHub/X (one click), redirected to dashboard.
2. **Input Trade**: User pastes entry transaction hash and exit transaction hash from their Phantom wallet or Solscan.
3. **Auto-Load Chart**: System parses both transactions via Helius API, identifies the token, fetches chart data via Birdeye API, and loads the candlestick chart with entry/exit markers pre-placed.
4. **Preview & Customize**: User sees the interactive chart with playback controls. Can adjust timeframe (1m to 1d), date range, and playback speed. Watches the replay with P&L card animation.
5. **Render Video**: User clicks "Generate Video." Job enters BullMQ queue, renders server-side via Remotion on EC2. Progress shown in real-time modal (queue position, processing %, download ready).
6. **Download & Share**: User downloads the MP4 clip and shares on Twitter/X, Discord, or saves for later. Can also save the trade to their profile and make it public for the leaderboard.

---

## Unique Value Proposition

**"Turn your Solana trades into shareable video replays -- no recording needed."**

Unlike screen recording (OBS, Loom) or screenshot annotation, Clips works retroactively. You don't need to be recording when the trade happens. Just paste your transaction hashes after the fact, and Clips reconstructs the entire chart replay with professional quality. It's the only tool that:

1. **Works after the trade** -- no pre-recording required
2. **Auto-verifies** -- pulls real on-chain data, not fabricated screenshots
3. **Creates video, not images** -- animated chart replay is far more engaging than static screenshots
4. **Includes branded P&L overlay** -- professional-looking results without any video editing

The closest alternatives are manual chart screenshots (low quality, easy to fake) or screen recordings (requires forethought, raw footage quality).

---

## Virality Vectors

- **Inherent Shareability**: Every output is designed to be shared on social media. The video format with animated P&L reveal is engineered for engagement.
- **Social Proof Loop**: User shares clip on CT -> followers see impressive trade -> want to make their own clips -> sign up. The product IS the marketing.
- **Leaderboard Competition**: Public leaderboard creates competition. Traders want to be on top, driving them to save and publicize their best trades.
- **Profile Pages**: `/u/[username]` pages give traders a portfolio of their wins, shareable as a "trading resume."
- **Watermark as Marketing**: Free-tier videos include a branded watermark, turning every shared clip into an ad for the product.
- **CT Culture Alignment**: Meme culture, flex culture, and the "show your PnL" tradition on CT makes this product a natural fit for organic sharing.

---

## Emotional Triggers

- **Pride & Validation**: "Look at this 10x I just hit" -- the desire to show off wins and get recognition from peers.
- **FOMO Prevention**: "I hit a 100x but forgot to record" -- Clips eliminates this regret by working retroactively.
- **Status & Reputation**: Building a public trading track record establishes authority and attracts followers.
- **Competition**: Leaderboard rankings tap into competitive drive -- traders want to be #1.
- **Ease & Relief**: "I don't need to set up recording software" -- removes friction from content creation.
- **Professionalism**: The polished video output makes even casual traders look like pros.

---

## Competitive Landscape

| Alternative | Weakness vs Clips |
|---|---|
| **Manual Screenshots** (Solscan, DEXScreener) | Static, easily faked, no animation, no P&L overlay, requires manual editing |
| **Screen Recording** (OBS, Loom) | Must be recording during the trade, raw footage quality, no P&L overlay, requires editing |
| **Chart Annotation Tools** (TradingView) | No video output, no playback animation, manual marker placement, not Solana-native |
| **PnL Trackers** (Cielo, BullX) | Show P&L but don't create video content. No chart replay, no animated visualization |
| **No direct competitor** | No tool specifically creates retroactive chart replay videos from on-chain Solana transactions |

**Clips wins because**: It's the only tool that creates professional, animated chart replay videos from on-chain Solana data retroactively, with zero recording setup required.

---

## Key Messaging Themes

- **Theme 1: "Show Off Your Wins"** -- Tap into the flex culture of CT. Your trades deserve to be seen.
- **Theme 2: "No Recording Needed"** -- The key differentiator. Works after the trade, not during. Never miss a replay.
- **Theme 3: "Professional Quality, Zero Effort"** -- Paste two hashes, get a cinema-quality chart replay video. No editing skills needed.
- **Theme 4: "Prove It Happened"** -- On-chain verified trades. Not screenshots. Not trust-me-bro. Real data.
- **Theme 5: "Built for CT"** -- Made by traders, for traders. Understands the culture, the memes, the flex.
