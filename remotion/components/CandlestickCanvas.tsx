import React, { useRef, useEffect } from 'react'
import type { Candle, TradeMarker } from '@/types'

interface CandlestickCanvasProps {
  candles: Candle[]
  width: number
  height: number
  entryMarker?: TradeMarker | null
  exitMarker?: TradeMarker | null
  visibleCandleCount: number
}

// Colors matching the web chart
const COLORS = {
  background: '#0a0a0a',
  gridLine: '#1f2937',
  textPrimary: '#9ca3af',
  textSecondary: '#6b7280',
  candleUp: '#22c55e',
  candleDown: '#ef4444',
  entryMarker: '#22c55e',
  exitMarker: '#ef4444',
}

// Chart layout constants
const PADDING = {
  top: 40,
  right: 140, // Increased for larger price axis text
  bottom: 70, // Increased for larger time axis text
  left: 20,
}

export const CandlestickCanvas: React.FC<CandlestickCanvasProps> = ({
  candles,
  width,
  height,
  entryMarker,
  exitMarker,
  visibleCandleCount,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Get visible candles (progressive reveal)
    const visibleCandles = candles.slice(0, visibleCandleCount)
    if (visibleCandles.length === 0) {
      // Draw empty state
      ctx.fillStyle = COLORS.background
      ctx.fillRect(0, 0, width, height)
      ctx.fillStyle = COLORS.textSecondary
      ctx.font = '16px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('No data', width / 2, height / 2)
      return
    }

    // Calculate chart dimensions
    const chartWidth = width - PADDING.left - PADDING.right
    const chartHeight = height - PADDING.top - PADDING.bottom

    // Calculate price range with padding using visible candles
    const prices = visibleCandles.flatMap(c => [c.high, c.low])
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice
    const pricePadding = priceRange * 0.1 || maxPrice * 0.1
    const paddedMinPrice = minPrice - pricePadding
    const paddedMaxPrice = maxPrice + pricePadding
    const paddedPriceRange = paddedMaxPrice - paddedMinPrice

    // Helper functions
    const priceToY = (price: number): number => {
      return PADDING.top + chartHeight * (1 - (price - paddedMinPrice) / paddedPriceRange)
    }

    const indexToX = (index: number): number => {
      const candleWidth = chartWidth / Math.max(visibleCandles.length, 1)
      return PADDING.left + index * candleWidth + candleWidth / 2
    }

    // Clear canvas
    ctx.fillStyle = COLORS.background
    ctx.fillRect(0, 0, width, height)

    // Draw grid lines
    drawGrid(ctx, chartWidth, chartHeight, paddedMinPrice, paddedMaxPrice)

    // Draw price axis
    drawPriceAxis(ctx, paddedMinPrice, paddedMaxPrice, chartHeight, width)

    // Draw time axis
    drawTimeAxis(ctx, visibleCandles, chartWidth, chartHeight)

    // Calculate candle width
    const candleWidth = Math.max(1, (chartWidth / Math.max(visibleCandles.length, 1)) * 0.8)
    const wickWidth = Math.max(1, candleWidth * 0.15)

    // Draw visible candles
    visibleCandles.forEach((candle, index) => {
      const x = indexToX(index)
      const isUp = candle.close >= candle.open
      const color = isUp ? COLORS.candleUp : COLORS.candleDown

      // Draw wick
      const wickX = x - wickWidth / 2
      const wickTop = priceToY(candle.high)
      const wickBottom = priceToY(candle.low)
      ctx.fillStyle = color
      ctx.fillRect(wickX, wickTop, wickWidth, wickBottom - wickTop)

      // Draw body
      const bodyTop = priceToY(Math.max(candle.open, candle.close))
      const bodyBottom = priceToY(Math.min(candle.open, candle.close))
      const bodyHeight = Math.max(1, bodyBottom - bodyTop)
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight)
    })

    // Draw entry marker if visible
    if (entryMarker && entryMarker.candleIndex < visibleCandleCount) {
      const markerCandle = visibleCandles[entryMarker.candleIndex]
      if (markerCandle) {
        drawMarker(
          ctx,
          'entry',
          indexToX(entryMarker.candleIndex),
          priceToY(entryMarker.price),
          COLORS.entryMarker,
          PADDING.top,
          PADDING.top + chartHeight
        )
      }
    }

    // Draw exit marker if visible
    if (exitMarker && exitMarker.candleIndex < visibleCandleCount) {
      const markerCandle = visibleCandles[exitMarker.candleIndex]
      if (markerCandle) {
        drawMarker(
          ctx,
          'exit',
          indexToX(exitMarker.candleIndex),
          priceToY(exitMarker.price),
          COLORS.exitMarker,
          PADDING.top,
          PADDING.top + chartHeight
        )
      }
    }
  }, [candles, width, height, entryMarker, exitMarker, visibleCandleCount])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ display: 'block' }}
    />
  )
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  chartWidth: number,
  chartHeight: number,
  minPrice: number,
  maxPrice: number
) {
  const priceRange = maxPrice - minPrice
  const gridLines = 5

  ctx.strokeStyle = COLORS.gridLine
  ctx.lineWidth = 1

  // Horizontal grid lines
  for (let i = 0; i <= gridLines; i++) {
    const y = PADDING.top + (chartHeight / gridLines) * i
    ctx.beginPath()
    ctx.moveTo(PADDING.left, y)
    ctx.lineTo(PADDING.left + chartWidth, y)
    ctx.stroke()
  }

  // Vertical grid lines (every ~50 candles worth of space)
  const verticalLines = 6
  for (let i = 0; i <= verticalLines; i++) {
    const x = PADDING.left + (chartWidth / verticalLines) * i
    ctx.beginPath()
    ctx.moveTo(x, PADDING.top)
    ctx.lineTo(x, PADDING.top + chartHeight)
    ctx.stroke()
  }
}

function drawPriceAxis(
  ctx: CanvasRenderingContext2D,
  minPrice: number,
  maxPrice: number,
  chartHeight: number,
  canvasWidth: number
) {
  const priceRange = maxPrice - minPrice
  const gridLines = 5

  ctx.fillStyle = COLORS.textPrimary
  ctx.font = 'bold 24px monospace'
  ctx.textAlign = 'left'

  for (let i = 0; i <= gridLines; i++) {
    const price = maxPrice - (priceRange / gridLines) * i
    const y = PADDING.top + (chartHeight / gridLines) * i
    const formattedPrice = formatPrice(price)
    ctx.fillText(formattedPrice, canvasWidth - PADDING.right + 10, y + 8)
  }
}

function drawTimeAxis(
  ctx: CanvasRenderingContext2D,
  candles: Candle[],
  chartWidth: number,
  chartHeight: number
) {
  if (candles.length === 0) return

  const labelCount = 6
  const step = Math.max(1, Math.floor(candles.length / labelCount))

  ctx.fillStyle = COLORS.textSecondary
  ctx.font = 'bold 22px monospace'
  ctx.textAlign = 'center'

  const y = PADDING.top + chartHeight + 35

  for (let i = 0; i < candles.length; i += step) {
    const candle = candles[i]
    const x = PADDING.left + (chartWidth / Math.max(candles.length, 1)) * (i + 0.5)
    const date = new Date(candle.time * 1000)
    const label = formatTimeLabel(date)
    ctx.fillText(label, x, y)
  }
}

function drawMarker(
  ctx: CanvasRenderingContext2D,
  type: 'entry' | 'exit',
  x: number,
  priceY: number,
  color: string,
  chartTop: number = PADDING.top,
  chartBottom: number = PADDING.top + 500
) {
  const isEntry = type === 'entry'
  const label = isEntry ? 'BUY' : 'SELL'

  // Badge dimensions
  const badgeWidth = 50
  const badgeHeight = 24
  const badgeRadius = 12
  const lineLength = 60 // Distance from candle to badge

  // Position badge above for entry, below for exit
  const badgeY = isEntry
    ? Math.max(chartTop + 10, priceY - lineLength - badgeHeight)
    : Math.min(chartBottom - 10, priceY + lineLength + badgeHeight)

  const badgeX = x - badgeWidth / 2

  // Draw connecting line with glow
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.shadowColor = color
  ctx.shadowBlur = 8
  ctx.beginPath()
  ctx.moveTo(x, priceY)
  ctx.lineTo(x, isEntry ? badgeY + badgeHeight : badgeY - badgeHeight)
  ctx.stroke()
  ctx.restore()

  // Draw price point circle
  ctx.save()
  ctx.shadowColor = color
  ctx.shadowBlur = 12
  ctx.beginPath()
  ctx.arc(x, priceY, 6, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
  ctx.restore()

  // Inner white dot
  ctx.beginPath()
  ctx.arc(x, priceY, 3, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()

  // Draw badge background with glow
  ctx.save()
  ctx.shadowColor = color
  ctx.shadowBlur = 15
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.roundRect(badgeX, isEntry ? badgeY : badgeY - badgeHeight, badgeWidth, badgeHeight, badgeRadius)
  ctx.fill()
  ctx.restore()

  // Draw badge border
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(badgeX, isEntry ? badgeY : badgeY - badgeHeight, badgeWidth, badgeHeight, badgeRadius)
  ctx.stroke()

  // Draw label text
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, x, isEntry ? badgeY + badgeHeight / 2 : badgeY - badgeHeight / 2)
}

function formatPrice(price: number): string {
  if (price === 0) return '0'

  const absPrice = Math.abs(price)

  // Very small numbers (memecoins)
  if (absPrice < 0.00001) {
    // Count leading zeros after decimal
    const str = absPrice.toFixed(20)
    const match = str.match(/^0\.0*/)
    if (match) {
      const zeros = match[0].length - 2 // subtract "0."
      const significantDigits = absPrice.toFixed(zeros + 4).slice(zeros + 2)
      return `0.0{${zeros}}${significantDigits.slice(0, 4)}`
    }
  }

  if (absPrice < 0.0001) return price.toFixed(8)
  if (absPrice < 0.01) return price.toFixed(6)
  if (absPrice < 1) return price.toFixed(4)
  if (absPrice < 100) return price.toFixed(2)
  if (absPrice < 10000) return price.toFixed(1)

  // Large numbers
  if (absPrice >= 1000000) {
    return (price / 1000000).toFixed(2) + 'M'
  }
  if (absPrice >= 1000) {
    return (price / 1000).toFixed(1) + 'K'
  }

  return price.toFixed(0)
}

function formatTimeLabel(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${month}/${day} ${hours}:${minutes}`
}

export default CandlestickCanvas
