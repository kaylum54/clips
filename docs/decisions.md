# Decision Log

## Decisions

### [DECISION-005] In-Memory Rate Limiting
- **Date:** Pre-review
- **Status:** Accepted (needs revisiting)
- **Context:** API routes need rate limiting to prevent abuse
- **Decision:** In-memory Map-based rate limiting per route
- **Consequences:** Does not work across multiple instances. Unbounded memory growth. Sufficient for single EC2 instance for now.
- **Alternatives Considered:**
  - Upstash Redis rate limiting (better for multi-instance, adds latency)
  - Middleware-level rate limiting (more centralized)

### [DECISION-004] Stripe for Payments
- **Date:** Pre-review
- **Status:** Accepted
- **Context:** Need subscription billing for Pro tier
- **Decision:** Stripe with webhook-based subscription management
- **Consequences:** Webhook secret is currently a placeholder. Need to wire up proper secret and test webhook flow.
- **Alternatives Considered:**
  - LemonSqueezy (simpler but less flexible)

### [DECISION-003] BullMQ + Upstash Redis for Job Queue
- **Date:** Pre-review
- **Status:** Accepted
- **Context:** Video rendering is CPU-intensive and must be async. Pro users need priority.
- **Decision:** BullMQ with Upstash Redis as backing store, separate worker process managed by PM2
- **Consequences:** Good priority queue support. Worker runs as separate PM2 process on same EC2 instance. Upstash Redis is serverless so no Redis ops overhead.
- **Alternatives Considered:**
  - Direct Remotion render in API route (legacy sync route still exists, should be deleted)
  - AWS SQS + Lambda (more complex, cold start issues with Remotion)

### [DECISION-002] Remotion for Video Rendering
- **Date:** Pre-review
- **Status:** Accepted
- **Context:** Need to generate animated chart replay videos from trade data
- **Decision:** Remotion (React-based video renderer) for server-side video generation
- **Consequences:** High quality output, React component model is natural for the team. CPU-intensive, requires dedicated worker. Videos currently saved to /tmp (not persistent).
- **Alternatives Considered:**
  - FFmpeg with canvas (lower level, harder to maintain)
  - Client-side rendering (unreliable, slow)

### [DECISION-001] Supabase for Auth and Database
- **Date:** Pre-review
- **Status:** Accepted
- **Context:** Need auth, database, and RLS for a SaaS application
- **Decision:** Supabase with PKCE auth flow, Postgres with RLS on all tables
- **Consequences:** Good developer experience, built-in RLS. However: RLS policies have gaps (profiles UPDATE missing WITH CHECK, SECURITY DEFINER function exploitable). Generated types do not include render_jobs table.
- **Alternatives Considered:**
  - Firebase (less SQL-friendly)
  - Auth0 + separate Postgres (more moving parts)
