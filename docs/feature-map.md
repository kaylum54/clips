# Feature Map: Clips

## Complete Feature Inventory

---

## 1. Authentication & User Management

### 1.1 Authentication
| Feature | Location | API Integration |
|---|---|---|
| Email/password signup | `app/auth/signup/page.tsx` | Supabase Auth |
| Email/password login | `app/auth/login/page.tsx` | Supabase Auth |
| Google OAuth | `app/auth/login/page.tsx`, `app/auth/signup/page.tsx` | Supabase Auth (PKCE) |
| GitHub OAuth | `app/auth/login/page.tsx`, `app/auth/signup/page.tsx` | Supabase Auth (PKCE) |
| X (Twitter) OAuth | `app/auth/login/page.tsx`, `app/auth/signup/page.tsx` | Supabase Auth (PKCE) |
| Password reset flow | `app/auth/reset-password/page.tsx` | Supabase Auth |
| Auth callback handler | `app/auth/callback/route.ts` | Supabase Auth |
| Session management | `components/AuthProvider.tsx` | Supabase Auth |
| Route protection | `middleware.ts` | Supabase Auth |

### 1.2 User Profile
| Feature | Location | Notes |
|---|---|---|
| Profile data (email, username, avatar) | `profiles` table | Auto-created on signup |
| Subscription status tracking | `profiles.subscription_status` | Updated via Stripe webhooks |
| Monthly render counter | `profiles.renders_this_month` | Incremented on render, reset monthly |
| Admin flag | `profiles.is_admin` | Grants admin dashboard access |
| Ban flag | `profiles.is_banned` | Blocks all authenticated actions |
| Public profile pages | `app/u/[username]/page.tsx` | Shows public trades and stats |

---

## 2. Chart & Visualization

### 2.1 Candlestick Chart
| Feature | Component | API Integration |
|---|---|---|
| Interactive candlestick chart | `components/Chart.tsx` | lightweight-charts library |
| Memecoin price handling (tiny decimals) | `components/Chart.tsx` | Custom price formatter |
| Responsive chart sizing | `components/Chart.tsx` | Window resize listener |
| Green up / red down candles | `components/Chart.tsx` | lightweight-charts config |
| Price axis (right side) | `components/Chart.tsx` | Auto-scaled |
| Time axis (bottom) | `components/Chart.tsx` | Formatted timestamps |
| Grid lines | `components/Chart.tsx` | Subtle grid pattern |
| Crosshair cursor | `components/Chart.tsx` | Active during marker placement |

### 2.2 Chart Data
| Feature | Hook/Location | API Integration |
|---|---|---|
| Fetch OHLCV candle data | `hooks/useCandleData.ts` | Birdeye API via `/api/candles` |
| Timeframe selection (1m, 5m, 15m, 1h, 4h, 1d) | `components/TimeframeSelector.tsx` | Birdeye API param |
| Date range selection (2h, 6h, 24h, 7d, 30d, max) | `components/DateRangeSelector.tsx` | Birdeye API param |
| Display mode (Price vs Market Cap) | `components/DisplayModeSelector.tsx` | Token supply from Birdeye |
| Token info fetching (name, symbol, supply) | `hooks/useCandleData.ts` | Birdeye token_overview |
| 30-second in-memory candle cache | `app/api/candles/route.ts` | Reduces API calls |
| Exponential backoff on rate limits | `hooks/useCandleData.ts` | 1s, 2s, 4s retry delays |
| Custom time range support | `hooks/useCandleData.ts` | timeFrom/timeTo params |

### 2.3 Playback System
| Feature | Hook/Component | Notes |
|---|---|---|
| Play / Pause | `hooks/usePlayback.ts`, `components/PlaybackControls.tsx` | Interval-based animation |
| Step forward / backward | `hooks/usePlayback.ts`, `components/PlaybackControls.tsx` | Single candle steps |
| Jump to start / end | `hooks/usePlayback.ts`, `components/PlaybackControls.tsx` | Instant seek |
| Speed control (1x, 2x, 5x, 10x) | `hooks/usePlayback.ts`, `components/SpeedSelector.tsx` | Changes interval timing |
| Timeline scrubbing | `components/Timeline.tsx` | Mouse/touch drag |
| Progress percentage | `hooks/usePlayback.ts` | 0-100% calculation |
| Auto-stop at end | `hooks/usePlayback.ts` | Prevents overrun |
| Keyboard shortcuts | `hooks/useKeyboardControls.ts` | Space, arrows, F, 1/2/5 |
| Fullscreen mode | `hooks/useFullscreen.ts`, `components/FullscreenButton.tsx` | Auto-hide controls |

### 2.4 Trade Markers
| Feature | Hook/Component | Notes |
|---|---|---|
| Manual entry marker placement | `hooks/useMarkers.ts`, `components/MarkerControls.tsx` | Click on chart to place |
| Manual exit marker placement | `hooks/useMarkers.ts`, `components/MarkerControls.tsx` | Click on chart to place |
| Automatic marker placement | `hooks/useMarkers.ts` | From parsed transactions |
| P&L calculation | `hooks/useMarkers.ts` | (exit - entry) / entry * 100 |
| Marker clear / reset | `hooks/useMarkers.ts`, `components/MarkerControls.tsx` | Remove individual or all |
| Visual markers on chart | `components/Chart.tsx` | Circle markers below/above candles |
| P&L card overlay | `components/TradeStats.tsx` | Branded background image |

---

## 3. Transaction Parsing

### 3.1 Transaction Input
| Feature | Component | API Integration |
|---|---|---|
| Single address input | `components/AddressInput.tsx` | Token address or tx sig detection |
| Dual transaction hash input | `components/TransactionInput.tsx` | Entry + exit hash pair |
| Transaction signature validation | `components/TransactionInput.tsx` | Format + length check |
| How-to guide (collapsible) | `components/TransactionInput.tsx` | Phantom/Solscan instructions |

### 3.2 Transaction Processing
| Feature | Location | API Integration |
|---|---|---|
| Parse swap transactions | `app/api/transaction/route.ts` | Helius API |
| Buy/sell detection | `app/api/transaction/route.ts` | SOL direction analysis |
| Token address extraction | `app/api/transaction/route.ts` | From swap events |
| Price calculation (SOL per token) | `app/api/transaction/route.ts` | Amount ratio |
| Fallback token transfer analysis | `app/api/transaction/route.ts` | If swap event unavailable |
| Same-token validation | `components/TransactionInput.tsx` | Client-side check |
| Entry-before-exit validation | `components/TransactionInput.tsx` | Timestamp comparison |

---

## 4. Video Rendering

### 4.1 Render Initiation
| Feature | Location | Notes |
|---|---|---|
| Render limit check | `hooks/useRenderLimit.ts`, `app/api/renders/check/route.ts` | Free: 5/month, Pro: unlimited |
| Start render job | `hooks/useRenderJob.ts`, `app/api/render/start/route.ts` | Creates DB record + queue job |
| Rate limiting (5 renders/min) | `app/api/render/start/route.ts` | Redis sliding window |
| Pro priority queue | `lib/queue/render-queue.ts` | Priority 1 (Pro) vs 10 (Free) |
| Upgrade modal | `components/UpgradeModal.tsx` | Shown when limit reached |

### 4.2 Render Queue
| Feature | Location | Notes |
|---|---|---|
| BullMQ job queue | `lib/queue/render-queue.ts` | Redis-backed, persistent |
| Queue position tracking | `app/api/render/status/[jobId]/route.ts` | Real-time position |
| Estimated wait time | `app/api/render/status/[jobId]/route.ts` | Based on position |
| 3 automatic retries | `lib/queue/render-queue.ts` | Exponential backoff |
| Automatic cleanup | `lib/queue/render-queue.ts` | 1h success, 24h failure |
| Concurrency control | `worker/index.ts` | WORKER_CONCURRENCY env var |

### 4.3 Video Composition (Remotion)
| Feature | Location | Notes |
|---|---|---|
| Candlestick chart rendering | `remotion/components/CandlestickCanvas.tsx` | Canvas-based for performance |
| Progressive candle reveal | `remotion/compositions/ChartReplay.tsx` | Frame-based timing |
| Entry marker (visible from start) | `remotion/compositions/ChartReplay.tsx` | Green BUY badge |
| Exit marker (appears when reached) | `remotion/compositions/ChartReplay.tsx` | Red SELL badge |
| P&L card slide-in animation | `remotion/compositions/ChartReplay.tsx` | 30 frames after exit |
| Token symbol display | `remotion/compositions/ChartReplay.tsx` | Top-left overlay |
| Watermark (free users) | `remotion/compositions/ChartReplay.tsx` | Center, behind candles, 40% width |
| Grid lines and axes | `remotion/components/CandlestickCanvas.tsx` | Price and time formatting |
| Marker glow/shadow effects | `remotion/components/CandlestickCanvas.tsx` | Professional polish |

### 4.4 Render Progress & Download
| Feature | Hook/Component | Notes |
|---|---|---|
| Real-time progress modal | `components/RenderProgressModal.tsx` | Status-aware UI |
| Queue position display | `components/RenderProgressModal.tsx` | Clock icon, position |
| Progress bar (0-100%) | `components/RenderProgressModal.tsx` | Processing phase |
| Download button | `components/RenderProgressModal.tsx` | When completed |
| Retry on failure | `components/RenderProgressModal.tsx` | User-initiated |
| Auto-generated filename | `hooks/useRenderJob.ts` | Token + timestamp |
| 2-second polling interval | `hooks/useRenderJob.ts` | Status check loop |

---

## 5. Trade Management

### 5.1 Save & Organize
| Feature | Component/Location | Notes |
|---|---|---|
| Save trade modal | `components/SaveTradeModal.tsx` | Name + public toggle |
| Auto-generated trade name | `components/SaveTradeModal.tsx` | If user leaves blank |
| Public/private toggle (Pro only) | `components/SaveTradeModal.tsx` | Gated behind subscription |
| My Trades page | `app/trades/page.tsx` | List with pagination |
| Delete trade | `app/trades/page.tsx` | With confirmation |
| Replay saved trade | `app/trades/page.tsx` | Navigate to dashboard with data |
| Duplicate prevention | `app/api/trades/route.ts` | Unique entry+exit hash combo |

### 5.2 Sharing
| Feature | Component | Notes |
|---|---|---|
| Share on X (Twitter) | `components/ShareButton.tsx` | Pre-formatted tweet text |
| Copy link to clipboard | `components/ShareButton.tsx` | With feedback toast |
| Trade URL generation | `components/ShareButton.tsx` | Shareable link |

---

## 6. Leaderboard & Social

### 6.1 Leaderboard
| Feature | Location | Notes |
|---|---|---|
| Top trades by P&L % | `app/leaderboard/page.tsx`, `components/Leaderboard.tsx` | Sorted descending |
| Period filtering (today/week/month/all) | `components/Leaderboard.tsx` | Tab-based filter |
| Rank badges (gold/silver/bronze) | `components/LeaderboardEntry.tsx` | Top 3 medals |
| Pagination (load more) | `components/Leaderboard.tsx` | 50 per page |
| Trader avatars & usernames | `components/LeaderboardEntry.tsx` | Link to profile |
| Public endpoint (no auth) | `app/api/leaderboard/route.ts` | Anyone can view |

### 6.2 Public Profiles
| Feature | Location | Notes |
|---|---|---|
| Profile page at `/u/[username]` | `app/u/[username]/page.tsx` | SEO-friendly URL |
| Avatar and join date | `app/u/[username]/page.tsx` | From profiles table |
| Stats: total trades, best trade, avg gain, win rate | `app/u/[username]/page.tsx` | Calculated from trades |
| Public trade list with P&L | `app/u/[username]/page.tsx` | Only is_public trades |
| Profile not found handling | `app/u/[username]/page.tsx` | 404 graceful error |

---

## 7. Monetization (Stripe)

| Feature | Location | API Integration |
|---|---|---|
| Pro subscription ($20/month) | `app/api/stripe/checkout/route.ts` | Stripe Checkout |
| Customer creation (or reuse) | `lib/stripe.ts` | Stripe Customers API |
| Billing portal access | `app/api/stripe/portal/route.ts` | Stripe Portal |
| Webhook event handling | `app/api/stripe/webhook/route.ts` | 5 event types |
| Subscription status sync | `app/api/stripe/webhook/route.ts` | Updates profiles table |
| Duplicate subscription prevention | `app/api/stripe/checkout/route.ts` | Checks active subs first |
| Usage display (renders remaining) | `components/UsageDisplay.tsx` | Progress bar, color-coded |
| Upgrade prompt | `components/UpgradeModal.tsx` | Benefits list, pricing |

---

## 8. Admin Dashboard

| Feature | Location | Notes |
|---|---|---|
| Admin layout with sidebar | `app/admin/layout.tsx`, `components/admin/Sidebar.tsx` | Protected route |
| Overview stats | `app/admin/page.tsx` | MRR, users, renders, trades |
| User management (search, filter) | `app/admin/users/page.tsx` | By status, username, email |
| User detail view | `app/admin/users/[id]/page.tsx` | Full user profile |
| Ban/unban users | `app/admin/users/[id]/page.tsx` | Toggle with confirmation |
| Adjust render count | `app/admin/users/[id]/page.tsx` | Manual override |
| Trades oversight | `app/admin/trades/page.tsx` | Top 100 by P&L, period filter |
| Stats cards | `components/admin/StatsCard.tsx` | Reusable metric display |
| Users table | `components/admin/UsersTable.tsx` | Sortable, actionable |

---

## 9. UI Components

### 9.1 Dashboard Layout
| Component | Location | Purpose |
|---|---|---|
| DashboardHeader | `components/dashboard/DashboardHeader.tsx` | Top nav with user menu, usage display |
| DashboardSidebar | `components/dashboard/DashboardSidebar.tsx` | Side nav (Create, Trades, Leaderboard) |
| GridBackground | `components/ui/GridBackground.tsx` | Subtle grid pattern with glow |

### 9.2 Landing Page
| Component | Location | Purpose |
|---|---|---|
| Navbar | `components/landing/Navbar.tsx` | Marketing nav, scroll-aware styling |
| Hero | `components/landing/Hero.tsx` | Main headline, CTA, browser mockup |
| BrowserMockup | `components/landing/BrowserMockup.tsx` | Chrome frame for demo |
| HowItWorks | `components/landing/HowItWorks.tsx` | Step-by-step guide |
| Pricing | `components/landing/Pricing.tsx` | Free vs Pro comparison |
| FAQ | `components/landing/FAQ.tsx` | Accordion Q&A |
| CTA | `components/landing/CTA.tsx` | Final call-to-action |
| Footer | `components/landing/Footer.tsx` | Links, copyright, social |

### 9.3 Shared UI
| Component | Location | Purpose |
|---|---|---|
| LoadingSpinner | `components/LoadingSpinner.tsx` | Reusable spinner (sm/md/lg) |
| SpotlightCard | `components/ui/SpotlightCard.tsx` | Mouse-following spotlight effect |
| AnimatedCounter | `components/ui/AnimatedCounter.tsx` | Spring-animated numbers |

---

## 10. Infrastructure & Security

### 10.1 Rate Limiting
| Implementation | Location | Limits |
|---|---|---|
| In-memory rate limiter | `lib/rate-limit.ts` | General API: 30 req/min |
| Redis sliding window | `lib/rate-limit-redis.ts` | Render: 5/min, Checkout: 3/min |
| Per-user and per-IP | Both | Identifies by auth or IP |

### 10.2 Input Validation
| Validation | Location | Method |
|---|---|---|
| API input schemas | All API routes | Zod schema validation |
| Solana address format | `lib/validation.ts` | Base58, 32-44 chars |
| Transaction signature format | `components/TransactionInput.tsx` | Length + format check |
| Query parameter whitelisting | API routes | Zod enum validation |

### 10.3 Database Access
| Client | Location | Purpose |
|---|---|---|
| Browser client (anon key) | `lib/supabase/client.ts` | Client-side, RLS enforced |
| Server client (anon key) | `lib/supabase/server.ts` | API routes, cookie-based auth |
| Admin client (service role) | `lib/supabase/admin.ts` | Bypass RLS for admin operations |
| Middleware client | `lib/supabase/middleware.ts` | Session refresh |

### 10.4 Worker System
| Feature | Location | Notes |
|---|---|---|
| BullMQ worker process | `worker/index.ts` | Separate process on EC2 |
| Remotion video processor | `worker/processor.ts` | Headless Chrome rendering |
| Bundle caching (30min) | `worker/processor.ts` | Speeds up subsequent renders |
| Graceful shutdown | `worker/index.ts` | SIGTERM/SIGINT handlers |
| Progress callbacks | `worker/processor.ts` | Real-time DB updates |
| TLS Redis connection | `lib/queue/connection.ts` | Upstash requirement |

---

## 11. Data Flow Summary

```
User Input (TX Hashes)
    |
    v
Helius API --> Parse swap data (token, amounts, prices)
    |
    v
Birdeye API --> Fetch OHLCV candles for token
    |
    v
Interactive Chart (lightweight-charts)
    |-- Manual or auto marker placement
    |-- Playback with controls
    |
    v
Render Request --> BullMQ Queue (Redis)
    |
    v
Worker (EC2) --> Remotion + Chrome
    |-- Canvas-based chart rendering
    |-- Progressive candle reveal
    |-- P&L card animation
    |-- Watermark (free users)
    |
    v
MP4 Video --> Download / Share on CT
    |
    v
Save Trade --> Supabase DB
    |-- Public: appears on Leaderboard
    |-- Profile: visible at /u/username
```

---

## 12. Environment Dependencies

| Service | Purpose | Required |
|---|---|---|
| Supabase | Database + Auth | Yes |
| Birdeye API | Token candle data | Yes |
| Helius API | Transaction parsing | Yes |
| Stripe | Payments/subscriptions | Yes (for Pro features) |
| Upstash Redis | Job queue + rate limiting | Yes (for rendering) |
| EC2 (or similar) | Worker process | Yes (for rendering) |
| Chrome/Chromium | Remotion rendering | Yes (on worker) |
