import { NextRequest, NextResponse } from 'next/server'
import { fetchCandlesFromGeckoTerminal, transformCandlesToMarketCap } from '@/lib/geckoterminal'
import { fetchTokenInfo, TokenMetadata } from '@/lib/birdeye'
import { isValidSolanaAddress } from '@/lib/validation'
import { DATE_RANGES, DEFAULT_DATE_RANGE, DEFAULT_TIMEFRAME, MAX_CANDLES } from '@/lib/constants'
import type { Timeframe, DateRange, CandleResponse, DisplayMode, Candle } from '@/types'

// Simple in-memory cache for API responses (reduces duplicate requests)
interface CacheEntry {
  candles: Candle[]
  tokenInfo: TokenMetadata | null
  timestamp: number
}
const cache = new Map<string, CacheEntry>()
const CACHE_TTL = 30000 // 30 seconds

function getCacheKey(address: string, timeframe: string, dateRange: string, timeFrom?: number, timeTo?: number): string {
  if (timeFrom && timeTo) {
    return `${address}-${timeframe}-${timeFrom}-${timeTo}`
  }
  return `${address}-${timeframe}-${dateRange}`
}

function getFromCache(key: string): CacheEntry | null {
  const entry = cache.get(key)
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry
  }
  cache.delete(key)
  return null
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  // Get query parameters
  const address = searchParams.get('address')
  const timeframe = (searchParams.get('timeframe') || DEFAULT_TIMEFRAME) as Timeframe
  const dateRange = (searchParams.get('dateRange') || DEFAULT_DATE_RANGE) as DateRange
  const displayMode = (searchParams.get('displayMode') || 'price') as DisplayMode
  const skipTokenInfo = searchParams.get('skipTokenInfo') === 'true'

  // Custom time range for trade-specific fetches (overrides dateRange)
  const customTimeFrom = searchParams.get('timeFrom')
  const customTimeTo = searchParams.get('timeTo')

  // Validate address
  if (!address) {
    return NextResponse.json<CandleResponse>(
      { success: false, data: [], error: 'Missing address parameter' },
      { status: 400 }
    )
  }

  if (!isValidSolanaAddress(address)) {
    return NextResponse.json<CandleResponse>(
      { success: false, data: [], error: 'Invalid Solana address' },
      { status: 400 }
    )
  }

  // Calculate time range - use custom timestamps if provided, otherwise use dateRange
  let timeFrom: number
  let timeTo: number

  if (customTimeFrom && customTimeTo) {
    timeFrom = parseInt(customTimeFrom, 10)
    timeTo = parseInt(customTimeTo, 10)
  } else {
    const now = Math.floor(Date.now() / 1000)
    const rangeConfig = DATE_RANGES.find(r => r.value === dateRange)
    const rangeMs = rangeConfig?.ms || DATE_RANGES[2].ms // Default to 24h
    timeFrom = now - Math.floor(rangeMs / 1000)
    timeTo = now
  }

  try {
    const cacheKey = getCacheKey(address, timeframe, dateRange, timeFrom, timeTo)
    let candles: Candle[]
    let tokenInfo: TokenMetadata | null = null

    // Check cache first
    const cached = getFromCache(cacheKey)
    if (cached) {
      candles = cached.candles
      tokenInfo = cached.tokenInfo
    } else {
      // Fetch candles (always needed)
      // Only fetch token info if not skipped (client doesn't have it cached)
      if (skipTokenInfo) {
        candles = await fetchCandlesFromGeckoTerminal(address, timeframe, timeFrom, timeTo)
      } else {
        // Fetch in parallel only when we need both
        const [candlesResult, tokenInfoResult] = await Promise.all([
          fetchCandlesFromGeckoTerminal(address, timeframe, timeFrom, timeTo),
          fetchTokenInfo(address),
        ])
        candles = candlesResult
        tokenInfo = tokenInfoResult
      }

      // Store in cache
      cache.set(cacheKey, {
        candles,
        tokenInfo,
        timestamp: Date.now(),
      })
    }

    // Limit candles for performance
    let limitedCandles = candles.slice(-MAX_CANDLES)

    // Check if supply data is available for market cap mode
    const supplyAvailable = tokenInfo?.supply != null && tokenInfo.supply > 0

    // Transform to market cap if requested and supply is available
    const effectiveDisplayMode = displayMode === 'marketcap' && supplyAvailable ? 'marketcap' : 'price'
    if (effectiveDisplayMode === 'marketcap' && tokenInfo?.supply) {
      limitedCandles = transformCandlesToMarketCap(limitedCandles, tokenInfo.supply)
    }

    return NextResponse.json<CandleResponse>({
      success: true,
      data: limitedCandles,
      token: tokenInfo ? {
        address,
        symbol: tokenInfo.symbol,
        name: tokenInfo.name,
      } : undefined,
      displayMode: effectiveDisplayMode,
      supplyAvailable,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch candle data'

    // Determine appropriate status code
    let status = 500
    if (message.includes('Rate limited')) {
      status = 429
    } else if (message.includes('not found')) {
      status = 404
    } else if (message.includes('not configured')) {
      status = 500
    }

    return NextResponse.json<CandleResponse>(
      { success: false, data: [], error: message },
      { status }
    )
  }
}
