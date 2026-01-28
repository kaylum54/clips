import type { Timeframe, BirdeyeResponse, Candle, BirdeyeOHLCVItem } from '@/types'

const BIRDEYE_API_BASE = 'https://public-api.birdeye.so'

/**
 * Converts Birdeye timeframe to API format
 */
export function getTimeframeValue(timeframe: Timeframe): string {
  // Birdeye uses lowercase for minutes and uppercase for hours/days
  return timeframe
}

/**
 * Transforms Birdeye OHLCV data to our Candle format
 */
export function transformCandles(items: BirdeyeOHLCVItem[]): Candle[] {
  return items.map(item => ({
    time: item.unixTime,
    open: item.o,
    high: item.h,
    low: item.l,
    close: item.c,
    volume: item.v,
  }))
}

/**
 * Fetches OHLCV candle data from Birdeye API
 * Should only be called from server-side (API routes)
 */
export async function fetchCandlesFromBirdeye(
  address: string,
  timeframe: Timeframe,
  timeFrom: number,
  timeTo: number
): Promise<Candle[]> {
  const apiKey = process.env.BIRDEYE_API_KEY

  if (!apiKey) {
    throw new Error('BIRDEYE_API_KEY is not configured')
  }

  const params = new URLSearchParams({
    address,
    type: getTimeframeValue(timeframe),
    time_from: String(timeFrom),
    time_to: String(timeTo),
  })

  const url = `${BIRDEYE_API_BASE}/defi/ohlcv?${params}`

  const response = await fetch(url, {
    headers: {
      'X-API-KEY': apiKey,
    },
  })

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limited. Please try again later.')
    }
    if (response.status === 404) {
      throw new Error('Token not found')
    }
    throw new Error(`Birdeye API error: ${response.status}`)
  }

  const data: BirdeyeResponse = await response.json()

  if (!data.success || !data.data?.items) {
    throw new Error('Invalid response from Birdeye API')
  }

  return transformCandles(data.data.items)
}

export interface TokenMetadata {
  symbol: string
  name: string
  supply: number | null
  decimals: number
}

/**
 * Fetches token metadata from Birdeye including supply for market cap calculation
 */
export async function fetchTokenInfo(address: string): Promise<TokenMetadata | null> {
  const apiKey = process.env.BIRDEYE_API_KEY

  if (!apiKey) {
    return null
  }

  try {
    const url = `${BIRDEYE_API_BASE}/defi/token_overview?address=${address}`

    const response = await fetch(url, {
      headers: {
        'X-API-KEY': apiKey,
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    if (data.success && data.data) {
      // Calculate supply from market cap and price if available
      // Birdeye provides mc (market cap) and price
      let supply: number | null = null

      const price = data.data.price
      const marketCap = data.data.mc || data.data.realMc

      if (price && price > 0 && marketCap && marketCap > 0) {
        supply = marketCap / price
      } else if (data.data.supply) {
        supply = data.data.supply
      }

      return {
        symbol: data.data.symbol || 'UNKNOWN',
        name: data.data.name || 'Unknown Token',
        supply,
        decimals: data.data.decimals || 9,
      }
    }

    return null
  } catch {
    return null
  }
}

/**
 * Transforms candle prices to market cap values
 */
export function transformCandlesToMarketCap(candles: Candle[], supply: number): Candle[] {
  return candles.map(candle => ({
    ...candle,
    open: candle.open * supply,
    high: candle.high * supply,
    low: candle.low * supply,
    close: candle.close * supply,
  }))
}
