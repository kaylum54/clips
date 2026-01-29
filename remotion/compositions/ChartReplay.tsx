import React from 'react'
import { useCurrentFrame, useVideoConfig, AbsoluteFill, Img, staticFile } from 'remotion'
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
    </AbsoluteFill>
  )
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
