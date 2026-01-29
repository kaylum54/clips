import React from 'react'
import { useCurrentFrame, useVideoConfig, AbsoluteFill, Img, staticFile, spring, interpolate } from 'remotion'
import { CandlestickCanvas } from '../components/CandlestickCanvas'
import type { Candle, TradeMarker } from '@/types'

export interface ChartReplayProps {
  candles: Candle[]
  entryMarker: TradeMarker | null
  exitMarker: TradeMarker | null
  speed: number
  startIndex: number // Entry candle index - video starts with candles up to here visible
  tokenSymbol?: string
  isPro?: boolean
}

interface TradeStats {
  entryPrice: number
  exitPrice: number
  pnlPercent: number
  isProfit: boolean
}

// Base interval in ms at 1x speed
// 200ms = 5 candles per second at 1x, 1.25 candles per second at 0.25x
const BASE_INTERVAL_MS = 200

export const ChartReplay: React.FC<ChartReplayProps> = ({
  candles,
  entryMarker,
  exitMarker,
  speed,
  startIndex,
  tokenSymbol,
  isPro,
}) => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()

  // Calculate how many frames per candle based on speed
  const msPerCandle = BASE_INTERVAL_MS / speed
  const framesPerCandle = Math.max(1, Math.round(msPerCandle / (1000 / fps)))

  // Video starts with candles 0 to startIndex visible (pre-trade history)
  // Then progressively reveals candles from startIndex onwards
  const additionalCandles = Math.floor(frame / framesPerCandle)
  const visibleCandleCount = Math.min(
    startIndex + 1 + additionalCandles, // +1 because we include entry candle from the start
    candles.length
  )

  // Entry marker visible from the start (we begin at entry)
  const showEntryMarker = entryMarker !== null
  // Exit marker appears when we've revealed enough candles
  const showExitMarker = exitMarker ? visibleCandleCount > exitMarker.candleIndex : false

  // Calculate frame when exit marker appears
  const exitAppearFrame = exitMarker
    ? (exitMarker.candleIndex - startIndex) * framesPerCandle
    : Infinity

  // Calculate trade stats
  const tradeStats: TradeStats | null = entryMarker && exitMarker
    ? {
        entryPrice: entryMarker.price,
        exitPrice: exitMarker.price,
        pnlPercent: ((exitMarker.price - entryMarker.price) / entryMarker.price) * 100,
        isProfit: exitMarker.price >= entryMarker.price,
      }
    : null

  // P&L card animation - starts 30 frames after exit appears
  const pnlCardDelay = 30
  const pnlCardStartFrame = exitAppearFrame + pnlCardDelay
  const showPnlCard = frame >= pnlCardStartFrame && tradeStats

  // Animation for P&L card slide-in
  const pnlCardProgress = showPnlCard
    ? spring({
        frame: frame - pnlCardStartFrame,
        fps,
        config: {
          damping: 20,
          stiffness: 100,
          mass: 0.8,
        },
      })
    : 0

  const pnlCardX = interpolate(pnlCardProgress, [0, 1], [-400, 60])
  const pnlCardOpacity = interpolate(pnlCardProgress, [0, 1], [0, 1])

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      {/* Watermark for free users - behind candlesticks */}
      {!isPro && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.15,
            zIndex: 0,
          }}
        >
          <Img
            src={staticFile('motionclipswatermark.jpeg')}
            style={{
              width: width * 0.4,
              height: 'auto',
            }}
          />
        </div>
      )}

      {/* Token name at top of chart */}
      {tokenSymbol && (
        <div
          style={{
            position: 'absolute',
            top: 24,
            left: 30,
            zIndex: 10,
          }}
        >
          <span
            style={{
              fontSize: 120,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.03em',
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
            }}
          >
            {tokenSymbol}
          </span>
        </div>
      )}

      <CandlestickCanvas
        candles={candles}
        width={width}
        height={height}
        entryMarker={showEntryMarker ? entryMarker : null}
        exitMarker={showExitMarker ? exitMarker : null}
        visibleCandleCount={visibleCandleCount}
      />

      {/* P&L Card - appears after exit with slide-in animation */}
      {showPnlCard && tradeStats && (
        <div
          style={{
            position: 'absolute',
            left: pnlCardX,
            top: '35%',
            transform: 'translateY(-50%)',
            opacity: pnlCardOpacity,
          }}
        >
          <div
            style={{
              position: 'relative',
              width: 420,
              height: 280,
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
            }}
          >
            {/* Background image */}
            <Img
              src={staticFile('clipspnl4.jpeg')}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />

            {/* Stats overlay */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: '50%',
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '20px 30px',
              }}
            >
              {/* P&L Percentage */}
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 800,
                  color: tradeStats.isProfit ? '#22c55e' : '#ef4444',
                  marginBottom: 16,
                  textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                }}
              >
                {tradeStats.isProfit ? '+' : ''}{tradeStats.pnlPercent.toFixed(2)}%
              </div>

              {/* Entry Price */}
              <div style={{ marginBottom: 8 }}>
                <span style={{ color: '#9ca3af', fontSize: 14, fontWeight: 500 }}>Entry</span>
                <div style={{ color: '#ffffff', fontSize: 20, fontWeight: 600 }}>
                  ${formatPriceDisplay(tradeStats.entryPrice)}
                </div>
              </div>

              {/* Exit Price */}
              <div>
                <span style={{ color: '#9ca3af', fontSize: 14, fontWeight: 500 }}>Exit</span>
                <div style={{ color: '#ffffff', fontSize: 20, fontWeight: 600 }}>
                  ${formatPriceDisplay(tradeStats.exitPrice)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  )
}

// Helper to format price for display
function formatPriceDisplay(price: number): string {
  if (price < 0.00001) {
    return price.toExponential(4)
  }
  if (price < 0.01) {
    return price.toFixed(8)
  }
  if (price < 1) {
    return price.toFixed(6)
  }
  return price.toFixed(4)
}

/**
 * Calculate the total duration in frames for a given set of candles and speed
 */
export function calculateDurationInFrames(
  candleCount: number,
  speed: number,
  fps: number = 30
): number {
  const msPerCandle = BASE_INTERVAL_MS / speed
  const framesPerCandle = Math.max(1, Math.round(msPerCandle / (1000 / fps)))
  return candleCount * framesPerCandle
}

export default ChartReplay
