// Candle data (OHLCV)
export interface Candle {
  time: number      // Unix timestamp in seconds
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// Trade marker for entry/exit points
export interface TradeMarker {
  type: 'entry' | 'exit'
  price: number
  time: number      // Unix timestamp matching candle time
  candleIndex: number
  actualPrice?: number  // Actual on-chain trade price for P&L (constant across timeframes)
}

// Marker state management
export interface MarkersState {
  entry: TradeMarker | null
  exit: TradeMarker | null
  isPlacingEntry: boolean
  isPlacingExit: boolean
}

// Playback state machine
export interface PlaybackState {
  status: 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'error'
  playheadIndex: number
  speed: PlaybackSpeed
  error?: string
}

// Available playback speeds
export type PlaybackSpeed = 0.25 | 0.5 | 1 | 2 | 5 | 10

// Chart timeframe options
export type Timeframe = '1m' | '5m' | '15m' | '1H' | '4H' | '1D'

// Date range preset options
export type DateRange = '2h' | '6h' | '24h' | '7d' | '30d' | 'max'

// Display mode for chart Y-axis
export type DisplayMode = 'price' | 'marketcap'

// Token information
export interface TokenInfo {
  address: string
  symbol: string
  name: string
}

// Chart configuration
export interface ChartConfig {
  timeframe: Timeframe
  dateRange: DateRange
}

// Trade statistics for P&L display
export interface TradeStats {
  entryPrice: number
  exitPrice: number
  priceChange: number
  percentChange: number
  isProfit: boolean
}


// Internal API response
export interface CandleResponse {
  success: boolean
  data: Candle[]
  token?: TokenInfo
  error?: string
  displayMode?: DisplayMode
  supplyAvailable?: boolean
}

// Parsed swap from transaction
export interface ParsedSwap {
  type: 'buy' | 'sell'
  tokenAddress: string
  tokenAmount: number
  solAmount: number
  price: number
  timestamp: number
  signature: string
}

// Transaction API response
export interface TransactionResponse {
  success: boolean
  data?: ParsedSwap
  error?: string
}

// Pending trade from transaction imports (entry + exit)
export interface PendingTrade {
  entry: ParsedSwap
  exit: ParsedSwap
  tokenAddress: string
}
