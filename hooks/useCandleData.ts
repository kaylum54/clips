'use client'

import { useState, useCallback, useRef } from 'react'
import type { Candle, TokenInfo, Timeframe, DateRange, DisplayMode, CandleResponse } from '@/types'
import { DEFAULT_TIMEFRAME, DEFAULT_DATE_RANGE } from '@/lib/constants'

interface FetchCandlesOptions {
  timeframe?: Timeframe
  dateRange?: DateRange
  displayMode?: DisplayMode
  timeFrom?: number  // Custom start timestamp (overrides dateRange)
  timeTo?: number    // Custom end timestamp (overrides dateRange)
}

interface UseCandleDataReturn {
  candles: Candle[]
  tokenInfo: TokenInfo | null
  isLoading: boolean
  error: string | null
  timeframe: Timeframe
  dateRange: DateRange
  displayMode: DisplayMode
  supplyAvailable: boolean
  fetchCandles: (address: string, tf?: Timeframe, range?: DateRange, mode?: DisplayMode, options?: FetchCandlesOptions) => Promise<void>
  setTimeframe: (tf: Timeframe) => void
  setDateRange: (range: DateRange) => void
  setDisplayMode: (mode: DisplayMode) => void
  reset: () => void
}

export function useCandleData(): UseCandleDataReturn {
  const [candles, setCandles] = useState<Candle[]>([])
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState<Timeframe>(DEFAULT_TIMEFRAME)
  const [dateRange, setDateRange] = useState<DateRange>(DEFAULT_DATE_RANGE)
  const [displayMode, setDisplayMode] = useState<DisplayMode>('price')
  const [supplyAvailable, setSupplyAvailable] = useState<boolean>(true)
  const [currentAddress, setCurrentAddress] = useState<string | null>(null)

  // Cache token info to avoid re-fetching
  const tokenCacheRef = useRef<Map<string, TokenInfo>>(new Map())

  // Debounce timer ref
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const fetchCandles = useCallback(async (address: string, tf?: Timeframe, range?: DateRange, mode?: DisplayMode, options?: FetchCandlesOptions) => {
    // Use provided values or current state
    const useTimeframe = options?.timeframe ?? tf ?? timeframe
    const useDateRange = options?.dateRange ?? range ?? dateRange
    const useDisplayMode = options?.displayMode ?? mode ?? displayMode
    const customTimeFrom = options?.timeFrom
    const customTimeTo = options?.timeTo

    setIsLoading(true)
    setError(null)
    setCurrentAddress(address)

    // Check if we already have token info cached for this address
    const hasTokenInfo = tokenCacheRef.current.has(address)

    // Retry logic — only retry server errors, not rate limits
    // (rate limits are handled server-side with built-in throttling)
    const maxRetries = 2
    let lastError: Error | null = null

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const params = new URLSearchParams({
          address,
          timeframe: useTimeframe,
          dateRange: useDateRange,
          displayMode: useDisplayMode,
        })

        // Add custom time range if provided (for trade-specific fetches)
        if (customTimeFrom !== undefined && customTimeTo !== undefined) {
          params.set('timeFrom', String(customTimeFrom))
          params.set('timeTo', String(customTimeTo))
        }

        // Skip token info fetch if we already have it cached
        if (hasTokenInfo) {
          params.set('skipTokenInfo', 'true')
        }

        const response = await fetch(`/api/candles?${params}`)
        const data: CandleResponse = await response.json()

        if (!data.success) {
          // Only retry on server errors (5xx), NOT on rate limits
          // Rate limits are throttled server-side — retrying makes it worse
          const isRateLimit = response.status === 429 || data.error?.toLowerCase().includes('rate')
          const isServerError = response.status >= 500 && response.status < 600

          if (isRateLimit) {
            throw new Error(data.error || 'Rate limited. Please wait a moment and try again.')
          }
          if (isServerError && attempt < maxRetries - 1) {
            lastError = new Error(data.error || `Server error (${response.status})`)
            await new Promise(resolve => setTimeout(resolve, 3000))
            continue
          }
          throw new Error(data.error || 'Failed to fetch candles')
        }

        if (data.data.length === 0) {
          throw new Error('No chart data available for this token in the selected timeframe')
        }

        // Success - update candles
        setCandles(data.data)

        // Update supply availability from API response
        if (data.supplyAvailable !== undefined) {
          setSupplyAvailable(data.supplyAvailable)
        }

        // Cache and set token info if available
        if (data.token) {
          tokenCacheRef.current.set(address, data.token)
          setTokenInfo(data.token)
        } else {
          // Try to use cached token info
          const cached = tokenCacheRef.current.get(address)
          if (cached) {
            setTokenInfo(cached)
          }
        }

        // Clear error on success
        setError(null)
        setIsLoading(false)
        return // Success - exit function
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Failed to load chart data')

        // Only retry on network failures / server errors
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000))
          continue
        }

        // Out of retries - break
        break
      }
    }

    // All retries failed
    const message = lastError?.message || 'Failed to load chart data'
    setError(message)

    // Keep token info from cache if available
    const cached = tokenCacheRef.current.get(address)
    if (cached && !tokenInfo) {
      setTokenInfo(cached)
    }

    setIsLoading(false)
  }, [timeframe, dateRange, displayMode, tokenInfo])

  const handleSetTimeframe = useCallback((tf: Timeframe) => {
    setTimeframe(tf)
  }, [])

  const handleSetDateRange = useCallback((range: DateRange) => {
    setDateRange(range)
  }, [])

  const handleSetDisplayMode = useCallback((mode: DisplayMode) => {
    setDisplayMode(mode)
  }, [])

  // Debounced fetch for settings changes
  const debouncedFetch = useCallback((address: string, tf: Timeframe, range: DateRange) => {
    // Clear any pending debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Set loading state immediately for UI feedback
    setIsLoading(true)

    // Debounce the actual fetch by 500ms to avoid rapid requests
    debounceRef.current = setTimeout(() => {
      fetchCandles(address, tf, range)
    }, 500)
  }, [fetchCandles])

  const reset = useCallback(() => {
    setCandles([])
    setTokenInfo(null)
    setError(null)
    setCurrentAddress(null)
  }, [])

  return {
    candles,
    tokenInfo,
    isLoading,
    error,
    timeframe,
    dateRange,
    displayMode,
    supplyAvailable,
    fetchCandles,
    setTimeframe: handleSetTimeframe,
    setDateRange: handleSetDateRange,
    setDisplayMode: handleSetDisplayMode,
    reset,
  }
}
