# Demo Assets Inventory - Clips

Complete inventory of all demo assets needed for marketing, documentation, and promotional purposes.

**Generated for Phase 4: Demo Agent**
**Last Updated: January 2025**

---

## 1. Screenshots

All screenshots should be captured with clean state, proper viewport sizing, and at high resolution (1920x1080 or higher).

### 1.1 Landing Page Screenshots

#### Hero Section (Desktop)
- **Name**: `landing-hero-desktop.png`
- **Viewport**: 1920 x 1080
- **URL**: `http://localhost:3000/`
- **Description**: Full above-the-fold hero section showing headline, subtext, CTA buttons, and background visual
- **State**: Page loaded, default state, no scrolling
- **Purpose**: Landing page preview, social media cards, documentation hero image
- **Requirements**:
  - Hero copy fully visible
  - CTA buttons clearly visible
  - Clean, professional appearance

#### Hero Section (Mobile)
- **Name**: `landing-hero-mobile.png`
- **Viewport**: 375 x 812
- **URL**: `http://localhost:3000/`
- **Description**: Mobile-responsive hero section
- **State**: Page loaded, default state
- **Purpose**: Mobile preview, responsive design showcase
- **Requirements**:
  - Typography scaled appropriately
  - Buttons/CTAs properly sized for touch
  - No horizontal scrolling

#### How It Works Section
- **Name**: `landing-how-it-works.png`
- **Viewport**: 1920 x 1080
- **URL**: `http://localhost:3000/` (scrolled to How It Works section)
- **Scroll Target**: Scroll until "How It Works" section is visible, center it in viewport
- **Description**: Step-by-step process visualization (Paste CA → Load Chart → Mark Entry/Exit → Playback → Generate → Share)
- **Purpose**: Product education, marketing materials
- **Requirements**:
  - All steps clearly numbered and visible
  - Icons or visual indicators for each step
  - Descriptive text for each step readable

#### Pricing Section
- **Name**: `landing-pricing.png`
- **Viewport**: 1920 x 1080
- **URL**: `http://localhost:3000/` (scrolled to Pricing section)
- **Scroll Target**: Scroll until Pricing section is visible
- **Description**: Freemium (5 free renders/month) vs Pro ($20/month) pricing cards
- **Purpose**: Conversion materials, pricing communication
- **Requirements**:
  - Both pricing tiers clearly visible
  - Feature list readable
  - CTA buttons prominent

#### FAQ Section
- **Name**: `landing-faq.png`
- **Viewport**: 1920 x 1080
- **URL**: `http://localhost:3000/` (scrolled to FAQ section)
- **Scroll Target**: Scroll until FAQ section is visible
- **Description**: Frequently asked questions with expandable answers
- **Purpose**: FAQ reference, user education
- **Requirements**:
  - At least 3 FAQ items visible
  - Closed accordion state (not expanded)

#### CTA Section
- **Name**: `landing-cta.png`
- **Viewport**: 1920 x 1080
- **URL**: `http://localhost:3000/` (scrolled to final CTA section)
- **Scroll Target**: Scroll to footer/final CTA area
- **Description**: Bottom call-to-action section before footer
- **Purpose**: Last marketing push, footer preview
- **Requirements**:
  - CTA message clearly visible
  - Primary and secondary buttons visible
  - Footer links visible if applicable

---

### 1.2 Dashboard - Empty State

#### Initial Dashboard Load
- **Name**: `dashboard-empty.png`
- **Viewport**: 1920 x 1080
- **URL**: `http://localhost:3000/dashboard`
- **Auth**: Must be logged in (test user session)
- **Description**: Dashboard with empty state, no trade loaded yet
- **State**: No transaction hashes entered, fresh dashboard view
- **Purpose**: Onboarding documentation, empty state showcase
- **Requirements**:
  - Transaction input form visible with placeholders
  - "Paste entry and exit hashes" instruction visible
  - Example transaction hash format visible
  - Clean, inviting empty state

#### Dashboard with Chart Loading
- **Name**: `dashboard-loading.png`
- **Viewport**: 1920 x 1080
- **URL**: `http://localhost:3000/dashboard`
- **Auth**: Logged in
- **Actions**:
  1. Paste a valid entry transaction hash in the first input
  2. Paste a valid exit transaction hash in the second input
  3. Wait for "Fetch Candles" API call to initiate (capture during loading)
- **Description**: Chart container in loading state
- **State**: API call in progress, loading spinner visible
- **Purpose**: UX documentation, loading state showcase
- **Requirements**:
  - Loading indicator visible
  - "Fetching chart data..." message visible if present

---

### 1.3 Dashboard - With Chart Data

#### Chart Loaded (Initial State)
- **Name**: `dashboard-chart-loaded.png`
- **Viewport**: 1920 x 1080
- **URL**: `http://localhost:3000/dashboard`
- **Auth**: Logged in
- **Actions**:
  1. Enter valid entry and exit transaction hashes
  2. Wait for chart to load completely
  3. Ensure both entry and exit markers are visible on chart
- **Description**: Full candlestick chart with entry and exit markers already placed
- **State**: Chart fully loaded, markers visible (green entry, red exit)
- **Purpose**: Product feature showcase, trading flow illustration
- **Requirements**:
  - Candlestick chart clearly visible and populated with candles
  - Entry marker (green dot/flag) visible on the chart
  - Exit marker (red dot/flag) visible on the chart
  - Time axis and price axis visible with labels
  - Playback controls visible below or overlaid on chart

#### Playback Controls Highlighted
- **Name**: `dashboard-playback-controls.png`
- **Viewport**: 1920 x 1080
- **URL**: `http://localhost:3000/dashboard`
- **Auth**: Logged in
- **State**: Chart loaded with visible playback controls
- **Description**: Close-up or focused view of playback control buttons/features
- **Focus Elements**:
  - Play/Pause button
  - Step backward/forward buttons
  - Scrubber bar
  - Speed selector (1x, 2x, 5x, 10x)
  - Fullscreen button
- **Purpose**: Feature documentation, UX tutorial
- **Requirements**:
  - Controls clearly labeled or obvious by icon
  - All buttons visible and interactive-looking
  - Good contrast against chart background

#### Chart Mid-Playback (Entry Visible)
- **Name**: `dashboard-playback-entry-phase.png`
- **Viewport**: 1920 x 1080
- **URL**: `http://localhost:3000/dashboard`
- **Auth**: Logged in
- **Actions**:
  1. Load chart with entry and exit markers
  2. Click Play button
  3. Wait for playback to reach near the entry candle
  4. Screenshot during playback animation
- **Description**: Chart during playback showing the price action approaching entry point
- **State**: Playback in progress, timeline progressing, entry point visible
- **Purpose**: Product demo, animation showcase
- **Requirements**:
  - Price action visible leading up to entry
  - Entry marker clearly highlighted/visible
  - Play button appears "active" (pause button might show instead)
  - Scrubber position reflects current playback time

#### P&L Card (End of Playback)
- **Name**: `dashboard-pnl-card.png`
- **Viewport**: 1920 x 1080
- **URL**: `http://localhost:3000/dashboard`
- **Auth**: Logged in
- **Actions**:
  1. Load chart with entry and exit markers
  2. Click Play button
  3. Allow playback to progress fully (or scrub to near end)
  4. Wait for P&L card animation/reveal
  5. Screenshot with P&L card visible
- **Description**: Chart with P&L overlay card displayed showing profit/loss percentage
- **State**: Playback complete or near completion, P&L card animated in
- **Purpose**: Core feature showcase, product hero image potential
- **Requirements**:
  - P&L card clearly visible with percentage gain/loss
  - Green color for profit, red for loss
  - Card appears polished and branded
  - Price points (entry/exit) visible if displayed
  - Trade time duration visible if displayed

#### Speed Control Selection
- **Name**: `dashboard-speed-selector.png`
- **Viewport**: 1920 x 1080
- **URL**: `http://localhost:3000/dashboard`
- **Auth**: Logged in
- **Actions**:
  1. Load chart with entry and exit markers
  2. Hover over or interact with speed control dropdown/selector
  3. Capture with speed options visible (1x, 2x, 5x, 10x)
- **Description**: Speed selector menu/dropdown showing playback speed options
- **State**: Speed selector expanded/visible
- **Purpose**: Feature documentation, customization showcase
- **Requirements**:
  - All speed options visible (1x, 2x, 5x, 10x)
  - Current selection highlighted
  - Clean, accessible dropdown design

#### Fullscreen Mode
- **Name**: `dashboard-fullscreen.png`
- **Viewport**: 1920 x 1080
- **URL**: `http://localhost:3000/dashboard`
- **Auth**: Logged in
- **Actions**:
  1. Load chart with entry and exit markers
  2. Click fullscreen button
  3. Screenshot fullscreen chart view
- **Description**: Chart in fullscreen/theater mode
- **State**: Fullscreen mode active, controls minimized or hidden on hover
- **Purpose**: Premium feature showcase, full-screen viewing
- **Requirements**:
  - Chart dominates the screen
  - Minimal UI distractions
  - Chart controls still accessible if needed
  - Immersive viewing experience clear

#### Token Info Card
- **Name**: `dashboard-token-info.png`
- **Viewport**: 1920 x 1080
- **URL**: `http://localhost:3000/dashboard`
- **Auth**: Logged in
- **Actions**:
  1. Load chart with a successful trade
  2. Capture the token info card that displays (shows token name, symbol, address)
- **Description**: Token information card showing token name, symbol, and contract address
- **State**: Chart loaded, token info populated
- **Purpose**: Token identification showcase, data transparency
- **Requirements**:
  - Token name visible (e.g., "DogeMeme")
  - Symbol visible (e.g., "$DOGE")
  - Contract address visible (shortened format)
  - Copy-to-clipboard button visible
  - Solscan link visible

#### Trade Info Summary
- **Name**: `dashboard-trade-info-summary.png`
- **Viewport**: 1920 x 1080
- **URL**: `http://localhost:3000/dashboard`
- **Auth**: Logged in
- **Actions**:
  1. Load chart with entry and exit markers
  2. Capture the trade info banner showing entry time, exit time, and P&L
- **Description**: Summary banner showing entry timestamp, exit timestamp, and calculated P&L percentage
- **State**: Trade loaded, timestamps and P&L calculated
- **Purpose**: Trade verification, summary documentation
- **Requirements**:
  - Entry timestamp visible
  - Exit timestamp visible
  - P&L percentage prominent
  - Save Trade button visible

#### Save Trade Modal
- **Name**: `dashboard-save-trade-modal.png`
- **Viewport**: 1920 x 1080
- **URL**: `http://localhost:3000/dashboard`
- **Auth**: Logged in
- **Actions**:
  1. Load chart with valid entry and exit
  2. Look for "Save Trade" button in trade info summary
  3. Click Save Trade button
  4. Capture the modal that appears
- **Description**: Modal dialog for saving a trade with name, public/private toggle
- **State**: Modal open, ready for user input
- **Purpose**: Save workflow documentation
- **Requirements**:
  - Trade name input field visible
  - Public/private toggle or checkbox visible
  - Save and Cancel buttons visible
  - Modal centered and properly styled

---

### 1.4 Dashboard - Trading Flow States

#### Multiple Timeframes
- **Name**: `dashboard-timeframe-1h.png`
- **Viewport**: 1920 x 1080
- **URL**: `http://localhost:3000/dashboard`
- **Auth**: Logged in
- **Actions**:
  1. Load chart
  2. If timeframe selector visible, show 1-hour candles
- **Description**: Chart with 1-hour candle timeframe selected
- **Purpose**: Timeframe flexibility documentation
- **Requirements**:
  - Candles displayed at 1-hour intervals
  - Timeframe selector shows "1H" or "1h" as active
  - Fewer candles visible than smaller timeframes

#### Date Range Selector
- **Name**: `dashboard-date-range-selector.png`
- **Viewport**: 1920 x 1080
- **URL**: `http://localhost:3000/dashboard`
- **Auth**: Logged in
- **Actions**:
  1. Load chart
  2. Interact with date range selector
  3. Show selector expanded or active
- **Description**: Date range selection interface
- **Purpose**: Date range customization showcase
- **Requirements**:
  - Date range options visible (if dropdown)
  - Current range highlighted
  - Easy to understand and select alternatives

---

### 1.5 Dashboard - Responsive Views

#### Dashboard (Tablet)
- **Name**: `dashboard-tablet.png`
- **Viewport**: 768 x 1024
- **URL**: `http://localhost:3000/dashboard`
- **Auth**: Logged in
- **Description**: Dashboard on tablet-sized screen with chart loaded
- **Purpose**: Responsive design verification, tablet UX
- **Requirements**:
  - Inputs and chart properly stacked/arranged for tablet size
  - Touch targets appropriately sized
  - No horizontal scrolling

#### Dashboard (Mobile)
- **Name**: `dashboard-mobile.png`
- **Viewport**: 375 x 812
- **URL**: `http://localhost:3000/dashboard`
- **Auth**: Logged in
- **Description**: Dashboard on mobile screen with chart loaded
- **Purpose**: Mobile UX, responsive design showcase
- **Requirements**:
  - Vertically stacked layout
  - Chart responsively sized
  - All controls accessible without horizontal scroll
  - Touch-friendly button sizes

---

### 1.6 Secondary Pages

#### Leaderboard Page
- **Name**: `leaderboard-main.png`
- **Viewport**: 1920 x 1080
- **URL**: `http://localhost:3000/leaderboard`
- **Description**: Public leaderboard showing top trades ranked by P&L
- **State**: Page loaded with sample leaderboard data
- **Purpose**: Social proof, gamification showcase
- **Requirements**:
  - Title "Leaderboard" visible
  - Trade rankings visible (at least 5 trades)
  - P&L percentages showing (green for profit)
  - Trader usernames/profiles linked
  - Filterable time period indicator if present

#### Trader Profile Page
- **Name**: `profile-trader-page.png`
- **Viewport**: 1920 x 1080
- **URL**: `http://localhost:3000/u/[test-username]`
- **Description**: Public trader profile showing their saved public trades and stats
- **State**: Profile loaded with sample trades
- **Purpose**: Trading resume showcase, profile portfolio
- **Requirements**:
  - Trader username prominent
  - Stats visible (best trade, avg gain, win rate)
  - Trade history visible
  - Links to individual trades if clickable
  - Professional appearance

#### My Trades Page
- **Name**: `my-trades-page.png`
- **Viewport**: 1920 x 1080
- **URL**: `http://localhost:3000/trades`
- **Auth**: Logged in
- **Description**: User's personal saved trades dashboard
- **State**: Page loaded with several saved trades
- **Purpose**: Trade management, personal dashboard
- **Requirements**:
  - List of saved trades visible
  - Trade names showing
  - P&L percentages visible
  - Replay/edit options visible if applicable
  - Public/private indicator for each trade

---

## 2. Video Recordings

Raw screen recordings of key user flows and interactions. These will be edited and composed into final demo videos.

### 2.1 Raw Screen Recordings

#### Complete User Journey - Single Trade
- **Name**: `recording-complete-flow.mp4`
- **Format**: MP4, 1920x1080, 30fps
- **Duration**: ~60 seconds
- **Flow**:
  1. Start: Dashboard empty state
  2. (2s) Pause to show form
  3. Enter entry transaction hash (with typing effect)
  4. Enter exit transaction hash (with typing effect)
  5. Click "Fetch Candles" button
  6. (3s) Wait for chart to load
  7. Chart appears with markers
  8. Play button clicked
  9. (10s) Let playback run through full trade animation
  10. P&L card animates in at end
  11. (2s) Hold on final state
- **Purpose**: Main product demo recording, core flow footage
- **Audio**: None required (will add music/narration in composition)

#### Entry/Exit Marker Placement (Close-up)
- **Name**: `recording-marker-placement.mp4`
- **Format**: MP4, 1920x1080, 30fps
- **Duration**: ~20 seconds
- **Focus**: Close-up on chart area
- **Flow**:
  1. Chart loaded, markers visible
  2. Highlight entry marker (brief glow or zoom if possible)
  3. (2s) Hold on entry
  4. Highlight exit marker (brief glow or zoom)
  5. (2s) Hold on exit
  6. Zoom out to show both markers in context
- **Purpose**: Feature highlight footage, marker validation

#### Playback Speed Control Demo
- **Name**: `recording-speed-control.mp4`
- **Format**: MP4, 1920x1080, 30fps
- **Duration**: ~25 seconds
- **Flow**:
  1. Chart loaded
  2. Start playback at 1x speed
  3. (5s) Play briefly at 1x
  4. Click speed selector, change to 5x
  5. (5s) Play at 5x (faster price action)
  6. Click speed selector, change to 10x
  7. (5s) Play at 10x (maximum speed)
  8. Click speed selector, back to 1x
- **Purpose**: Speed control feature documentation

#### Fullscreen Playback
- **Name**: `recording-fullscreen-playback.mp4`
- **Format**: MP4, 1920x1080, 30fps
- **Duration**: ~30 seconds
- **Flow**:
  1. Chart loaded, normal view
  2. Click fullscreen button
  3. Chart expands to fullscreen
  4. (15s) Let playback run in fullscreen
  5. P&L card reveals in fullscreen
  6. (5s) Hold on full-screen result
- **Purpose**: Theater mode showcase, immersive experience documentation

#### Save Trade Workflow
- **Name**: `recording-save-trade.mp4`
- **Format**: MP4, 1920x1080, 30fps
- **Duration**: ~25 seconds
- **Flow**:
  1. Chart loaded with trade info visible
  2. Click "Save Trade" button
  3. Modal appears
  4. Type a trade name (e.g., "SOL Pump #42")
  5. Toggle public/private visibility
  6. Click "Save"
  7. Success message appears
  8. (3s) Hold on success confirmation
- **Purpose**: Save workflow documentation

#### Leaderboard Navigation
- **Name**: `recording-leaderboard-flow.mp4`
- **Format**: MP4, 1920x1080, 30fps
- **Duration**: ~20 seconds
- **Flow**:
  1. On dashboard
  2. Click link to Leaderboard
  3. Page loads with top trades
  4. Scroll down to show more trades
  5. Click on a trader name/profile link
  6. Trader profile page loads
  7. (3s) View their profile and history
- **Purpose**: Social features showcase, navigation flow

---

## 3. OG Images (Open Graph)

Social media preview cards for links shared on Twitter, Discord, etc.

### 3.1 Primary OG Image

#### Homepage OG Image
- **Name**: `og-home.png`
- **Dimensions**: 1200 x 630 pixels
- **Format**: PNG with transparency or solid background
- **Content**:
  - Clips logo/branding top-left
  - Hero headline: "Turn Your Solana Trades Into Shareable Videos"
  - Supporting tagline: "No recording needed • Professional quality • On-chain verified"
  - Visual element: Stylized chart with entry/exit markers, P&L badge
  - Dark theme with accent colors (green for gains, crypto aesthetic)
  - Text should be large and readable when thumbnail-sized
- **Usage**: When homepage URL is shared on social media
- **Design Style**: Match landing page design language, high-contrast for thumbnail clarity

#### Dashboard OG Image
- **Name**: `og-dashboard.png`
- **Dimensions**: 1200 x 630 pixels
- **Format**: PNG
- **Content**:
  - Clips logo top-left
  - Headline: "Create Trade Replays Instantly"
  - Subtext: "Paste hashes • Get videos • Share wins"
  - Visual: Dashboard mockup showing chart with markers
  - Screenshot of key UI elements
  - Dark theme matching app
- **Usage**: When dashboard link shared (if public dashboards exist)

#### Leaderboard OG Image
- **Name**: `og-leaderboard.png`
- **Dimensions**: 1200 x 630 pixels
- **Format**: PNG
- **Content**:
  - "Leaderboard" title prominent
  - Trophy icon or ranking visual
  - "Top traders ranked by P&L"
  - Sample of a profitable trade (-highlight one)
  - Competitive/achievement messaging
  - Dark theme
- **Usage**: Leaderboard page shared on Twitter

#### Success Clip OG Image
- **Name**: `og-clip-template.png`
- **Dimensions**: 1200 x 630 pixels
- **Format**: PNG template
- **Content**: (Template for individual clip/trade results)
  - Trade details: entry/exit prices
  - P&L percentage large and prominent
  - Chart mini-preview
  - Trader name/username
  - "Generated with Clips" branding
  - Green color for profitable trades, red for losses
- **Usage**: Each rendered video clip gets a custom OG image
- **Note**: This is a template; actual images generated per trade

---

### 3.2 Feature OG Images

#### "No Recording Needed" Feature
- **Name**: `og-feature-no-recording.png`
- **Dimensions**: 1200 x 630 pixels
- **Format**: PNG
- **Content**:
  - Headline: "Hit a 10x but forgot to record?"
  - Subtext: "We got you. Clips works retroactively."
  - Visual: Crossed-out recording equipment icon, checkmark on Clips logo
  - Emphasis on retroactive nature
- **Usage**: Social media content, feature promotions

#### "On-Chain Verified" Feature
- **Name**: `og-feature-verified.png`
- **Dimensions**: 1200 x 630 pixels
- **Format**: PNG
- **Content**:
  - Headline: "Proof That Actually Proves"
  - Subtext: "Real on-chain data. Not screenshots. Not trust-me-bro."
  - Visual: Blockchain network visual, verified checkmark, transaction hash
  - Emphasis on authenticity
- **Usage**: Feature highlight posts

#### "Professional Quality" Feature
- **Name**: `og-feature-professional.png`
- **Dimensions**: 1200 x 630 pixels
- **Format**: PNG
- **Content**:
  - Headline: "Studio Quality. Your Trades."
  - Subtext: "Professional chart replays. Zero editing needed."
  - Visual: Side-by-side comparison (manual screenshot vs. Clips video)
  - Emphasis on quality difference
- **Usage**: Feature comparison posts

---

### 3.3 Twitter Card Images

#### Twitter Summary Large Image
- **Name**: `twitter-card-large.png`
- **Dimensions**: 1200 x 675 pixels
- **Format**: PNG
- **Content**: Similar to homepage OG but optimized for Twitter's aspect ratio
- **Note**: Twitter cards can use same image as OG with slight adjustments

#### Twitter App Card
- **Name**: `twitter-app-card.png`
- **Dimensions**: 1200 x 675 pixels
- **Format**: PNG
- **Content**: App store-style image showing app icon, features, download CTA

---

## 4. Additional Marketing Assets

### 4.1 Product Imagery

#### Chart Replay Animation Frame 1 (Entry)
- **Name**: `chart-frame-entry.png`
- **Dimensions**: 1920 x 1080
- **Format**: PNG
- **Content**: Chart with entry marker highlighted, "Entry Point" label
- **Purpose**: Marketing slides, blog posts
- **Notes**: Extracted from dashboard chart loaded state

#### Chart Replay Animation Frame 2 (Progression)
- **Name**: `chart-frame-progression.png`
- **Dimensions**: 1920 x 1080
- **Format**: PNG
- **Content**: Chart during playback showing price action moving from entry toward exit
- **Purpose**: Storytelling progression in marketing materials

#### Chart Replay Animation Frame 3 (Exit)
- **Name**: `chart-frame-exit.png`
- **Dimensions**: 1920 x 1080
- **Format**: PNG
- **Content**: Chart at exit point with exit marker highlighted, "Exit Point" label
- **Purpose**: Marketing narrative continuation

#### Chart Replay Animation Frame 4 (Result)
- **Name**: `chart-frame-result.png`
- **Dimensions**: 1920 x 1080
- **Format**: PNG
- **Content**: Chart with P&L card prominently displayed showing the trade result
- **Purpose**: Benefit/result showcase

#### P&L Card Close-up
- **Name**: `pnl-card-closeup.png`
- **Dimensions**: 600 x 400
- **Format**: PNG with transparency
- **Content**: Just the P&L card design element (cropped/isolated)
- **Purpose**: Icon use, deck slides, smaller marketing materials
- **Variants**: Create multiple with different P&L values (small gain, big gain, loss)

---

### 4.2 UI Component Exports

#### Empty State Illustration
- **Name**: `empty-state-illustration.png`
- **Dimensions**: 800 x 600
- **Format**: PNG with transparency
- **Content**: Illustration/icon for empty dashboard state
- **Purpose**: Documentation, help articles

#### Loading State Animation Frames
- **Name**: `loading-frame-1.png`, `loading-frame-2.png`, `loading-frame-3.png`
- **Dimensions**: 1920 x 1080
- **Format**: PNG (one per frame, total 3 frames for looping animation preview)
- **Content**: Loading spinner/animation at different stages
- **Purpose**: Loading state documentation, animation showcase

#### Error State Illustration
- **Name**: `error-state-illustration.png`
- **Dimensions**: 800 x 600
- **Format**: PNG with transparency
- **Content**: Error state icon/message for failed loads
- **Purpose**: Error handling documentation

---

### 4.3 Comparison Assets

#### Manual Screenshot vs. Clips Result
- **Name**: `comparison-manual-vs-clips.png`
- **Dimensions**: 1920 x 1080
- **Format**: PNG
- **Content**: Side-by-side or split comparison showing:
  - Left: Low-quality manual screenshot with hand-drawn annotations
  - Right: Professional Clips chart replay with clean overlay
- **Purpose**: Marketing/feature comparison slides

#### OBS Screen Recording vs. Clips
- **Name**: `comparison-obs-vs-clips.png`
- **Dimensions**: 1920 x 1080
- **Format**: PNG
- **Content**: Comparison emphasizing:
  - Raw recording (messy, unfinished)
  - vs. Polished Clips result
- **Purpose**: Workflow efficiency messaging

---

### 4.4 Badge/Icon Assets

#### "No Recording Needed" Badge
- **Name**: `badge-no-recording-needed.png`
- **Dimensions**: 200 x 200
- **Format**: PNG with transparency
- **Content**: Icon badge highlighting this unique feature
- **Purpose**: Landing page, feature callouts

#### "On-Chain Verified" Badge
- **Name**: `badge-onchain-verified.png`
- **Dimensions**: 200 x 200
- **Format**: PNG with transparency
- **Content**: Checkmark or blockchain-related icon with "Verified" text
- **Purpose**: Trust/verification callouts

#### "Pro Features" Badge
- **Name**: `badge-pro-features.png`
- **Dimensions**: 200 x 200
- **Format**: PNG with transparency
- **Content**: Premium/pro tier indicator badge
- **Purpose**: Pricing cards, upgrade prompts

---

## 5. Demo Video Compositions (Remotion)

Videos composed from screenshots and recordings, with text overlays, music, and pacing.

### 5.1 Video Specs

All demo videos should be exported as MP4 with:
- **Codec**: H.264
- **Resolution**: 1920 x 1080 (60fps for smooth animations, or 30fps for normal playback)
- **Audio**: AAC stereo
- **Format**: MP4 container
- **Target Platforms**: Twitter, YouTube, Discord, landing page embeds

---

### 5.2 Product Overview Video (30 seconds)

**Filename**: `demo-product-overview.mp4`

**Composition**: `remotion/src/compositions/ProductOverview.tsx`

**Scenes**:
1. **Hook (0-5s)**: Text overlay: "Hit a 10x but forgot to record?"
   - Background: Blurred hero section of dashboard
   - Emotional impact on this stat
   - Font: Large, bold, white text

2. **Problem (5-10s)**: Sequence of pain points:
   - Screenshot showing "Manual annotation is tedious"
   - Screenshot showing "OBS screen recording is clunky"
   - Text: "No more"
   - Shake/impact effect for emphasis

3. **Solution Intro (10-15s)**:
   - Text overlay: "Meet Clips"
   - Logo reveal with glow effect
   - Transition animation

4. **Product Demo (15-25s)**:
   - Embedded video: `recording-complete-flow.mp4` (compressed for 10 seconds)
   - Show fast version: paste hash → load → mark → play → result
   - Speed: 2x-4x the actual flow
   - No audio, will add music

5. **CTA (25-30s)**:
   - Text overlay: "Try Clips free"
   - Clips logo watermark bottom-right
   - Website URL: "clips.app"
   - Green background fade-in
   - Music crescendo

**Audio**: Upbeat, energetic background music (royalty-free)
**Watermark**: Clips logo, bottom-right corner, 20% opacity

---

### 5.3 Feature Highlight - "No Recording Needed" (15 seconds)

**Filename**: `demo-feature-no-recording.mp4`

**Composition**: `remotion/src/compositions/FeatureNoRecording.tsx`

**Scenes**:
1. **Problem (0-3s)**:
   - Sequence of screenshots showing users struggling
   - Text overlay: "You need to record before the trade"
   - Frustrated emoji or icon

2. **Clips Solution (3-8s)**:
   - Screenshot of dashboard with hashes pasted
   - Timeline shows:
     - "Trade happened" (past)
     - "Chart replayed" (after)
   - Text: "Clips works AFTER your trade"
   - Animation showing retroactive nature (rewind icon?)

3. **Benefit (8-15s)**:
   - Screenshot showing result: beautiful video
   - Text: "Professional result. Zero setup."
   - Logo watermark
   - CTA: "Try it free"

**Audio**: Smooth, professional background music

---

### 5.4 Feature Highlight - "On-Chain Verified" (15 seconds)

**Filename**: `demo-feature-verified.mp4`

**Composition**: `remotion/src/compositions/FeatureVerified.tsx`

**Scenes**:
1. **Problem (0-3s)**:
   - Screenshot of fake/photoshopped P&L
   - Text: "Screenshots can be faked"
   - Red X icon over fake image

2. **Solution (3-10s)**:
   - Show Helius API data fetching (or chart visualization of on-chain verification)
   - Text: "Real on-chain data"
   - Animation of blockchain verification checkmark
   - Show transaction hash being used
   - Text: "Impossible to fake"

3. **CTA (10-15s)**:
   - Result screenshot with verified badge
   - Text: "Proof that proves"
   - Clips watermark
   - Website URL

**Audio**: Professional, trustworthy tone in music (slower tempo than product overview)

---

### 5.5 Feature Highlight - "Theater Mode" (15 seconds)

**Filename**: `demo-feature-theater-mode.mp4`

**Composition**: `remotion/src/compositions/FeatureTheaterMode.tsx`

**Scenes**:
1. **Intro (0-2s)**:
   - Text: "Full playback control"
   - Clips watermark

2. **Playback Demo (2-10s)**:
   - Embedded video of `recording-speed-control.mp4` (compressed)
   - Show speed buttons, scrubbing, fullscreen transition
   - Text overlay: "Speed 1x → 5x → 10x"
   - Show fullscreen transition at end

3. **Use Case (10-15s)**:
   - Screenshot of fullscreen chart view
   - Text: "Share your trade, your way"
   - CTA and watermark

**Audio**: Upbeat, energetic

---

### 5.6 Social Proof - Top Traders (20 seconds)

**Filename**: `demo-social-proof.mp4`

**Composition**: `remotion/src/compositions/SocialProof.tsx`

**Scenes**:
1. **Intro (0-3s)**:
   - Text: "Join 1000+ traders"
   - Number count animation (if stats available)

2. **Leaderboard (3-12s)**:
   - Screenshot of leaderboard page
   - Animated highlighting of top 3 traders
   - Show their P&L percentages
   - Text overlay: "Compete and prove your skills"

3. **Profile Pages (12-18s)**:
   - Show trader profile page
   - Display their public trades, win rate, best trade
   - Text: "Build your trading reputation"

4. **CTA (18-20s)**:
   - "Get on the leaderboard" call-to-action
   - Clips branding and website URL

**Audio**: Community/social energy in music

---

### 5.7 Call-to-Action Video (10 seconds)

**Filename**: `demo-cta-simple.mp4`

**Composition**: `remotion/src/compositions/CTASimple.tsx`

**Scenes**:
1. **Headline (0-3s)**:
   - Large text: "Create Your First Trade Replay"
   - Fade in

2. **Benefit List (3-8s)**:
   - Animated text appearing one-by-one:
     - "✓ No recording needed"
     - "✓ Professional quality"
     - "✓ Share instantly"
   - Each with checkmark animation

3. **CTA (8-10s)**:
   - Button graphic: "Try Free"
   - URL: "clips.app"
   - Green highlight/glow on button
   - Music peak/crescendo

**Audio**: Energetic, motivational background music

---

## 6. Remotion Project Structure

Directory structure for the Remotion video composition project:

```
remotion/
├── src/
│   ├── compositions/
│   │   ├── ProductOverview.tsx
│   │   ├── FeatureNoRecording.tsx
│   │   ├── FeatureVerified.tsx
│   │   ├── FeatureTheaterMode.tsx
│   │   ├── SocialProof.tsx
│   │   └── CTASimple.tsx
│   ├── components/
│   │   ├── TextOverlay.tsx
│   │   ├── Logo.tsx
│   │   ├── CTA.tsx
│   │   ├── NumberCounter.tsx
│   │   ├── ScreenCapture.tsx
│   │   └── AnimatedCheckmark.tsx
│   ├── assets/
│   │   ├── screenshots/
│   │   │   ├── dashboard-chart-loaded.png
│   │   │   ├── dashboard-pnl-card.png
│   │   │   ├── leaderboard-main.png
│   │   │   └── [other screenshots]
│   │   ├── recordings/
│   │   │   ├── recording-complete-flow.mp4
│   │   │   ├── recording-speed-control.mp4
│   │   │   └── [other recordings]
│   │   └── audio/
│   │       ├── music-upbeat.mp3
│   │       ├── music-professional.mp3
│   │       └── [other audio tracks]
│   ├── styles/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   └── animations.ts
│   ├── hooks/
│   │   └── useNumberAnimation.ts
│   └── Root.tsx
├── package.json
├── remotion.config.ts
└── .gitignore
```

---

## 7. Capture Requirements & Notes

### 7.1 Prerequisites

- Dev server running: `npm run dev` (localhost:3000)
- Test user account logged in and authenticated
- Test transaction hashes available for use
- Browser DevTools closed (no console interference)
- Screen recording software ready (Puppeteer will handle automation)
- Network connection stable for API calls to Helius and Birdeye

### 7.2 Test Data Requirements

To capture realistic screenshots, you'll need:
- **Valid Solana transaction hash** for entry trade (or use a mock test value)
- **Valid Solana transaction hash** for exit trade (or use a mock test value)
- **Token contract address** that resolves properly
- **Chart data** that returns from Birdeye API

If using real data:
- Consider using past/historical transactions
- Ensure they show clear entry and exit points
- Good P&L spread (ideally profitable trade for visual impact)

If using mock data:
- Ensure API mock/stub returns realistic candlestick data
- Mock P&L calculation for demo purposes
- Chart renders without errors

### 7.3 Capture Technique Notes

- **Viewport sizing**: Use exact pixel dimensions specified for consistency
- **Timing delays**: Add slight delays between actions to ensure rendering (200-500ms)
- **Waits**: Use selector waits for dynamic content (chart loads asynchronously)
- **Retries**: Network calls may fail; build retry logic into capture script
- **Screenshot paths**: Create `captures/` directory structure before running
- **File naming**: Use kebab-case for all filenames (e.g., `dashboard-chart-loaded.png`)
- **Organization**: Organize into subdirectories: `screenshots/`, `recordings/`, `og-images/`

### 7.4 Quality Checklist

Before finalizing captured assets:

- [ ] Screenshots are at specified dimensions
- [ ] Text is clearly readable (not blurry)
- [ ] Charts render correctly with visible candles
- [ ] Markers (entry/exit) are visible and correct colors
- [ ] UI buttons and controls are not cut off
- [ ] No console errors visible
- [ ] No loading spinners present (unless specifically capturing loading state)
- [ ] Responsive views are properly sized for their viewport
- [ ] Video recordings are smooth (no frame drops)
- [ ] Video recordings capture correct interactions
- [ ] No user data/PII visible in screenshots
- [ ] Watermarks/logos are properly positioned
- [ ] Color accuracy matches landing page branding
- [ ] Responsive design breakpoints are honored

---

## 8. Asset Usage Guide

Quick reference for where each asset is used:

| Asset | Primary Use | Secondary Use |
|-------|-----------|---------------|
| `landing-hero-desktop.png` | Landing page documentation | Marketing decks |
| `dashboard-chart-loaded.png` | Product demo, help articles | Feature comparison |
| `dashboard-pnl-card.png` | Hero image, feature showcase | Social media posts |
| `og-home.png` | Social media preview | Meta tags |
| `demo-product-overview.mp4` | Landing page embed | Twitter, YouTube |
| `demo-feature-no-recording.mp4` | Twitter/X content | Social media clips |
| `leaderboard-main.png` | Feature documentation | Landing page screenshot |

---

## 9. Monitoring & Maintenance

- **Update frequency**: Refresh assets quarterly or after major UI changes
- **Storage**: Keep original captures in version control, processed versions in CDN
- **Video encoding**: Use consistent codec settings across all videos for platform compatibility
- **Screenshot freshness**: Ensure screenshots reflect current UI design language
- **OG image updates**: Update social preview images if branding changes

---

*Document created for Phase 4 (Demo Agent) of the Clips multi-agent pipeline*
*All asset specifications assume dev server running on localhost:3000*
*Next phase: Remotion composition and rendering*
