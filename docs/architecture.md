# Architecture

## System Overview
```
User -> Next.js App -> API Routes -> BullMQ Queue -> Render Worker -> Remotion -> Video
                    -> Supabase (auth, profiles, trades, render_jobs)
                    -> Helius API (Solana candle data)
                    -> Stripe (payments/subscriptions)
```

## Directory Structure
```
project-root/
├── app/            # Next.js App Router pages + 18 API routes
├── components/     # 27 React components (flat structure, needs reorganization)
├── hooks/          # 8 custom hooks
├── lib/            # Utilities (supabase clients, rate limiting, queue, stripe, admin)
├── remotion/       # Video composition components (chart replay rendering)
├── worker/         # BullMQ render worker process
├── types/          # TypeScript type definitions
└── public/         # Static assets
```

## Core Components

### Render Pipeline
- **Purpose:** Accepts tx hashes, fetches candle data, queues render job, produces video
- **Location:** `app/api/render/`, `worker/`
- **Dependencies:** BullMQ, Upstash Redis, Remotion, Helius API

### Auth System
- **Purpose:** Supabase PKCE auth flow with profiles
- **Location:** `app/api/auth/`, `lib/supabase/`
- **Dependencies:** Supabase Auth

### Trade Management
- **Purpose:** CRUD for saved trades, leaderboard
- **Location:** `app/api/trades/`, `app/api/leaderboard/`
- **Dependencies:** Supabase Postgres

## Data Flow
1. User submits buy + sell transaction hashes
2. API fetches Solana candle data from Helius
3. Render job queued in BullMQ (priority for Pro users)
4. Worker picks up job, renders video via Remotion
5. Video saved to /tmp (needs persistent storage)
6. User downloads or shares the video

## Database Schema
| Table | Purpose | Key Fields |
|-------|---------|------------|
| auth.users | Supabase managed auth | id, email |
| profiles | User profile + subscription tier | id, subscription_tier, render_count |
| trades | Saved trade data | id, user_id, buy_tx, sell_tx, token |
| render_jobs | Render job tracking | id, user_id, status, video_url |

Note: render_jobs is not in generated Supabase types (accessed as `any` throughout).

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/auth/callback | Supabase PKCE auth callback |
| GET | /api/auth/login | Auth login redirect |
| POST | /api/transaction | Fetch Solana tx data via Helius |
| GET/POST | /api/trades | CRUD for saved trades |
| POST | /api/render/start | Queue a new render job |
| GET | /api/render/status | Check render job status |
| GET | /api/renders/check | Check user render limits |
| POST | /api/renders/track | Track render usage |
| POST | /api/render-video | **LEGACY** sync render (should be deleted) |
| GET | /api/admin/users | Admin user management |
| GET | /api/leaderboard | Public trade leaderboard |
| POST | /api/stripe/webhook | Stripe webhook handler |

## External Services
| Service | Purpose |
|---------|---------|
| Supabase | Database, Auth (PKCE), RLS |
| Helius API | Solana blockchain data (candles, tx parsing) |
| Upstash Redis | BullMQ job queue backing store |
| Stripe | Pro subscription payments |

## Environment Variables
| Variable | Purpose | Required |
|----------|---------|----------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL | Yes |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anon key | Yes |
| SUPABASE_SERVICE_ROLE_KEY | Supabase admin key | Yes |
| HELIUS_API_KEY | Solana data access | Yes |
| UPSTASH_REDIS_URL | BullMQ queue | Yes |
| STRIPE_SECRET_KEY | Stripe payments | Yes |
| STRIPE_WEBHOOK_SECRET | Stripe webhook verification | Yes |
| NEXT_PUBLIC_BASE_URL | App base URL | Yes |

## Security Considerations
- Auth: Supabase PKCE flow (good)
- RLS: Enabled on all tables, but profiles UPDATE policy missing WITH CHECK (P0 bug)
- increment_render_count: SECURITY DEFINER function exploitable (P0 bug)
- Open redirects in auth callback + login routes (P0 bug)
- Rate limiting: In-memory only (not shared across instances)
- Admin: PostgREST filter injection possible in admin search

---
*Last updated: 2026-02-01*
