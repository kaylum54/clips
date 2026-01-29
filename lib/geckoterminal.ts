import type { Timeframe, Candle } from '@/types'

const GECKO_API_BASE = 'https://api.geckoterminal.com/api/v2'

// Cache pool addresses (token address → pool address)
const poolCache = new Map<string, { pool: string; timestamp: number }>()
const POOL_CACHE_TTL = 10 * 60 * 1000 // 10 minutes

/**
 * Maps app timeframes to GeckoTerminal timeframe + aggregate params
 */
function getGeckoTimeframe(timeframe: Timeframe): { tf: string; aggregate: number } {
  switch (timeframe) {
    case '1m': return { tf: 'minute', aggregate: 1 }
    case '5m': return { tf: 'minute', aggregate: 5 }
    case '15m': return { tf: 'minute', aggregate: 15 }
    case '1H': return { tf: 'hour', aggregate: 1 }
    case '4H': return { tf: 'hour', aggregate: 4 }
    case '1D': return { tf: 'day', aggregate: 1 }
    default: return { tf: 'minute', aggregate: 5 }
  }
}

/**
 * Finds the highest-liquidity pool address for a given token on Solana.
 * Results are cached for 10 minutes.
 */
async function findPoolAddress(tokenAddress: string): Promise<string> {
  // Check cache
  const cached = poolCache.get(tokenAddress)
  if (cached && Date.now() - cached.timestamp < POOL_CACHE_TTL) {
    return cached.pool
  }

  const url = `${GECKO_API_BASE}/networks/solana/tokens/${tokenAddress}/pools?page=1`

  const response = await fetch(url)

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Token not found')
    }
    if (response.status === 429) {
      throw new Error('Rate limited. Please try again later.')
    }
    throw new Error(`GeckoTerminal pool lookup error: ${response.status}`)
  }

  const json = await response.json()

  if (!json.data || json.data.length === 0) {
    throw new Error('Token not found')
  }

  // First pool is highest liquidity
  const poolAddress = json.data[0].attributes.address as string

  // Cache result
  poolCache.set(tokenAddress, { pool: poolAddress, timestamp: Date.now() })

  return poolAddress
}

/**
 * Transforms GeckoTerminal OHLCV arrays to our Candle format
 */
function transformOhlcvList(ohlcvList: number[][]): Candle[] {
  return ohlcvList.map(item => ({
    time: item[0],
    open: item[1],
    high: item[2],
    low: item[3],
    close: item[4],
    volume: item[5],
  }))
}

/**
 * Fetches a single page of OHLCV data from GeckoTerminal
 */
async function fetchOhlcvPage(
  poolAddress: string,
  tf: string,
  aggregate: number,
  beforeTimestamp?: number,
  limit: number = 1000
): Promise<Candle[]> {
  const params = new URLSearchParams({
    aggregate: String(aggregate),
    limit: String(limit),
    currency: 'usd',
  })

  if (beforeTimestamp) {
    params.set('before_timestamp', String(beforeTimestamp))
  }

  const url = `${GECKO_API_BASE}/networks/solana/pools/${poolAddress}/ohlcv/${tf}?${params}`

  const response = await fetch(url)

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limited. Please try again later.')
    }
    if (response.status === 404) {
      throw new Error('Token not found')
    }
    throw new Error(`GeckoTerminal API error: ${response.status}`)
  }

  const json = await response.json()

  const ohlcvList = json?.data?.attributes?.ohlcv_list
  if (!Array.isArray(ohlcvList)) {
    return []
  }

  return transformOhlcvList(ohlcvList)
}

/**
 * Returns the candle interval in seconds for a given timeframe
 */
function getIntervalSeconds(timeframe: Timeframe): number {
  switch (timeframe) {
    case '1m': return 60
    case '5m': return 300
    case '15m': return 900
    case '1H': return 3600
    case '4H': return 14400
    case '1D': return 86400
    default: return 300
  }
}

const PAGE_LIMIT = 1000
const MAX_PAGES = 10

/**
 * Fetches OHLCV candle data from GeckoTerminal with automatic pagination.
 * Same signature as the old fetchCandlesFromBirdeye for drop-in replacement.
 */
export async function fetchCandlesFromGeckoTerminal(
  tokenAddress: string,
  timeframe: Timeframe,
  timeFrom: number,
  timeTo: number
): Promise<Candle[]> {
  // Step 1: Resolve token address → pool address
  const poolAddress = await findPoolAddress(tokenAddress)

  // Step 2: Map timeframe
  const { tf, aggregate } = getGeckoTimeframe(timeframe)

  // Step 3: Paginate (GeckoTerminal returns newest-first via before_timestamp)
  const allCandles: Candle[] = []
  // Start by requesting data before (timeTo + 1 interval) to ensure we get the timeTo candle
  let beforeTs: number | undefined = timeTo + getIntervalSeconds(timeframe)

  for (let page = 0; page < MAX_PAGES; page++) {
    // Delay between pages to avoid rate limiting (skip first page)
    if (page > 0) {
      await new Promise(resolve => setTimeout(resolve, 300))
    }

    const candles = await fetchOhlcvPage(poolAddress, tf, aggregate, beforeTs, PAGE_LIMIT)

    if (candles.length === 0) break

    // Filter candles within our time range
    const inRange = candles.filter(c => c.time >= timeFrom && c.time <= timeTo)
    allCandles.push(...inRange)

    // Check if we've gone past our timeFrom (candles come newest-first)
    const oldestCandle = candles[candles.length - 1]
    if (oldestCandle.time <= timeFrom) break

    // If fewer than limit, no more data available
    if (candles.length < PAGE_LIMIT) break

    // Move before_timestamp to oldest candle for next page
    beforeTs = oldestCandle.time
  }

  // Deduplicate by timestamp
  const seen = new Set<number>()
  const deduplicated = allCandles.filter(c => {
    if (seen.has(c.time)) return false
    seen.add(c.time)
    return true
  })

  // Sort ascending by time
  deduplicated.sort((a, b) => a.time - b.time)

  return deduplicated
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
