const BIRDEYE_API_BASE = 'https://public-api.birdeye.so'

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

