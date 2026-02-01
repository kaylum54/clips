import type { Timeframe, DateRange, PlaybackSpeed } from '@/types'

// Available playback speeds
export const PLAYBACK_SPEEDS: PlaybackSpeed[] = [0.25, 0.5, 1, 2, 5, 10]

// Default playback speed
export const DEFAULT_SPEED: PlaybackSpeed = 1

// Base interval in ms per candle at 1x speed
// 200ms = 5 candles per second at 1x speed
export const BASE_INTERVAL_MS = 200

// Free tier render limit per month
export const FREE_RENDER_LIMIT = 5

// Available timeframes
export const TIMEFRAMES: { value: Timeframe; label: string }[] = [
  { value: '1m', label: '1m' },
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
  { value: '1H', label: '1H' },
  { value: '4H', label: '4H' },
  { value: '1D', label: '1D' },
]

// Default timeframe
export const DEFAULT_TIMEFRAME: Timeframe = '5m'

// Available date ranges with labels and durations in ms
// 'max' uses a special value to fetch all available data
export const DATE_RANGES: { value: DateRange; label: string; ms: number }[] = [
  { value: '2h', label: '2H', ms: 2 * 60 * 60 * 1000 },
  { value: '6h', label: '6H', ms: 6 * 60 * 60 * 1000 },
  { value: '24h', label: '24H', ms: 24 * 60 * 60 * 1000 },
  { value: '7d', label: '7D', ms: 7 * 24 * 60 * 60 * 1000 },
  { value: '30d', label: '30D', ms: 30 * 24 * 60 * 60 * 1000 },
  { value: 'max', label: 'MAX', ms: 365 * 24 * 60 * 60 * 1000 }, // 1 year - will get all available data
]

// Default date range
export const DEFAULT_DATE_RANGE: DateRange = '24h'

// Maximum candles per request for performance
export const MAX_CANDLES = 5000

// Chart styling
export const CHART_COLORS = {
  background: '#0a0a0a',
  gridLines: '#1f2937',
  textColor: '#d1d5db',
  candleUp: '#22c55e',
  candleDown: '#ef4444',
  candleUpWick: '#22c55e',
  candleDownWick: '#ef4444',
}

// Marker colors
export const MARKER_COLORS = {
  entry: '#22c55e',
  exit: '#ef4444',
}

// Test tokens for development
export const TEST_TOKENS = [
  { name: 'Wrapped SOL', symbol: 'SOL', address: 'So11111111111111111111111111111111111111112' },
  { name: 'Bonk', symbol: 'BONK', address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' },
  { name: 'dogwifhat', symbol: 'WIF', address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm' },
]

// Fullscreen auto-hide delay in ms
export const FULLSCREEN_HIDE_DELAY = 3000
