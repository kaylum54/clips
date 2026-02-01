# Changelog

All notable changes to the Clips project will be documented in this file.

## [Unreleased]

### Added - 2026-02-01: Full Project Review
- Comprehensive codebase review completed (25 findings across P0-P3)
- Documented all security vulnerabilities, architecture issues, and improvement opportunities

### Security Issues Identified
- **P0:** RLS privilege escalation on profiles (UPDATE missing WITH CHECK)
- **P0:** increment_render_count SECURITY DEFINER function exploitable
- **P0:** Open redirects in auth callback and login routes
- **P1:** Stripe webhook secret is a placeholder
- **P1:** Render limit enforced client-side only (fails open)
- **P2:** PostgREST filter injection in admin search

### Issues Identified
- **P0:** BASE_INTERVAL_MS mismatch (100ms vs 200ms hardcoded in 5 files)
- **P0:** Missing OG image file (referenced but does not exist)
- **P1:** Legacy sync render-video route should be deleted
- **P1:** FREE_RENDER_LIMIT duplicated across 5 files
- **P1:** Videos stored on /tmp (lost on restart)
- **P2:** render_jobs not in generated types (used as any)
- **P2:** Flat component directory (27 files)
- **P2:** No structured data / JSON-LD, missing SEO metadata
- **P3:** No tests, no CI/CD, no error boundaries, no env validation

---

## [1.0.0] - Pre-review baseline

### Existing Features
- Solana trade replay video generation from buy/sell tx hashes
- Remotion-based animated chart rendering with BullMQ async queue
- Supabase PKCE auth with profiles, trades, and render_jobs tables
- RLS enabled on all tables
- Free tier with render limits, Pro tier with unlimited renders and priority queue
- Stripe integration for Pro subscriptions
- Admin panel for user management
- Public leaderboard
- Landing page (rated 8/10)
- Deployed on AWS EC2 with Nginx + PM2
