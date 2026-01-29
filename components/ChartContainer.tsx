'use client'

import { useCallback, useMemo, useEffect, useRef, useState } from 'react'
import type { Candle, Timeframe, DateRange, DisplayMode, PendingTrade } from '@/types'
import Chart from './Chart'
import StatsOverlay from './StatsOverlay'
import MarkerControls from './MarkerControls'
import PlaybackControls from './PlaybackControls'
import SpeedSelector from './SpeedSelector'
import Timeline from './Timeline'
import TimeframeSelector from './TimeframeSelector'
import DateRangeSelector from './DateRangeSelector'
import DisplayModeSelector from './DisplayModeSelector'
import FullscreenButton from './FullscreenButton'
import LoadingSpinner from './LoadingSpinner'
import { RenderProgressModal } from './RenderProgressModal'
import { UpgradeModal } from './UpgradeModal'
import { usePlayback } from '@/hooks/usePlayback'
import { useMarkers } from '@/hooks/useMarkers'
import { useKeyboardControls } from '@/hooks/useKeyboardControls'
import { useFullscreen } from '@/hooks/useFullscreen'
import { useRenderJob } from '@/hooks/useRenderJob'
import { useUser } from '@/hooks/useUser'

interface ChartContainerProps {
  candles: Candle[]
  isLoading: boolean
  error: string | null
  timeframe: Timeframe
  dateRange: DateRange
  displayMode: DisplayMode
  supplyAvailable?: boolean
  onTimeframeChange: (tf: Timeframe) => void
  onDateRangeChange: (range: DateRange) => void
  onDisplayModeChange: (mode: DisplayMode) => void
  pendingTrade?: PendingTrade | null
  onTradeProcessed?: (entryPrice?: number, exitPrice?: number) => void
  tokenSymbol?: string
}

export default function ChartContainer({
  candles,
  isLoading,
  error,
  timeframe,
  dateRange,
  displayMode,
  supplyAvailable = true,
  onTimeframeChange,
  onDateRangeChange,
  onDisplayModeChange,
  pendingTrade,
  onTradeProcessed,
  tokenSymbol,
}: ChartContainerProps) {
  const processedTradeRef = useRef<string | null>(null)
  const [isRenderModalOpen, setIsRenderModalOpen] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // User subscription and render limits
  const { canRender, isPro, rendersRemaining, renderLimit, isAuthenticated, refreshProfile } = useUser()

  // Async render job hook
  const renderJob = useRenderJob()

  // Hooks
  const {
    visibleCandles,
    playheadIndex,
    totalCandles,
    isPlaying,
    speed,
    progress,
    play,
    pause,
    toggle,
    seekToProgress,
    stepForward,
    stepBackward,
    jumpToStart,
    jumpToEnd,
    setSpeed,
  } = usePlayback({ candles })

  const {
    entry,
    exit,
    isPlacingEntry,
    isPlacingExit,
    startPlacingEntry,
    startPlacingExit,
    cancelPlacing,
    placeMarker,
    setEntryMarker,
    setExitMarker,
    clearAll,
  } = useMarkers()

  // Helper to find closest candle index to a timestamp
  const findClosestCandleIndex = useCallback((timestamp: number) => {
    if (candles.length === 0) return 0

    let closestIndex = 0
    let closestDiff = Math.abs(candles[0].time - timestamp)

    for (let i = 1; i < candles.length; i++) {
      const diff = Math.abs(candles[i].time - timestamp)
      if (diff < closestDiff) {
        closestDiff = diff
        closestIndex = i
      }
    }
    return closestIndex
  }, [candles])

  // Process pending trade from transaction import (entry + exit)
  useEffect(() => {
    if (!pendingTrade || candles.length === 0 || isLoading) return

    // Create a unique ID for this trade including candle data fingerprint
    // This ensures we re-process when candles change (e.g., after fetch completes)
    const candleFingerprint = `${candles.length}-${candles[0]?.time}-${candles[candles.length - 1]?.time}`
    const tradeId = `${pendingTrade.entry.signature}-${pendingTrade.exit.signature}-${candleFingerprint}`
    if (processedTradeRef.current === tradeId) return

    // Normalize timestamps - Helius may return seconds or milliseconds
    // If timestamp is > 10 billion, it's likely milliseconds
    let entryTimestamp = pendingTrade.entry.timestamp
    let exitTimestamp = pendingTrade.exit.timestamp

    if (entryTimestamp > 10000000000) {
      entryTimestamp = Math.floor(entryTimestamp / 1000)
    }
    if (exitTimestamp > 10000000000) {
      exitTimestamp = Math.floor(exitTimestamp / 1000)
    }

    // Debug: Log timestamps and candle times
    console.log('=== Marker Placement Debug ===')
    console.log('Entry timestamp (raw):', pendingTrade.entry.timestamp, '(normalized):', entryTimestamp, new Date(entryTimestamp * 1000).toLocaleTimeString())
    console.log('Exit timestamp (raw):', pendingTrade.exit.timestamp, '(normalized):', exitTimestamp, new Date(exitTimestamp * 1000).toLocaleTimeString())
    console.log('Candles count:', candles.length)
    console.log('Candles range:', new Date(candles[0]?.time * 1000).toLocaleTimeString(), '-', new Date(candles[candles.length - 1]?.time * 1000).toLocaleTimeString())

    // Find candle indices for entry and exit
    const entryIndex = findClosestCandleIndex(entryTimestamp)
    const exitIndex = findClosestCandleIndex(exitTimestamp)

    console.log('Entry index:', entryIndex, 'Candle time:', new Date(candles[entryIndex]?.time * 1000).toLocaleTimeString())
    console.log('Exit index:', exitIndex, 'Candle time:', new Date(candles[exitIndex]?.time * 1000).toLocaleTimeString())

    const entryCandle = candles[entryIndex]
    const exitCandle = candles[exitIndex]

    // Place entry marker - candle close price for chart display, actualPrice for P&L
    setEntryMarker({
      type: 'entry',
      price: entryCandle.close,
      time: entryCandle.time,
      candleIndex: entryIndex,
      actualPrice: pendingTrade.entry.price,
    })

    // Place exit marker - candle close price for chart display, actualPrice for P&L
    setExitMarker({
      type: 'exit',
      price: exitCandle.close,
      time: exitCandle.time,
      candleIndex: exitIndex,
      actualPrice: pendingTrade.exit.price,
    })

    // Seek playhead to entry position (start of the trade)
    seekToProgress((entryIndex / (candles.length - 1)) * 100)

    // Mark as processed
    processedTradeRef.current = tradeId

    // Use actual transaction prices (SOL-denominated) for P&L calculation
    // These are constant across timeframes since they come from on-chain swap data
    onTradeProcessed?.(pendingTrade.entry.price, pendingTrade.exit.price)
  }, [pendingTrade, candles, isLoading, findClosestCandleIndex, setEntryMarker, setExitMarker, seekToProgress, onTradeProcessed])

  const {
    isFullscreen,
    showControls,
    containerRef,
    toggleFullscreen,
  } = useFullscreen()

  // Calculate marker visibility based on playhead position
  const showEntryMarker = useMemo(() => {
    if (!entry) return false
    return playheadIndex >= entry.candleIndex
  }, [entry, playheadIndex])

  const showExitMarker = useMemo(() => {
    if (!exit) return false
    return playheadIndex >= exit.candleIndex
  }, [exit, playheadIndex])

  // Current and first candle for stats overlay
  const currentCandle = visibleCandles[visibleCandles.length - 1] || null
  const firstCandle = candles[0] || null

  // Handle chart click for marker placement
  const handleChartClick = useCallback((price: number, time: number, candleIndex: number) => {
    placeMarker(price, time, candleIndex)
  }, [placeMarker])

  // Handle generate video (async queue-based)
  const handleGenerateVideo = useCallback(async () => {
    if (!entry || !exit || candles.length === 0) return

    // Check if user can render - show upgrade modal if not
    if (!canRender) {
      setShowUpgradeModal(true)
      return
    }

    // Open modal immediately
    setIsRenderModalOpen(true)

    // Calculate end index with buffer for P&L card display
    const fps = 30
    const BASE_INTERVAL_MS = 200
    const msPerCandle = BASE_INTERVAL_MS / speed
    const framesPerCandle = Math.max(1, Math.round(msPerCandle / (1000 / fps)))
    const targetBufferSeconds = 3
    const targetBufferFrames = targetBufferSeconds * fps
    const bufferCandles = Math.ceil(targetBufferFrames / framesPerCandle)
    const endIndex = Math.min(exit.candleIndex + bufferCandles, candles.length - 1)

    // Start async render job
    await renderJob.startRender({
      candles,
      entryMarker: {
        candleIndex: entry.candleIndex,
        price: entry.price,
        time: entry.time,
      },
      exitMarker: {
        candleIndex: exit.candleIndex,
        price: exit.price,
        time: exit.time,
      },
      speed,
      tokenSymbol: tokenSymbol || 'chart',
      startIndex: entry.candleIndex,
      endIndex,
    })

    // Refresh profile immediately to update render counter
    // (server increments renders_this_month at start time)
    await refreshProfile()
  }, [entry, exit, candles, speed, tokenSymbol, renderJob, canRender, refreshProfile])

  // Handle modal close
  const handleRenderModalClose = useCallback(async () => {
    setIsRenderModalOpen(false)
    // Reset render job state if completed or failed
    if (renderJob.status === 'completed' || renderJob.status === 'failed') {
      renderJob.reset()
      // Refresh profile to update render count from server
      await refreshProfile()
    }
  }, [renderJob, refreshProfile])

  // Handle retry
  const handleRenderRetry = useCallback(async () => {
    if (!entry || !exit || candles.length === 0) return

    // Recalculate end index
    const fps = 30
    const BASE_INTERVAL_MS = 200
    const msPerCandle = BASE_INTERVAL_MS / speed
    const framesPerCandle = Math.max(1, Math.round(msPerCandle / (1000 / fps)))
    const targetBufferSeconds = 3
    const targetBufferFrames = targetBufferSeconds * fps
    const bufferCandles = Math.ceil(targetBufferFrames / framesPerCandle)
    const endIndex = Math.min(exit.candleIndex + bufferCandles, candles.length - 1)

    await renderJob.startRender({
      candles,
      entryMarker: {
        candleIndex: entry.candleIndex,
        price: entry.price,
        time: entry.time,
      },
      exitMarker: {
        candleIndex: exit.candleIndex,
        price: exit.price,
        time: exit.time,
      },
      speed,
      tokenSymbol: tokenSymbol || 'chart',
      startIndex: entry.candleIndex,
      endIndex,
    })
  }, [entry, exit, candles, speed, tokenSymbol, renderJob])

  // Keyboard controls
  useKeyboardControls({
    onTogglePlayback: toggle,
    onStepForward: stepForward,
    onStepBackward: stepBackward,
    onJumpToStart: jumpToStart,
    onJumpToEnd: jumpToEnd,
    onSetSpeed: setSpeed,
    onToggleFullscreen: toggleFullscreen,
    disabled: isLoading || candles.length === 0,
  })

  const isPlacingMarker = isPlacingEntry || isPlacingExit

  // Show rate limit warning when there's an error but we still have data
  const showRateLimitWarning = error && candles.length > 0 && error.toLowerCase().includes('rate')

  return (
    <div
      ref={containerRef}
      className={`
        relative w-full
        ${isFullscreen ? 'bg-black h-screen flex flex-col' : ''}
      `}
    >
      {/* Rate Limit Warning Banner */}
      {showRateLimitWarning && (
        <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-200 px-4 py-2 rounded-lg mb-2 text-sm">
          Rate limited - showing cached data. Try again in a few seconds.
        </div>
      )}

      {/* Render Limit Exhausted Banner */}
      {isAuthenticated && !canRender && !isPro && (
        <div className="bg-gradient-to-r from-amber-900/40 to-orange-900/40 border border-amber-600/50 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-amber-200 font-medium">
                  You&apos;ve used all {renderLimit} free renders this month
                </p>
                <p className="text-amber-300/70 text-sm">
                  Upgrade to Pro for unlimited renders and priority queue
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black text-sm font-semibold rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(34,197,94,0.4)] flex-shrink-0"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      )}


      {/* Chart Area */}
      <div className={`relative ${isFullscreen ? 'flex-1' : ''}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 z-20">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {candles.length === 0 && !isLoading ? (
          <div className="h-[500px] flex items-center justify-center bg-zinc-900 rounded-lg border border-zinc-800">
            <p className="text-zinc-500">Enter a token address to load chart data</p>
          </div>
        ) : (
          <>
            <StatsOverlay
              currentCandle={currentCandle}
              firstCandle={firstCandle}
            />
            <Chart
              candles={candles}
              visibleCandles={visibleCandles}
              entryMarker={entry}
              exitMarker={exit}
              showEntryMarker={showEntryMarker}
              showExitMarker={showExitMarker}
              height={isFullscreen ? window.innerHeight - 120 : 500}
              onChartClick={handleChartClick}
              isPlacingMarker={isPlacingMarker}
              tokenSymbol={tokenSymbol}
            />
          </>
        )}
      </div>

      {/* Controls */}
      <div
        className={`
          ${isFullscreen
            ? `absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent fullscreen-controls ${showControls ? '' : 'hidden'}`
            : 'mt-4 space-y-4'
          }
        `}
      >
        {/* Marker Controls Row */}
        <div className={`flex items-center justify-between ${isFullscreen ? 'mb-3' : ''}`}>
          <MarkerControls
            hasEntry={!!entry}
            hasExit={!!exit}
            isPlacingEntry={isPlacingEntry}
            isPlacingExit={isPlacingExit}
            onStartPlacingEntry={startPlacingEntry}
            onStartPlacingExit={startPlacingExit}
            onCancelPlacing={cancelPlacing}
            onClearAll={clearAll}
            disabled={candles.length === 0 || isLoading}
          />
          {!isFullscreen && (
            <FullscreenButton
              isFullscreen={isFullscreen}
              onClick={toggleFullscreen}
            />
          )}
        </div>

        {/* Playback Controls Row */}
        <div className={`flex items-center gap-4 flex-wrap ${isFullscreen ? 'justify-center' : ''}`}>
          <PlaybackControls
            isPlaying={isPlaying}
            onPlay={play}
            onPause={pause}
            onStepForward={stepForward}
            onStepBackward={stepBackward}
            onJumpToStart={jumpToStart}
            onJumpToEnd={jumpToEnd}
            disabled={candles.length === 0 || isLoading}
            atStart={playheadIndex === 0}
            atEnd={playheadIndex >= totalCandles - 1}
          />
          <SpeedSelector
            currentSpeed={speed}
            onSpeedChange={setSpeed}
            disabled={candles.length === 0 || isLoading}
          />
          {/* Generate Video Button */}
          <button
            onClick={handleGenerateVideo}
            disabled={renderJob.isRendering || !entry || !exit || candles.length === 0}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
              transition-all duration-200
              ${renderJob.isRendering || !entry || !exit || candles.length === 0
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : !canRender
                  ? 'bg-zinc-700 text-zinc-400 cursor-pointer hover:bg-zinc-600'
                  : 'bg-green-600 hover:bg-green-500 text-white'
              }
            `}
            title={
              !entry || !exit
                ? 'Place entry and exit markers first'
                : !canRender
                  ? `No renders remaining (${rendersRemaining}/${renderLimit}) - Upgrade to Pro`
                  : isPro
                    ? 'Generate replay video (Pro - Unlimited)'
                    : `Generate replay video (${rendersRemaining}/${renderLimit} remaining)`
            }
          >
            {renderJob.isRendering ? (
              <>
                <LoadingSpinner size="sm" />
                Rendering...
              </>
            ) : !canRender ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Upgrade to Render
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M3.25 4A2.25 2.25 0 001 6.25v7.5A2.25 2.25 0 003.25 16h7.5A2.25 2.25 0 0013 13.75v-7.5A2.25 2.25 0 0010.75 4h-7.5zM19 4.75a.75.75 0 00-1.28-.53l-3 3a.75.75 0 00-.22.53v4.5c0 .199.079.39.22.53l3 3a.75.75 0 001.28-.53V4.75z" />
                </svg>
                Generate Video
              </>
            )}
          </button>
          {isFullscreen && (
            <FullscreenButton
              isFullscreen={isFullscreen}
              onClick={toggleFullscreen}
            />
          )}
        </div>

        {/* Timeline */}
        <Timeline
          progress={progress}
          currentIndex={playheadIndex}
          totalCandles={totalCandles}
          onSeek={seekToProgress}
          disabled={candles.length === 0 || isLoading}
        />

        {/* Timeframe, Date Range, and Display Mode (only in normal mode) */}
        {!isFullscreen && (
          <div className="flex items-center gap-6 flex-wrap">
            <TimeframeSelector
              currentTimeframe={timeframe}
              onTimeframeChange={onTimeframeChange}
              disabled={isLoading}
            />
            <DateRangeSelector
              currentRange={dateRange}
              onRangeChange={onDateRangeChange}
              disabled={isLoading}
            />
            <DisplayModeSelector
              currentMode={displayMode}
              onModeChange={onDisplayModeChange}
              disabled={isLoading}
              supplyAvailable={supplyAvailable}
            />
          </div>
        )}
      </div>

      {/* Render Progress Modal */}
      <RenderProgressModal
        isOpen={isRenderModalOpen}
        status={renderJob.status}
        progress={renderJob.progress}
        position={renderJob.position}
        estimatedWaitSeconds={renderJob.estimatedWaitSeconds}
        downloadReady={renderJob.downloadReady}
        error={renderJob.error}
        canRetry={renderJob.canRetry}
        onClose={handleRenderModalClose}
        onDownload={renderJob.downloadVideo}
        onRetry={handleRenderRetry}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  )
}
