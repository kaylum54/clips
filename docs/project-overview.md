# Project Overview

## Project Name
Clips

## Description
Clips is a Solana trade replay video SaaS. Users paste buy and sell transaction hashes, the app fetches candle data via Helius API, renders an animated chart replay video using Remotion, and lets users download or share the result. Pro users get unlimited renders, public trades, replay from saved trades, and priority queue.

## Goals
- [x] Core trade replay video generation from Solana tx hashes
- [x] Free tier with render limits, Pro tier with unlimited renders
- [x] BullMQ job queue with priority for Pro users
- [x] Supabase auth (PKCE flow) and database
- [ ] Fix P0 security issues (RLS, open redirects, SECURITY DEFINER)
- [ ] Remove legacy sync render route
- [ ] Persistent video storage (currently /tmp, lost on restart)
- [ ] Add tests and CI/CD pipeline
- [ ] SEO improvements (JSON-LD, OG image, metadata)

## Tech Stack
| Category | Technology |
|----------|------------|
| Frontend | Next.js 16, React 19, TailwindCSS |
| Video | Remotion |
| Backend | Next.js API routes (18 routes), BullMQ worker |
| Database | Supabase (Postgres + Auth) |
| Queue | BullMQ + Upstash Redis |
| Payments | Stripe |
| Blockchain | Helius API (Solana candle data) |
| Hosting | AWS EC2 Ubuntu, Nginx, PM2 |

## Repository
- Production: https://clips.promptpit.uk
- Local: C:\Users\kaylu\Projects\Clips

---
*Last updated: 2026-02-01*
