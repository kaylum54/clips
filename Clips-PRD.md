# Clips - Product Requirements Document

## Executive Summary

Clips is a web-based tool that allows Solana memecoin traders to replay historical chart data in a "theatre mode" interface - similar to Call of Duty's theatre mode for gameplay replays. Users paste a token contract address (CA), mark their entry and exit points, and get full DVR-style controls to scrub, play, pause, speed up, slow down, and step through chart history frame-by-frame. The primary use case is enabling crypto content creators to capture chart footage showing their trades for social media clips without needing to have been recording at the time of the trade.

---

## Problem Statement

Memecoin traders frequently hit successful trades but fail to capture the chart action because they weren't screen recording at the time. Creating compelling social media content (Twitter/TikTok clips showing chart pumps) currently requires either:

1. Running OBS 24/7 and hoping to catch good trades
2. Using static screenshots which lack the dramatic effect of animated charts
3. Manually recreating charts which is time-consuming and inaccurate

There is no clean solution for replaying historical Solana token charts with content-creator-friendly controls.

---

## Target Users

**Primary:** Crypto Twitter/TikTok content creators who trade Solana memecoins and create chart-based content to build their audience.

**Secondary:** Traders who want to review their trades visually for analysis purposes.

**User Profile:**
- Active on Crypto Twitter (CT)
- Trades Solana memecoins on DEXs
- Creates or wants to create video content showing trades
- Desktop-first (content creation workflow)
- Familiar with contract addresses and DEX interfaces

---

## User Flow

### Primary Flow: Creating a Trade Clip

```
1. USER lands on Clips
   └── Sees: Input field, empty chart area

2. USER pastes token CA
   └── System: Fetches candle data from Birdeye
   └── Sees: Full chart loads (all candles visible, static)

3. USER clicks "Mark Entry"
   └── Sees: Button highlights, cursor becomes crosshair
   
4. USER clicks on chart where they entered
   └── System: Places green entry marker at that candle
   └── Sees: Green horizontal line with "ENTRY $X.XXXX"

5. USER clicks "Mark Exit"
   └── Sees: Button highlights, cursor becomes crosshair

6. USER clicks on chart where they exited
   └── System: Places red exit marker at that candle
   └── Sees: Red horizontal line with "EXIT $X.XXXX"

7. USER opens OBS/screen recorder
   └── Targets the chart area

8. USER clicks Play (or presses Space)
   └── System: Playback starts from candle 0
   └── Chart builds candle by candle
   └── Entry marker APPEARS when playhead reaches entry candle
   └── Price action continues
   └── Exit marker APPEARS when playhead reaches exit candle
   └── Trade stats panel shows P&L

9. USER stops recording
   └── Has a clip showing their trade with entry/exit marked
```

### Content Creator Workflow

```
Hit a 10x trade → Copy CA from DEX → Open Clips → Paste CA → 
Mark Entry → Mark Exit → Set speed to 2x → Fullscreen → 
Record with OBS → Upload to Twitter/TikTok
```

---

## Core Features

### 1. Token Input

**Requirement:** Single input field accepting Solana token contract addresses (CA)

**Acceptance Criteria:**
- Input accepts valid Solana addresses (base58, 32-44 characters)
- Invalid addresses show clear error message
- Loading state shown while fetching data
- Display token name/symbol once resolved
- Support pasting from clipboard

**Example valid input:** `So11111111111111111111111111111111111111112` (Wrapped SOL)

---

### 2. Entry/Exit Trade Marking

**Requirement:** Allow users to mark their entry and exit points on the chart so the replay shows their specific trade.

**Two Input Methods:**

#### Method A: Click to Mark (Default)

User clicks directly on the chart to place markers.

**Flow:**
1. Chart loads with full data visible (static, not playing yet)
2. User clicks "Mark Entry" button → cursor changes to crosshair
3. User clicks on chart at their entry point → green marker placed
4. User clicks "Mark Exit" button → cursor changes to crosshair  
5. User clicks on chart at their exit point → red marker placed
6. User can now hit play to watch the replay with markers

**Acceptance Criteria:**
- Entry marker: Green horizontal line with "ENTRY" label and price
- Exit marker: Red horizontal line with "EXIT" label and price
- Markers snap to nearest candle when clicked
- Markers show price label (e.g., "ENTRY $0.00001234")
- User can click marker to delete it
- User can clear all markers with "Reset Markers" button
- Markers persist during playback

**Marker Visibility During Playback:**
- Before entry candle: No markers visible
- Entry candle reached: Entry marker appears (with animation/highlight)
- Between entry and exit: Entry marker visible, exit not yet shown
- Exit candle reached: Exit marker appears (with animation/highlight)
- After exit: Both markers visible

This creates the dramatic effect of "watching the trade unfold" - viewers see the entry pop up, watch the price action, then see the exit.

#### Method B: Transaction Signature (Optional/Power User)

User pastes Solana transaction signature to auto-populate entry/exit.

**Flow:**
1. User clicks "Import from Transaction" 
2. Modal appears with input for transaction signature
3. User pastes tx signature (e.g., from Solscan)
4. System fetches tx details via Solana RPC/API
5. Extracts: token address, price, timestamp, buy/sell direction
6. Auto-populates the appropriate marker

**Acceptance Criteria:**
- Validates transaction signature format
- Fetches transaction details from Solana
- Detects if tx is a buy (entry) or sell (exit)
- Places marker at correct timestamp/price
- Shows error if tx doesn't involve a token swap
- Shows error if tx is for different token than loaded chart

**API for Transaction Lookup:**
- Use Helius API or Solana RPC `getTransaction`
- Parse for token swap instructions (Jupiter, Raydium, etc.)
- Extract relevant price and timestamp

**Note:** Transaction import is a "nice to have" for MVP. Click-to-mark covers the primary use case. Transaction import can be added post-launch.

---

### 3. Chart Display

**Requirement:** Candlestick chart that renders historical OHLCV data

**Acceptance Criteria:**
- Uses TradingView's lightweight-charts library
- Dark theme matching trading aesthetic
- Green candles for up, red candles for down
- Responsive width (fills container)
- Fixed height of 500px minimum
- Chart auto-scales Y-axis to visible data
- Shows price axis on right
- Shows time axis on bottom

**Visual Style:**
- Background: #0a0a0a (near black)
- Grid lines: #1f2937 (subtle gray)
- Up candles: #22c55e (green)
- Down candles: #ef4444 (red)
- Text: #d1d5db (light gray)

---

### 4. Theatre Mode Playback Controls

**Requirement:** Full DVR-style controls for navigating chart history

**Core Controls:**

| Control | Function | Keyboard Shortcut |
|---------|----------|-------------------|
| Play/Pause | Toggle playback | Space |
| Step Back | Move back 1 candle | Left Arrow |
| Step Forward | Move forward 1 candle | Right Arrow |
| Jump to Start | Go to first candle | Home |
| Jump to End | Go to last candle | End |

**Speed Controls:**
- Available speeds: 0.25x, 0.5x, 1x, 2x, 5x, 10x
- Default: 1x
- Visual indicator of current speed
- Base interval at 1x = 100ms per candle

**Timeline Scrubber:**
- Horizontal slider spanning full width
- Draggable handle showing current position
- Click anywhere on timeline to jump to that position
- Visual progress indicator
- Shows current position / total candles (e.g., "150 / 500")

**Acceptance Criteria:**
- All controls work during playback and while paused
- Scrubber updates in real-time during playback
- Playback auto-pauses when reaching the end
- Controls are disabled during data loading
- Keyboard shortcuts work when page is focused

---

### 5. Timeframe Selection

**Requirement:** Allow users to select candle timeframe

**Available Timeframes:**
- 1m (1 minute)
- 5m (5 minutes) - DEFAULT
- 15m (15 minutes)
- 1H (1 hour)
- 4H (4 hours)
- 1D (1 day)

**Acceptance Criteria:**
- Timeframe buttons clearly show current selection
- Changing timeframe triggers new data fetch
- Playback resets to start when timeframe changes
- Loading state shown during fetch

---

### 6. Date Range Selection

**Requirement:** Allow users to select the time period to replay

**Preset Options:**
- Last 2 hours
- Last 6 hours
- Last 24 hours (DEFAULT)
- Last 7 days
- Last 30 days

**Acceptance Criteria:**
- Preset buttons clearly show current selection
- Changing range triggers new data fetch
- Playback resets to start when range changes
- System handles cases where token didn't exist for full range
- Maximum candles capped at 5000 to ensure performance

---

### 7. Fullscreen Mode

**Requirement:** Dedicated fullscreen view for clean screen recording

**Acceptance Criteria:**
- Single button triggers browser fullscreen API
- Only chart and minimal controls visible in fullscreen
- ESC key exits fullscreen
- Controls auto-hide after 3 seconds of inactivity
- Mouse movement shows controls again
- Fullscreen background is pure black

---

### 8. Current Stats Overlay

**Requirement:** Display current candle information during playback

**Stats to Display:**
- Current price
- Price change (absolute and percentage) from first visible candle
- Current candle timestamp
- Volume (if available)

**Acceptance Criteria:**
- Stats update in real-time as playback progresses
- Positioned in top-left corner of chart area
- Semi-transparent background for readability
- Does not obstruct chart view

---

## Technical Architecture

### Stack

| Component | Technology | Reason |
|-----------|------------|--------|
| Framework | Next.js 14 (App Router) | Fast development, API routes, deployment |
| Language | TypeScript | Type safety, better DX |
| Styling | Tailwind CSS | Rapid UI development |
| Charting | lightweight-charts v4 | TradingView quality, performant, free |
| Deployment | Vercel | Zero-config Next.js hosting |
| Data Source | Birdeye API | Reliable Solana OHLCV data |

### Project Structure

```
clips/
├── app/
│   ├── page.tsx                    # Main application page
│   ├── layout.tsx                  # Root layout with metadata
│   ├── globals.css                 # Tailwind imports + custom styles
│   └── api/
│       ├── candles/
│       │   └── route.ts            # Birdeye API proxy endpoint
│       └── transaction/
│           └── route.ts            # Transaction lookup endpoint (optional)
├── components/
│   ├── AddressInput.tsx            # Token CA input with validation
│   ├── ChartContainer.tsx          # Main wrapper component
│   ├── Chart.tsx                   # lightweight-charts implementation
│   ├── ChartMarkers.tsx            # Entry/exit marker rendering
│   ├── MarkerControls.tsx          # Mark Entry/Exit buttons
│   ├── PlaybackControls.tsx        # Play/pause/step buttons
│   ├── SpeedSelector.tsx           # Speed control buttons
│   ├── Timeline.tsx                # Scrubber/slider component
│   ├── TimeframeSelector.tsx       # 1m/5m/15m/1H/4H/1D buttons
│   ├── DateRangeSelector.tsx       # Preset time range buttons
│   ├── StatsOverlay.tsx            # Current price/change display
│   ├── TradeStats.tsx              # Entry/exit P&L display
│   ├── FullscreenButton.tsx        # Fullscreen toggle
│   └── LoadingSpinner.tsx          # Loading state indicator
├── hooks/
│   ├── usePlayback.ts              # Core playback state machine
│   ├── useCandleData.ts            # Data fetching and caching
│   ├── useMarkers.ts               # Entry/exit marker state
│   ├── useKeyboardControls.ts      # Keyboard shortcut handler
│   └── useFullscreen.ts            # Fullscreen API wrapper
├── lib/
│   ├── birdeye.ts                  # Birdeye API client
│   ├── validation.ts               # Address validation utilities
│   ├── formatters.ts               # Price/date formatting
│   └── constants.ts                # App constants
├── types/
│   └── index.ts                    # TypeScript type definitions
├── public/
│   └── favicon.ico
├── .env.local                      # Environment variables (not committed)
├── .env.example                    # Example env file
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## Data Layer

### Birdeye API Integration

**Endpoint:** `GET https://public-api.birdeye.so/defi/ohlcv`

**Required Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| address | string | Token contract address |
| type | string | Timeframe: 1m, 5m, 15m, 1H, 4H, 1D |
| time_from | number | Unix timestamp (seconds) |
| time_to | number | Unix timestamp (seconds) |

**Required Headers:**
| Header | Value |
|--------|-------|
| X-API-KEY | Your Birdeye API key |

**Response Shape:**
```typescript
interface BirdeyeResponse {
  success: boolean
  data: {
    items: Array<{
      unixTime: number
      o: number  // open
      h: number  // high
      l: number  // low
      c: number  // close
      v: number  // volume
    }>
  }
}
```

**API Key:**
- Free tier: 1000 requests/month
- Get key at: https://birdeye.so → Developer Portal
- Store in `BIRDEYE_API_KEY` environment variable

### Internal API Route

**Endpoint:** `GET /api/candles`

**Query Parameters:**
| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| address | string | Yes | - |
| timeframe | string | No | 5m |
| time_from | number | No | 24 hours ago |
| time_to | number | No | now |

**Response:**
```typescript
interface CandleResponse {
  success: boolean
  data: Candle[]
  token?: {
    symbol: string
    name: string
  }
  error?: string
}
```

**Error Handling:**
- 400: Missing or invalid address
- 404: Token not found
- 429: Rate limited
- 500: Birdeye API error

---

## Type Definitions

```typescript
// types/index.ts

export interface Candle {
  time: number      // Unix timestamp in seconds
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface TradeMarker {
  type: 'entry' | 'exit'
  price: number
  time: number      // Unix timestamp matching candle time
  candleIndex: number
}

export interface MarkersState {
  entry: TradeMarker | null
  exit: TradeMarker | null
  isPlacingEntry: boolean
  isPlacingExit: boolean
}

export interface PlaybackState {
  status: 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'error'
  playheadIndex: number
  speed: PlaybackSpeed
  error?: string
}

export type PlaybackSpeed = 0.25 | 0.5 | 1 | 2 | 5 | 10

export type Timeframe = '1m' | '5m' | '15m' | '1H' | '4H' | '1D'

export type DateRange = '2h' | '6h' | '24h' | '7d' | '30d'

export interface TokenInfo {
  address: string
  symbol: string
  name: string
}

export interface ChartConfig {
  timeframe: Timeframe
  dateRange: DateRange
}

export interface TradeStats {
  entryPrice: number
  exitPrice: number
  priceChange: number
  percentChange: number
  isProfit: boolean
}
```

---

## Component Specifications

### AddressInput

**Props:**
```typescript
interface AddressInputProps {
  onSubmit: (address: string) => void
  isLoading: boolean
  error?: string
}
```

**Behavior:**
- Validates Solana address format on submit
- Shows inline error for invalid addresses
- Disables input and shows spinner while loading
- Clears error when user starts typing
- Supports paste from clipboard
- Auto-focuses on mount

**Validation Rules:**
- Must be base58 encoded
- Length between 32-44 characters
- No whitespace

---

### Chart

**Props:**
```typescript
interface ChartProps {
  candles: Candle[]
  height?: number
}
```

**Behavior:**
- Initializes lightweight-charts on mount
- Updates data when candles array changes
- Auto-fits visible range to data
- Handles resize events
- Cleans up chart instance on unmount

**Implementation Notes:**
- Use `createChart` from lightweight-charts
- Add candlestick series with `addCandlestickSeries`
- Call `setData` on series when candles update
- Use `timeScale().fitContent()` to auto-fit

---

### usePlayback Hook

**Interface:**
```typescript
interface UsePlaybackReturn {
  // State
  visibleCandles: Candle[]
  playheadIndex: number
  totalCandles: number
  isPlaying: boolean
  speed: PlaybackSpeed
  progress: number  // 0-100 percentage
  
  // Actions
  play: () => void
  pause: () => void
  toggle: () => void
  seekTo: (index: number) => void
  seekToProgress: (percent: number) => void
  stepForward: () => void
  stepBackward: () => void
  jumpToStart: () => void
  jumpToEnd: () => void
  setSpeed: (speed: PlaybackSpeed) => void
  reset: () => void
}
```

**Implementation:**
```typescript
// Playback loop logic
useEffect(() => {
  if (!isPlaying || playheadIndex >= candles.length - 1) {
    if (playheadIndex >= candles.length - 1) {
      setIsPlaying(false)
    }
    return
  }

  const baseInterval = 100 // ms per candle at 1x
  const interval = baseInterval / speed
  
  const timer = setTimeout(() => {
    setPlayheadIndex(prev => prev + 1)
  }, interval)

  return () => clearTimeout(timer)
}, [isPlaying, playheadIndex, speed, candles.length])
```

---

### useMarkers Hook

**Interface:**
```typescript
interface UseMarkersReturn {
  // State
  entry: TradeMarker | null
  exit: TradeMarker | null
  isPlacingEntry: boolean
  isPlacingExit: boolean
  tradeStats: TradeStats | null
  
  // Actions
  startPlacingEntry: () => void
  startPlacingExit: () => void
  cancelPlacing: () => void
  placeMarker: (price: number, time: number, candleIndex: number) => void
  removeEntry: () => void
  removeExit: () => void
  clearAll: () => void
}
```

**Implementation Notes:**
- When `isPlacingEntry` or `isPlacingExit` is true, chart click handler calls `placeMarker`
- `placeMarker` determines entry vs exit based on which mode is active
- `tradeStats` auto-calculates when both entry and exit are set
- Markers should snap to the closest candle's close price when clicked

**Trade Stats Calculation:**
```typescript
const calculateTradeStats = (entry: TradeMarker, exit: TradeMarker): TradeStats => {
  const priceChange = exit.price - entry.price
  const percentChange = ((exit.price - entry.price) / entry.price) * 100
  return {
    entryPrice: entry.price,
    exitPrice: exit.price,
    priceChange,
    percentChange,
    isProfit: priceChange > 0
  }
}
```

---

### Timeline (Scrubber)

**Props:**
```typescript
interface TimelineProps {
  progress: number          // 0-100
  currentIndex: number
  totalCandles: number
  onSeek: (percent: number) => void
  disabled?: boolean
}
```

**Behavior:**
- Range input (slider) from 0 to 100
- Updates in real-time during playback
- Click/drag to seek
- Shows position text: "150 / 500"
- Styled with Tailwind (custom thumb, track colors)

---

### PlaybackControls

**Props:**
```typescript
interface PlaybackControlsProps {
  isPlaying: boolean
  onPlay: () => void
  onPause: () => void
  onStepForward: () => void
  onStepBackward: () => void
  onJumpToStart: () => void
  onJumpToEnd: () => void
  disabled?: boolean
  atStart: boolean
  atEnd: boolean
}
```

**Button Layout:**
```
[⏮] [⏪] [▶/⏸] [⏩] [⏭]
```

---

### MarkerControls

**Props:**
```typescript
interface MarkerControlsProps {
  hasEntry: boolean
  hasExit: boolean
  isPlacingEntry: boolean
  isPlacingExit: boolean
  onStartPlacingEntry: () => void
  onStartPlacingExit: () => void
  onCancelPlacing: () => void
  onClearAll: () => void
  disabled?: boolean
}
```

**Button States:**
- "Mark Entry" button: 
  - Default: Green outline
  - Active (placing): Green filled, pulsing
  - Placed: Green with checkmark, clicking removes
- "Mark Exit" button:
  - Default: Red outline  
  - Active (placing): Red filled, pulsing
  - Placed: Red with checkmark, clicking removes
- "Reset" button: Only visible when at least one marker placed

**Layout:**
```
[📍 Mark Entry] [🎯 Mark Exit] [↺ Reset]
```

---

### TradeStats

**Props:**
```typescript
interface TradeStatsProps {
  stats: TradeStats | null
  isVisible: boolean  // Only show after exit marker is placed during playback
}
```

**Display:**
```
┌─────────────────────────┐
│ ENTRY: $0.00001234      │
│ EXIT:  $0.00006789      │
│ P&L:   +450.12% 🟢      │
└─────────────────────────┘
```

- Green background tint for profit
- Red background tint for loss
- Only appears once playhead reaches exit candle during playback
- Positioned in top-right of chart area

---

### SpeedSelector

**Props:**
```typescript
interface SpeedSelectorProps {
  currentSpeed: PlaybackSpeed
  onSpeedChange: (speed: PlaybackSpeed) => void
  disabled?: boolean
}
```

**Button Layout:**
```
[0.25x] [0.5x] [1x] [2x] [5x] [10x]
```

Highlight current selection with different background color.

---

## UI Layout

### Desktop Layout (Primary)

```
┌─────────────────────────────────────────────────────────────────────┐
│  🎬 Clips                                           [⛶ Fullscreen] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Paste Solana token address                            [→]   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  TOKEN NAME ($SYMBOL)                                              │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ ┌──────────────────┐              ┌──────────────────────┐  │   │
│  │ │ Price: $0.00005  │              │ ENTRY: $0.00001234   │  │   │
│  │ │ Change: +500.00% │              │ EXIT:  $0.00006789   │  │   │
│  │ └──────────────────┘              │ P&L:   +450% 🟢      │  │   │
│  │                                   └──────────────────────┘  │   │
│  │                     CHART AREA                              │   │
│  │                   (Candlesticks)                            │   │
│  │                                                             │   │
│  │          -------- ENTRY $0.00001234 --------               │   │
│  │                                                             │   │
│  │          -------- EXIT $0.00006789 ---------               │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ [📍 Mark Entry] [🎯 Mark Exit] [↺ Reset]                    │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │ [⏮] [◀] [▶] [▶] [⏭]    [0.5x] [1x] [2x] [5x] [10x]         │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │ ●━━━━━━━━━━━━━━━━━━━━━━━○━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│   │
│  │                        150 / 500                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Timeframe: [1m] [5m] [15m] [1H] [4H] [1D]                         │
│                                                                     │
│  Range: [2H] [6H] [24H] [7D] [30D]                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Fullscreen Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│ ┌────────────────────┐                  ┌──────────────────────┐   │
│ │ $0.00005678        │                  │ ENTRY: $0.00001234   │   │
│ │ +450.00%           │                  │ EXIT:  $0.00006789   │   │
│ └────────────────────┘                  │ P&L:   +450% 🟢      │   │
│                                         └──────────────────────┘   │
│                                                                     │
│                         CHART AREA                                  │
│                       (Full Screen)                                 │
│                                                                     │
│            -------- ENTRY $0.00001234 --------                     │
│                                                                     │
│            -------- EXIT $0.00006789 ---------                     │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ [⏮][◀][▶][▶][⏭]  [1x][2x][5x]  ━━━━━━━●━━━━━━━━━  150/500  [✕]   │
└─────────────────────────────────────────────────────────────────────┘
```

Controls auto-hide after 3 seconds, reappear on mouse movement.

---

## Styling Guide

### Color Palette

```css
:root {
  --bg-primary: #0a0a0a;
  --bg-secondary: #111111;
  --bg-tertiary: #1a1a1a;
  --border: #2a2a2a;
  --text-primary: #ffffff;
  --text-secondary: #a1a1aa;
  --text-muted: #71717a;
  --accent: #22c55e;
  --accent-hover: #16a34a;
  --danger: #ef4444;
  --candle-up: #22c55e;
  --candle-down: #ef4444;
}
```

### Tailwind Classes Reference

**Buttons (Primary):**
```
bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors
```

**Buttons (Secondary):**
```
bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-2 rounded-lg transition-colors
```

**Buttons (Selected State):**
```
bg-zinc-700 text-white ring-1 ring-green-500
```

**Input:**
```
bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
```

**Card/Container:**
```
bg-zinc-900 border border-zinc-800 rounded-xl p-4
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Play/Pause toggle |
| Left Arrow | Step back 1 candle |
| Right Arrow | Step forward 1 candle |
| Home | Jump to start |
| End | Jump to end |
| F | Toggle fullscreen |
| Escape | Exit fullscreen |
| 1 | Set speed 1x |
| 2 | Set speed 2x |
| 5 | Set speed 5x |

**Implementation:**
- Use `useEffect` with `keydown` event listener
- Check `document.activeElement` to avoid triggering when typing in input
- Prevent default on handled keys

---

## Error States

### Invalid Address
- Show inline error below input: "Please enter a valid Solana address"
- Input border turns red
- Error clears when user modifies input

### Token Not Found
- Display message in chart area: "Token not found. Please check the address and try again."
- Keep input enabled for retry

### No Data Available
- Display message: "No chart data available for this token in the selected timeframe."
- Suggest trying a different timeframe or range

### API Error
- Display message: "Failed to load chart data. Please try again."
- Include retry button
- Log error details to console

### Rate Limited
- Display message: "Too many requests. Please wait a moment and try again."
- Optionally show countdown timer

---

## Performance Considerations

### Candle Limits
- Maximum 5000 candles per request
- If date range would exceed this, automatically adjust timeframe or truncate range
- Display notice to user when data is truncated

### Chart Updates
- Use `setData` for initial load, `update` for subsequent candles during playback
- Avoid recreating chart instance on data changes
- Debounce resize handler (200ms)

### Memory
- Clear previous candle data when fetching new token
- Dispose chart instance properly on unmount

---

## Analytics Events (Optional Future)

If adding analytics, track:
- Token searched (hashed address)
- Timeframe selected
- Date range selected
- Playback started
- Speed changed
- Fullscreen entered
- Session duration

---

## Environment Variables

```bash
# .env.local

# Required
BIRDEYE_API_KEY=your_birdeye_api_key_here

# Optional (for future features)
# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

**.env.example:**
```bash
BIRDEYE_API_KEY=your_birdeye_api_key_here
```

---

## Deployment

### Vercel Deployment Steps

1. Push code to GitHub repository
2. Connect repository to Vercel
3. Add environment variable: `BIRDEYE_API_KEY`
4. Deploy

### Domain (Optional)
- Configure custom domain in Vercel dashboard
- Suggested: `solanareplay.com`, `chartreplay.xyz`, etc.

---

## Testing Tokens

Use these tokens for development and testing:

| Token | CA | Notes |
|-------|----|----|
| Wrapped SOL | `So11111111111111111111111111111111111111112` | Stable, always has data |
| BONK | `DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263` | Popular memecoin |
| WIF | `EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm` | High volume memecoin |

---

## MVP Scope

### In Scope (MVP)
- ✅ Token address input with validation
- ✅ Candlestick chart display
- ✅ Click-to-mark entry/exit points
- ✅ Marker visibility tied to playback (appear when reached)
- ✅ Trade P&L calculation and display
- ✅ Theatre mode controls (play/pause/scrub/speed)
- ✅ Timeframe selection
- ✅ Date range presets
- ✅ Fullscreen mode
- ✅ Stats overlay
- ✅ Keyboard shortcuts
- ✅ Dark theme
- ✅ Responsive (desktop-first)

### Out of Scope (Future)
- ❌ Transaction signature import (auto-detect entry/exit)
- ❌ Video export (Remotion integration)
- ❌ User accounts / saved tokens
- ❌ Custom watermarks
- ❌ Multiple trades on same chart
- ❌ Share links
- ❌ Mobile-optimized experience
- ❌ Custom themes

---

## Success Metrics

### Validation Goals
- Melly (initial user) actively uses the tool for content creation
- Positive feedback from CT community
- Organic shares/mentions on Twitter

### Usage Metrics (Post-Launch)
- Daily active users
- Tokens replayed per session
- Average session duration
- Fullscreen usage rate

---

## Timeline Estimate

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Setup | 1 hour | Project scaffold, dependencies, env setup |
| Data Layer | 2 hours | API route, Birdeye integration, types |
| Chart Component | 2 hours | lightweight-charts setup, rendering |
| Marker System | 2 hours | useMarkers hook, click-to-place, marker rendering |
| Playback System | 3 hours | usePlayback hook, controls, marker visibility logic |
| UI Polish | 2 hours | Layout, styling, responsive, trade stats display |
| Fullscreen + Extras | 1 hour | Fullscreen mode, keyboard shortcuts |
| Testing + Deploy | 1 hour | Manual testing, Vercel deployment |

**Total Estimated Time: ~14 hours**

---

## Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lightweight-charts": "^4.1.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
```

---

## Commands Reference

```bash
# Create project
npx create-next-app@latest clips --typescript --tailwind --app --src-dir=false

# Install dependencies
npm install lightweight-charts

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## Notes for Claude Code

1. **Start with the API route** - Verify Birdeye data fetching works before building UI
2. **Use server components where possible** - Only mark components `'use client'` when needed for interactivity
3. **Chart component must be client-side** - lightweight-charts requires browser APIs
4. **Test with real tokens** - Use the testing tokens provided above
5. **Handle edge cases** - New tokens may have sparse data, dead tokens may have no recent data
6. **Keep it simple** - This is an MVP, resist adding features not in scope

---

## Appendix: Birdeye API Response Example

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "unixTime": 1706400000,
        "o": 0.00001234,
        "h": 0.00001250,
        "l": 0.00001200,
        "c": 0.00001245,
        "v": 1500000
      },
      {
        "unixTime": 1706400300,
        "o": 0.00001245,
        "h": 0.00001300,
        "l": 0.00001240,
        "c": 0.00001290,
        "v": 2000000
      }
    ]
  }
}
```

---

*Document Version: 1.0*
*Last Updated: January 2025*
