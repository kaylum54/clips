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
 * Fetches token metadata from DexScreener (free API, no key required)
 * Used as fallback when Birdeye fails or returns no data
 */
async function fetchTokenInfoFromDexScreener(address: string): Promise<TokenMetadata | null> {
  try {
    const url = `https://api.dexscreener.com/tokens/v1/solana/${address}`

    const response = await fetch(url)

    if (!response.ok) {
      return null
    }

    const pairs = await response.json()

    if (!Array.isArray(pairs) || pairs.length === 0) {
      return null
    }

    // Find the pair where our address is the base token
    const pair = pairs.find((p: any) => p.baseToken?.address === address) || pairs[0]
    const token = pair.baseToken?.address === address ? pair.baseToken : pair.quoteToken

    if (!token?.symbol) {
      return null
    }

    return {
      symbol: token.symbol,
      name: token.name || token.symbol,
      supply: null, // DexScreener doesn't provide supply directly
      decimals: 9,  // Default for Solana tokens
    }
  } catch {
    return null
  }
}

/**
 * Fetches token metadata from Birdeye including supply for market cap calculation.
 * Falls back to DexScreener if Birdeye fails or returns no data.
 */
export async function fetchTokenInfo(address: string): Promise<TokenMetadata | null> {
  // Try Birdeye first (has supply data for market cap)
  const birdeyeResult = await fetchTokenInfoFromBirdeye(address)
  if (birdeyeResult && birdeyeResult.symbol !== 'UNKNOWN') {
    return birdeyeResult
  }

  // Fallback to DexScreener (free, no API key required)
  const dexScreenerResult = await fetchTokenInfoFromDexScreener(address)
  if (dexScreenerResult) {
    // Merge: prefer DexScreener symbol but keep Birdeye supply if available
    return {
      symbol: dexScreenerResult.symbol,
      name: dexScreenerResult.name,
      supply: birdeyeResult?.supply ?? null,
      decimals: birdeyeResult?.decimals ?? dexScreenerResult.decimals,
    }
  }

  // Return Birdeye result even if symbol is UNKNOWN (still has supply data)
  return birdeyeResult
}

/**
 * Fetches token metadata from Birdeye API
 */
async function fetchTokenInfoFromBirdeye(address: string): Promise<TokenMetadata | null> {
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
