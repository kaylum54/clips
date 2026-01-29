# Clips - Multi-Agent Product Enhancement Pipeline

## Mission

You are orchestrating a team of specialized AI agents to analyze, enhance, and create marketing assets for "Clips" - a web-based tool for Solana memecoin traders to create chart replay videos of their trades. Each agent has a specific role and reports to a Security Agent who reviews all code and outputs before implementation.

---

## Agent Architecture

```
                    ┌─────────────────────┐
                    │   SECURITY AGENT    │
                    │   (Final Review)    │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   PRODUCT     │    │  COPYWRITING  │    │     SEO       │
│   ANALYST     │    │    AGENT      │    │    AGENT      │
└───────┬───────┘    └───────┬───────┘    └───────┬───────┘
        │                    │                    │
        │                    ▼                    │
        │           ┌───────────────┐             │
        └──────────▶│    DEMO       │◀────────────┘
                    │    AGENT      │
                    └───────────────┘
```

**Execution Order:**
1. Product Analyst → analyzes codebase and defines product understanding
2. Copywriting Agent → uses product analysis to craft landing page copy
3. SEO Agent → audits and optimizes for search
4. Demo Agent → captures screenshots and builds demo videos
5. Security Agent → reviews ALL outputs from each agent before merge

---

## Agent 1: Product Analyst

### Role
Deep-dive into the codebase to understand exactly what Clips does, who it's for, and what makes it shareable/viral.

### Tasks

**1.1 Codebase Analysis**
```
- Read all source files in the project
- Map out the complete feature set
- Identify the core user journey
- Document all UI components and their purposes
- List all API integrations (Birdeye, Solana, etc.)
- Understand the data flow from CA input → chart replay
```

**1.2 Create Product Brief**
Output a structured document containing:

```markdown
## Product Brief: Clips

### What It Does
[One paragraph summary of core functionality]

### Key Features
- Feature 1: [description]
- Feature 2: [description]
- Feature 3: [description]

### Target Audience
- Primary: [detailed persona]
- Secondary: [detailed persona]

### User Journey
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Unique Value Proposition
[What makes this different from alternatives]

### Virality Vectors
- [Why users would share this]
- [Built-in viral mechanics]
- [Social proof opportunities]

### Emotional Triggers
- [What feelings does this product tap into]
- [Pain points it solves]
- [Desires it fulfills]

### Competitive Landscape
- [Alternatives users currently use]
- [Why Clips is better]

### Key Messaging Themes
- Theme 1: [e.g., "Show off your wins"]
- Theme 2: [e.g., "No recording needed"]
- Theme 3: [e.g., "Professional quality"]
```

**1.3 Virality Analysis**
Specifically analyze:
```
- What makes CT (Crypto Twitter) content go viral?
- How does Clips enable viral content creation?
- What psychological triggers drive sharing in trading communities?
- How can the product itself encourage sharing?
- What hooks would resonate with memecoin traders?
```

### Output Files
- `/docs/product-brief.md`
- `/docs/virality-analysis.md`
- `/docs/feature-map.md`

### Handoff
Pass all outputs to Copywriting Agent and Demo Agent.

---

## Agent 2: Copywriting Agent

### Role
Analyze the current landing page structure and rewrite all copy to maximize conversions, using insights from the Product Analyst.

### Inputs Required
- Product Brief from Agent 1
- Virality Analysis from Agent 1
- Current landing page code/structure

### Tasks

**2.1 Landing Page Audit**
```
- Screenshot or map the current landing page structure
- Identify all copy touchpoints:
  - Hero headline
  - Hero subtext
  - CTAs (all of them)
  - Feature descriptions
  - How it works steps
  - Trust elements
  - Footer
  - Meta title/description
- Score current copy on:
  - Clarity (1-10)
  - Emotional impact (1-10)
  - Specificity (1-10)
  - Call-to-action strength (1-10)
```

**2.2 Competitor Copy Analysis**
```
- Research 3-5 similar tools (trading tools, content creation tools)
- Analyze their messaging approaches
- Identify gaps and opportunities
```

**2.3 Rewrite Landing Page Copy**

For each section, provide 3 variations ranked by approach:

```markdown
## Hero Section

### Headline
**Option A (Benefit-led):**
"Turn Your Trades Into Content That Goes Viral"

**Option B (Problem-solution):**
"Hit a 10x But Forgot to Record? We Got You."

**Option C (Social proof):**
"The Tool CT Traders Use to Flex Their Wins"

**Recommended:** [Option X] because [reasoning]

### Subtext
**Option A:**
[Copy]

**Option B:**
[Copy]

**Option C:**
[Copy]

### Primary CTA
**Option A:** "Create Your First Clip"
**Option B:** "Replay Your Last Trade"
**Option C:** "Start Flexing"

[Continue for all sections...]
```

**2.4 Microcopy Audit**
```
- Button labels throughout the app
- Empty states
- Error messages
- Success messages
- Tooltips
- Form labels and placeholders
```

**2.5 Voice & Tone Guidelines**
```markdown
## Clips Voice & Tone

### Brand Voice
- [Characteristic 1]
- [Characteristic 2]
- [Characteristic 3]

### Do's
- [Example]

### Don'ts
- [Example]

### Example Phrases
- Instead of "Submit" → "Let's Go"
- Instead of "Error occurred" → "Something went wrong - try again"
```

### Output Files
- `/docs/copy-audit.md`
- `/docs/landing-page-copy-v2.md`
- `/docs/microcopy-guide.md`
- `/docs/voice-tone-guidelines.md`

### Implementation
Create a PR-ready changeset with all copy updates to:
- `app/page.tsx` (landing page)
- `app/dashboard/page.tsx` (if applicable)
- Any component files with hardcoded copy

### Handoff
Pass landing page structure and copy to SEO Agent.

---

## Agent 3: SEO Agent

### Role
Comprehensive SEO audit and implementation to ensure Clips ranks for relevant search terms.

### Tasks

**3.1 Technical SEO Audit**
```
Analyze and fix:
- [ ] Meta titles (unique per page, <60 chars)
- [ ] Meta descriptions (unique per page, <160 chars)
- [ ] Open Graph tags (og:title, og:description, og:image)
- [ ] Twitter Card tags
- [ ] Canonical URLs
- [ ] Robots.txt configuration
- [ ] Sitemap.xml generation
- [ ] Structured data (JSON-LD)
- [ ] Heading hierarchy (single H1 per page)
- [ ] Image alt texts
- [ ] Internal linking structure
- [ ] 404 page
- [ ] Loading performance (Core Web Vitals)
- [ ] Mobile responsiveness
```

**3.2 Keyword Research**
```markdown
## Target Keywords

### Primary Keywords (High Intent)
| Keyword | Volume | Difficulty | Intent |
|---------|--------|------------|--------|
| [keyword] | [vol] | [diff] | [intent] |

### Secondary Keywords (Awareness)
| Keyword | Volume | Difficulty | Intent |
|---------|--------|------------|--------|

### Long-tail Keywords
| Keyword | Volume | Difficulty | Intent |
|---------|--------|------------|--------|

### Competitor Keywords
[What competitors rank for that we should target]
```

**3.3 On-Page SEO Implementation**
```typescript
// Example: app/layout.tsx metadata
export const metadata: Metadata = {
  title: 'Clips - Turn Solana Trades Into Shareable Chart Replays',
  description: 'Create professional chart replay videos from your Solana memecoin trades. Mark entries, exits, and share your wins on Twitter.',
  keywords: ['solana trading', 'chart replay', 'crypto content', 'trading clips'],
  openGraph: {
    title: 'Clips - Shareable Trade Replays',
    description: 'Turn your Solana trades into viral content',
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clips - Shareable Trade Replays',
    description: 'Turn your Solana trades into viral content',
    images: ['/twitter-card.png'],
  },
}
```

**3.4 Content Recommendations**
```markdown
## Content Opportunities

### Blog Posts to Create
1. [Title] - targets [keyword]
2. [Title] - targets [keyword]

### FAQ Schema Opportunities
- Q: [Question targeting keyword]
- A: [Answer]

### Landing Page Additions
- [Section that would help SEO]
```

**3.5 Performance Audit**
```
- Run Lighthouse audit
- Check Core Web Vitals
- Identify render-blocking resources
- Image optimization check
- Bundle size analysis
```

### Output Files
- `/docs/seo-audit.md`
- `/docs/keyword-research.md`
- `/docs/seo-implementation-checklist.md`
- `app/layout.tsx` (updated with metadata)
- `app/robots.ts`
- `app/sitemap.ts`
- `public/og-image.png` (spec for creation)

### Handoff
Provide page structure and key messaging to Demo Agent.

---

## Agent 4: Demo Agent

### Role
Use Puppeteer to capture the product in action, then use Remotion to create demo videos showcasing key features.

### Tasks

**4.1 Screenshot Capture Plan**
```markdown
## Screenshots Needed

### Landing Page
- [ ] Full page hero (desktop)
- [ ] Full page hero (mobile)
- [ ] How it works section
- [ ] Pricing section (if exists)

### Dashboard - Empty State
- [ ] Initial dashboard view
- [ ] Input form focused

### Dashboard - With Data
- [ ] Chart loaded (no markers)
- [ ] Chart with entry marker placed
- [ ] Chart with entry + exit markers
- [ ] Chart mid-playback (entry visible)
- [ ] Chart end-playback (P&L visible)
- [ ] Playback controls highlighted
- [ ] Speed selector in use
- [ ] Fullscreen mode

### Key Moments
- [ ] Entry marker appearing (animation frame)
- [ ] Exit marker appearing (animation frame)
- [ ] P&L card reveal
```

**4.2 Puppeteer Screenshot Script**
```typescript
// scripts/capture-screenshots.ts

import puppeteer from 'puppeteer';

const screenshots = [
  {
    name: 'dashboard-empty',
    url: 'http://localhost:3000/dashboard',
    waitFor: '.chart-container',
    viewport: { width: 1920, height: 1080 }
  },
  {
    name: 'dashboard-with-chart',
    url: 'http://localhost:3000/dashboard',
    actions: async (page) => {
      // Paste a test CA
      await page.type('#token-input', 'TEST_TOKEN_ADDRESS');
      await page.click('#load-button');
      await page.waitForSelector('.candlestick-chart');
    },
    viewport: { width: 1920, height: 1080 }
  },
  // ... more screenshot configs
];

async function captureAll() {
  const browser = await puppeteer.launch();
  
  for (const shot of screenshots) {
    const page = await browser.newPage();
    await page.setViewport(shot.viewport);
    await page.goto(shot.url);
    
    if (shot.waitFor) {
      await page.waitForSelector(shot.waitFor);
    }
    
    if (shot.actions) {
      await shot.actions(page);
    }
    
    await page.screenshot({ 
      path: `./captures/${shot.name}.png`,
      fullPage: shot.fullPage || false
    });
    
    await page.close();
  }
  
  await browser.close();
}

captureAll();
```

**4.3 Video Recording Script**
```typescript
// scripts/capture-video.ts

import puppeteer from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';

async function recordUserFlow() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const recorder = new PuppeteerScreenRecorder(page);
  await recorder.start('./captures/demo-flow.mp4');
  
  // Record the full user journey
  await page.goto('http://localhost:3000/dashboard');
  await page.waitForTimeout(1000);
  
  // Type CA
  await page.type('#token-input', 'TEST_TOKEN_ADDRESS', { delay: 50 });
  await page.waitForTimeout(500);
  
  // Click load
  await page.click('#load-button');
  await page.waitForSelector('.candlestick-chart');
  await page.waitForTimeout(1000);
  
  // Mark entry
  await page.click('#mark-entry-btn');
  await page.click('.chart-area', { position: { x: 300, y: 400 } });
  await page.waitForTimeout(500);
  
  // Mark exit  
  await page.click('#mark-exit-btn');
  await page.click('.chart-area', { position: { x: 700, y: 200 } });
  await page.waitForTimeout(500);
  
  // Play
  await page.click('#play-btn');
  await page.waitForTimeout(10000); // Let it play
  
  await recorder.stop();
  await browser.close();
}
```

**4.4 Remotion Demo Videos**

Create the following videos:

```markdown
## Video 1: Product Overview (30 seconds)
- Hook: "Hit a 10x but forgot to record?"
- Show: Paste CA → Chart loads → Mark entry/exit → Playback
- CTA: "Try Clips free"

## Video 2: Feature Highlight - Theatre Mode (15 seconds)
- Show: Scrubbing, speed controls, step-through
- Text overlay: "Full DVR controls"

## Video 3: Feature Highlight - Entry/Exit Markers (15 seconds)
- Show: Clicking to place markers, P&L appearing
- Text overlay: "Mark your exact trade"

## Video 4: Social Proof / Use Case (20 seconds)
- Show: Complete flow → Export moment
- Text overlay: "Share your wins on CT"
```

**4.5 Remotion Project Structure**
```
remotion/
├── src/
│   ├── compositions/
│   │   ├── ProductOverview.tsx
│   │   ├── FeatureTheatreMode.tsx
│   │   ├── FeatureMarkers.tsx
│   │   └── SocialProof.tsx
│   ├── components/
│   │   ├── ScreenCapture.tsx
│   │   ├── TextOverlay.tsx
│   │   ├── Logo.tsx
│   │   └── CTA.tsx
│   ├── assets/
│   │   ├── screenshots/
│   │   └── recordings/
│   └── Root.tsx
├── package.json
└── remotion.config.ts
```

**4.6 Remotion Composition Example**
```tsx
// remotion/src/compositions/ProductOverview.tsx

import { AbsoluteFill, Sequence, useCurrentFrame, Video, Img } from 'remotion';

export const ProductOverview: React.FC = () => {
  const frame = useCurrentFrame();
  
  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      {/* Hook text */}
      <Sequence from={0} durationInFrames={60}>
        <TextOverlay>Hit a 10x but forgot to record?</TextOverlay>
      </Sequence>
      
      {/* Product demo */}
      <Sequence from={60} durationInFrames={240}>
        <Video src={staticFile('demo-flow.mp4')} />
      </Sequence>
      
      {/* CTA */}
      <Sequence from={300} durationInFrames={60}>
        <CTA>Try Clips free at clips.app</CTA>
      </Sequence>
      
      {/* Logo watermark throughout */}
      <Logo />
    </AbsoluteFill>
  );
};
```

### Output Files
- `/captures/screenshots/` - All screenshots
- `/captures/recordings/` - Raw screen recordings
- `/remotion/` - Complete Remotion project
- `/public/videos/` - Rendered final videos
- `/docs/demo-assets-inventory.md` - List of all assets created

### Handoff
All scripts and outputs go to Security Agent for review.

---

## Agent 5: Security Agent

### Role
Review ALL code and outputs from every agent before any implementation. Ensure no vulnerabilities, no exposed secrets, no malicious code, and all outputs are safe to deploy.

### Review Checklist

**5.1 Code Review - All Agent Outputs**
```
For each file created or modified:

[ ] No hardcoded secrets or API keys
[ ] No exposed environment variables
[ ] No eval() or dangerous code execution
[ ] No external script loading from untrusted sources
[ ] No XSS vulnerabilities in copy/content
[ ] No SQL injection vectors (if applicable)
[ ] Dependencies are from trusted sources
[ ] No unnecessary permissions requested
[ ] No data being sent to external services unexpectedly
```

**5.2 Puppeteer/Automation Security**
```
[ ] Scripts only access localhost or owned domains
[ ] No credentials stored in scripts
[ ] Screenshots don't contain sensitive data
[ ] Recordings don't expose user data
[ ] Temporary files are cleaned up
```

**5.3 Remotion Security**
```
[ ] No remote code execution in compositions
[ ] Assets are locally sourced or from trusted CDNs
[ ] No user input directly rendered without sanitization
[ ] Output videos don't contain embedded scripts
```

**5.4 SEO/Metadata Security**
```
[ ] No injection vulnerabilities in meta tags
[ ] Structured data is valid JSON-LD
[ ] No sensitive info in robots.txt
[ ] Sitemap doesn't expose private routes
```

**5.5 Copy/Content Review**
```
[ ] No misleading claims
[ ] No competitor defamation
[ ] No promises the product can't deliver
[ ] Legal compliance (no unsubstantiated "best" claims etc.)
```

### Security Report Template
```markdown
## Security Review Report

### Agent: [Agent Name]
### Files Reviewed: [List]
### Date: [Date]

### Findings

#### Critical (Must Fix)
- [ ] None found / [Issue description]

#### High (Should Fix)
- [ ] None found / [Issue description]

#### Medium (Consider Fixing)
- [ ] None found / [Issue description]

#### Low (Nice to Have)
- [ ] None found / [Issue description]

### Approval Status
[ ] APPROVED - Safe to merge
[ ] APPROVED WITH CONDITIONS - [Conditions]
[ ] REJECTED - [Reasons]

### Required Changes
1. [Change needed]
2. [Change needed]
```

### Output Files
- `/docs/security-review-product-analyst.md`
- `/docs/security-review-copywriting.md`
- `/docs/security-review-seo.md`
- `/docs/security-review-demo.md`
- `/docs/security-summary.md`

---

## Execution Instructions

### Phase 1: Analysis (Product Analyst)
```bash
# Agent reads codebase and produces analysis documents
# Output: /docs/product-brief.md, /docs/virality-analysis.md, /docs/feature-map.md
# Security Agent reviews before proceeding
```

### Phase 2: Copy (Copywriting Agent)
```bash
# Agent uses product brief to audit and rewrite copy
# Output: /docs/landing-page-copy-v2.md, code changes
# Security Agent reviews before proceeding
```

### Phase 3: SEO (SEO Agent)
```bash
# Agent performs full SEO audit and implementation
# Output: /docs/seo-audit.md, metadata updates, sitemap, robots
# Security Agent reviews before proceeding
```

### Phase 4: Demo (Demo Agent)
```bash
# Ensure dev server is running: npm run dev
# Agent captures screenshots and recordings
# Agent builds Remotion compositions
# Agent renders final videos
# Output: /captures/*, /remotion/*, /public/videos/*
# Security Agent reviews before proceeding
```

### Phase 5: Final Review (Security Agent)
```bash
# Security Agent produces final summary
# All approved changes merged to main branch
# Output: /docs/security-summary.md
```

---

## File Structure After Completion

```
clips/
├── app/
│   ├── page.tsx                    # Updated with new copy
│   ├── layout.tsx                  # Updated with SEO metadata
│   ├── robots.ts                   # New
│   ├── sitemap.ts                  # New
│   └── ...
├── captures/
│   ├── screenshots/
│   │   ├── dashboard-empty.png
│   │   ├── dashboard-with-chart.png
│   │   └── ...
│   └── recordings/
│       └── demo-flow.mp4
├── docs/
│   ├── product-brief.md
│   ├── virality-analysis.md
│   ├── feature-map.md
│   ├── copy-audit.md
│   ├── landing-page-copy-v2.md
│   ├── microcopy-guide.md
│   ├── voice-tone-guidelines.md
│   ├── seo-audit.md
│   ├── keyword-research.md
│   ├── seo-implementation-checklist.md
│   ├── demo-assets-inventory.md
│   ├── security-review-*.md
│   └── security-summary.md
├── public/
│   ├── og-image.png
│   ├── twitter-card.png
│   └── videos/
│       ├── product-overview.mp4
│       ├── feature-theatre-mode.mp4
│       ├── feature-markers.mp4
│       └── social-proof.mp4
├── remotion/
│   ├── src/
│   └── ...
├── scripts/
│   ├── capture-screenshots.ts
│   └── capture-video.ts
└── ...
```

---

## Success Criteria

### Product Analyst
- [ ] Complete feature inventory
- [ ] Clear target audience definition
- [ ] Actionable virality insights

### Copywriting Agent
- [ ] All landing page copy rewritten with options
- [ ] Microcopy audit complete
- [ ] Voice & tone guidelines documented

### SEO Agent
- [ ] Technical SEO checklist 100% complete
- [ ] Keyword research documented
- [ ] Metadata implemented

### Demo Agent
- [ ] All screenshots captured
- [ ] Demo video rendered
- [ ] Remotion project functional

### Security Agent
- [ ] All agent outputs reviewed
- [ ] No critical/high issues remaining
- [ ] Final approval given

---

## Notes

- Each agent should complete their tasks fully before handoff
- Security Agent has VETO power - nothing ships without approval
- All outputs should be production-ready, not drafts
- Agents should ask for clarification rather than assume
- Document decisions and reasoning in output files

---

*Pipeline Version: 1.0*
*Created: January 2025*
