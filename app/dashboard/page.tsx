'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import TransactionInput from '@/components/TransactionInput'
import ChartContainer from '@/components/ChartContainer'
import { SaveTradeModal, type SaveTradeData } from '@/components/SaveTradeModal'
import { UpgradeModal } from '@/components/UpgradeModal'
import { useCandleData } from '@/hooks/useCandleData'
import { useUser } from '@/hooks/useUser'
import type { Candle, ParsedSwap, PendingTrade } from '@/types'

// Copy icon SVG component
function CopyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className || "w-4 h-4"}>
      <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
      <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
    </svg>
  )
}

// Check icon SVG component
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className || "w-4 h-4"}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
    </svg>
  )
}

// External link icon SVG component
function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className || "w-4 h-4"}>
      <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
    </svg>
  )
}

export default function Home() {
  const { isAuthenticated, isPro, canRender } = useUser()
  const [pendingTrade, setPendingTrade] = useState<PendingTrade | null>(null)
  const [copied, setCopied] = useState(false)
  const [displayCandles, setDisplayCandles] = useState<Candle[]>([])
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [tradePnl, setTradePnl] = useState<number | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const {
    candles,
    tokenInfo,
    isLoading,
    error,
    timeframe,
    dateRange,
    displayMode,
    supplyAvailable,
    fetchCandles,
    setTimeframe,
    setDateRange,
    setDisplayMode,
  } = useCandleData()

  // Track previous settings for debounced refetch
  const prevSettingsRef = useRef({ timeframe, dateRange, displayMode })
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const initialLoadRef = useRef(true)
  const currentAddressRef = useRef<string | null>(null)

  // Store trade timestamps for use across timeframe changes
  const tradeTimeRangeRef = useRef<{ timeFrom: number; timeTo: number } | null>(null)

  const handleTradeSubmit = useCallback(async (entrySwap: ParsedSwap, exitSwap: ParsedSwap) => {
    // Check if user can render
    if (!canRender) {
      setShowUpgradeModal(true)
      return
    }

    // Set the pending trade
    const trade: PendingTrade = {
      entry: entrySwap,
      exit: exitSwap,
      tokenAddress: entrySwap.tokenAddress,
    }
    setPendingTrade(trade)
    currentAddressRef.current = entrySwap.tokenAddress

    // Always use 1m timeframe for trade replays
    const tradeTimeframe = '1m' as const
    const tradeRange = '30d' as const

    // Normalize timestamps (Helius may return milliseconds)
    let entryTimestamp = entrySwap.timestamp
    let exitTimestamp = exitSwap.timestamp
    if (entryTimestamp > 10000000000) {
      entryTimestamp = Math.floor(entryTimestamp / 1000)
    }
    if (exitTimestamp > 10000000000) {
      exitTimestamp = Math.floor(exitTimestamp / 1000)
    }

    // Calculate time range: 2 hours before entry to 1 hour after exit (buffer for context)
    // This ensures we have candles covering the trade period
    const bufferBefore = 2 * 60 * 60 // 2 hours in seconds
    const bufferAfter = 1 * 60 * 60 // 1 hour in seconds
    const timeFrom = entryTimestamp - bufferBefore
    const timeTo = exitTimestamp + bufferAfter

    // Store trade time range for use when changing timeframes
    tradeTimeRangeRef.current = { timeFrom, timeTo }

    console.log('=== Trade Time Range ===')
    console.log('Entry:', new Date(entryTimestamp * 1000).toISOString())
    console.log('Exit:', new Date(exitTimestamp * 1000).toISOString())
    console.log('Fetching candles from:', new Date(timeFrom * 1000).toISOString())
    console.log('Fetching candles to:', new Date(timeTo * 1000).toISOString())

    // Update state and prevSettingsRef to prevent duplicate fetches from useEffect
    setTimeframe(tradeTimeframe)
    setDateRange(tradeRange)
    prevSettingsRef.current = { timeframe: tradeTimeframe, dateRange: tradeRange, displayMode }

    // Fetch candles for the specific trade time range
    await fetchCandles(entrySwap.tokenAddress, tradeTimeframe, tradeRange, displayMode, {
      timeFrom,
      timeTo,
    })
  }, [fetchCandles, setTimeframe, setDateRange, displayMode, canRender])

  const handleTradeProcessed = useCallback((entryPrice?: number, exitPrice?: number) => {
    // Trade has been processed and markers placed
    // Calculate PnL if we have both prices
    if (entryPrice && exitPrice && entryPrice > 0) {
      const pnl = ((exitPrice - entryPrice) / entryPrice) * 100
      setTradePnl(pnl)
    }
  }, [])

  const handleSaveTrade = useCallback(async (data: SaveTradeData) => {
    const response = await fetch('/api/trades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        tokenAddress: data.tokenAddress,
        tokenSymbol: data.tokenSymbol,
        entryHash: data.entryHash,
        exitHash: data.exitHash,
        entryPrice: data.entryPrice,
        exitPrice: data.exitPrice,
        pnlPercent: data.pnlPercent,
        isPublic: data.isPublic,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to save trade')
    }

    // Show success message
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }, [])

  const copyAddress = useCallback(() => {
    if (!tokenInfo?.address) return
    navigator.clipboard.writeText(tokenInfo.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [tokenInfo?.address])

  // Slice candles to show 60 before entry when a trade is loaded
  useEffect(() => {
    if (!pendingTrade || candles.length === 0 || isLoading) {
      // No trade or no candles, use full candle array
      setDisplayCandles(candles)
      return
    }

    // Find entry timestamp (normalize if needed)
    let entryTimestamp = pendingTrade.entry.timestamp
    if (entryTimestamp > 10000000000) {
      entryTimestamp = Math.floor(entryTimestamp / 1000)
    }

    // Find closest candle index to entry timestamp
    let entryIndex = 0
    let closestDiff = Math.abs(candles[0].time - entryTimestamp)
    for (let i = 1; i < candles.length; i++) {
      const diff = Math.abs(candles[i].time - entryTimestamp)
      if (diff < closestDiff) {
        closestDiff = diff
        entryIndex = i
      }
    }

    // Calculate start index: 60 candles before entry, or 0 if not enough history
    const candlesBefore = 60
    const startIndex = Math.max(0, entryIndex - candlesBefore)

    console.log(`=== Candle Slicing ===`)
    console.log(`Entry index in full array: ${entryIndex}`)
    console.log(`Slicing from index ${startIndex} (${entryIndex - startIndex} candles before entry)`)
    console.log(`Total candles: ${candles.length} -> ${candles.length - startIndex} after slicing`)

    // Slice candles from startIndex onwards
    const slicedCandles = candles.slice(startIndex)
    setDisplayCandles(slicedCandles)
  }, [pendingTrade, candles, isLoading])

  // Debounced refetch when timeframe, date range, or display mode changes
  useEffect(() => {
    // Skip initial render
    if (initialLoadRef.current) {
      initialLoadRef.current = false
      return
    }

    // Only refetch if settings actually changed and we have an address
    if (
      currentAddressRef.current &&
      (timeframe !== prevSettingsRef.current.timeframe ||
        dateRange !== prevSettingsRef.current.dateRange ||
        displayMode !== prevSettingsRef.current.displayMode)
    ) {
      prevSettingsRef.current = { timeframe, dateRange, displayMode }

      // Clear any pending debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      // Debounce the fetch by 100ms to avoid rapid API calls
      debounceRef.current = setTimeout(() => {
        if (currentAddressRef.current) {
          // If we have a trade active, always use the trade time range
          if (tradeTimeRangeRef.current) {
            console.log('=== Timeframe Change with Trade Active ===')
            console.log('Using stored trade time range:', tradeTimeRangeRef.current)
            fetchCandles(currentAddressRef.current, timeframe, dateRange, displayMode, {
              timeFrom: tradeTimeRangeRef.current.timeFrom,
              timeTo: tradeTimeRangeRef.current.timeTo,
            })
          } else {
            fetchCandles(currentAddressRef.current)
          }
        }
      }, 100)
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [timeframe, dateRange, displayMode, fetchCandles])

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Create Trade Replay</h1>
          <p className="text-[#52525b] text-sm mt-1">
            Paste your entry and exit transaction hashes to generate a replay video
          </p>
        </div>

        {/* Transaction Input */}
        <div className="mb-6 bg-gradient-to-b from-[#141414] to-[#111111] border border-[#1f1f1f] rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
          <TransactionInput
            onSubmit={handleTradeSubmit}
            isLoading={isLoading}
            error={error || undefined}
          />
        </div>

        {/* Token Info Card */}
        {tokenInfo && (
          <div className="mb-4 p-4 bg-gradient-to-b from-[#141414] to-[#111111] border border-[#1f1f1f] rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {tokenInfo.name}
                  <span className="ml-2 text-[#71717a] font-normal">${tokenInfo.symbol}</span>
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs text-[#52525b] font-mono">
                    {tokenInfo.address.slice(0, 4)}...{tokenInfo.address.slice(-4)}
                  </code>
                  <button
                    onClick={copyAddress}
                    className="p-1 hover:bg-[#1f1f1f] rounded transition-colors text-[#71717a] hover:text-white"
                    title="Copy address"
                  >
                    {copied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
                  </button>
                  <a
                    href={`https://solscan.io/token/${tokenInfo.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-[#1f1f1f] rounded transition-colors text-[#71717a] hover:text-white"
                    title="View on Solscan"
                  >
                    <ExternalLinkIcon className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trade Info Banner */}
        {pendingTrade && (
          <div className="mb-4 p-4 bg-gradient-to-b from-[#141414] to-[#111111] border border-[#1f1f1f] rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.2)] text-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-green-400 font-medium">● Entry</span>
              <span className="text-[#71717a]">
                {new Date(pendingTrade.entry.timestamp * 1000).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-red-400 font-medium">● Exit</span>
              <span className="text-[#71717a]">
                {new Date(pendingTrade.exit.timestamp * 1000).toLocaleString()}
              </span>
            </div>
            {tradePnl !== null && (
              <div className="flex items-center justify-between pt-2 border-t border-[#1f1f1f]">
                <span className="text-[#71717a] font-medium">P&L</span>
                <span className={`font-bold ${tradePnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {tradePnl >= 0 ? '+' : ''}{tradePnl.toFixed(2)}%
                </span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-[#1f1f1f]">
              <p className="text-[#52525b] text-xs">
                Press play to watch the trade unfold from entry to exit
              </p>
              <button
                onClick={() => setShowSaveModal(true)}
                className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black text-xs font-semibold rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(34,197,94,0.3)] flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Save Trade
              </button>
            </div>
          </div>
        )}

        {/* Success message */}
        {saveSuccess && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Trade saved! View in{' '}
            <Link href="/trades" className="underline hover:text-green-300">
              My Trades
            </Link>
          </div>
        )}

        {/* Chart */}
        <ChartContainer
          candles={displayCandles}
          isLoading={isLoading}
          error={error}
          timeframe={timeframe}
          dateRange={dateRange}
          displayMode={displayMode}
          supplyAvailable={supplyAvailable}
          onTimeframeChange={setTimeframe}
          onDateRangeChange={setDateRange}
          onDisplayModeChange={setDisplayMode}
          pendingTrade={pendingTrade}
          onTradeProcessed={handleTradeProcessed}
          tokenSymbol={tokenInfo?.symbol}
        />

        {/* Keyboard shortcuts hint */}
        <div className="mt-6 text-center text-sm text-[#52525b]">
          <p>
            Press <kbd className="px-2 py-1 bg-[#141414] border border-[#1f1f1f] rounded text-[#a1a1aa] text-xs">Space</kbd> to play/pause,{' '}
            <kbd className="px-2 py-1 bg-[#141414] border border-[#1f1f1f] rounded text-[#a1a1aa] text-xs">F</kbd> for fullscreen
          </p>
        </div>
      </div>

      {/* Save Trade Modal */}
      <SaveTradeModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveTrade}
        defaultData={pendingTrade ? {
          tokenAddress: pendingTrade.tokenAddress,
          tokenSymbol: tokenInfo?.symbol,
          entryHash: pendingTrade.entry.signature,
          exitHash: pendingTrade.exit.signature,
          entryPrice: pendingTrade.entry.price,
          exitPrice: pendingTrade.exit.price,
          pnlPercent: tradePnl ?? undefined,
        } : undefined}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  )
}
