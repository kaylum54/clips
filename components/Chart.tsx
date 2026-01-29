'use client'

import { useEffect, useRef, useCallback } from 'react'
import { createChart, createTextWatermark, CandlestickSeries, CandlestickData, Time, createSeriesMarkers, ISeriesMarkersPluginApi } from 'lightweight-charts'
import type { Candle, TradeMarker } from '@/types'
import { CHART_COLORS, MARKER_COLORS } from '@/lib/constants'

interface ChartProps {
  candles: Candle[]
  visibleCandles?: Candle[]
  entryMarker?: TradeMarker | null
  exitMarker?: TradeMarker | null
  showEntryMarker?: boolean
  showExitMarker?: boolean
  height?: number
  onChartClick?: (price: number, time: number, candleIndex: number) => void
  isPlacingMarker?: boolean
  tokenSymbol?: string
}

// Format price for display - handles very small memecoin prices and large market caps
function formatPrice(price: number): string {
  if (price === 0) return '0'

  // Handle large market cap values
  if (price >= 1_000_000_000) return `$${(price / 1_000_000_000).toFixed(2)}B`
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(2)}M`
  if (price >= 1_000) return `$${(price / 1_000).toFixed(2)}K`

  // Handle small memecoin prices
  if (price < 0.00000001) return price.toExponential(4)
  if (price < 0.0001) return price.toFixed(10)
  if (price < 0.01) return price.toFixed(8)
  if (price < 1) return price.toFixed(6)
  if (price < 100) return price.toFixed(4)
  return price.toFixed(2)
}

// Convert our Candle to lightweight-charts format
function toCandlestickData(candle: Candle): CandlestickData<Time> {
  return {
    time: candle.time as Time,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
  }
}

export default function Chart({
  candles,
  visibleCandles,
  entryMarker,
  exitMarker,
  showEntryMarker = true,
  showExitMarker = true,
  height = 500,
  onChartClick,
  isPlacingMarker = false,
  tokenSymbol,
}: ChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef = useRef<any>(null)
  const markersRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const watermarkRef = useRef<any>(null)

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: {
        background: { color: CHART_COLORS.background },
        textColor: CHART_COLORS.textColor,
      },
      grid: {
        vertLines: { color: CHART_COLORS.gridLines },
        horzLines: { color: CHART_COLORS.gridLines },
      },
      crosshair: {
        mode: 1, // Normal
      },
      rightPriceScale: {
        borderColor: CHART_COLORS.gridLines,
        autoScale: true,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: CHART_COLORS.gridLines,
        timeVisible: true,
        secondsVisible: false,
      },
      localization: {
        priceFormatter: formatPrice,
      },
    })

    // Add text watermark for token symbol
    if (tokenSymbol) {
      const pane = chart.panes()[0]
      watermarkRef.current = createTextWatermark(pane, {
        visible: true,
        horzAlign: 'left',
        vertAlign: 'top',
        lines: [
          {
            text: tokenSymbol,
            color: 'rgba(255, 255, 255, 0.07)',
            fontSize: 48,
          },
        ],
      })
    }

    const series = chart.addSeries(CandlestickSeries, {
      upColor: CHART_COLORS.candleUp,
      downColor: CHART_COLORS.candleDown,
      wickUpColor: CHART_COLORS.candleUpWick,
      wickDownColor: CHART_COLORS.candleDownWick,
      borderVisible: false,
    })

    chartRef.current = chart
    seriesRef.current = series
    markersRef.current = createSeriesMarkers(series)

    // Handle resize
    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
        })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (watermarkRef.current) {
        watermarkRef.current.detach()
        watermarkRef.current = null
      }
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
      markersRef.current = null
    }
  }, [height])

  // Update watermark when tokenSymbol changes
  useEffect(() => {
    if (!chartRef.current) return

    // Remove old watermark
    if (watermarkRef.current) {
      watermarkRef.current.detach()
      watermarkRef.current = null
    }

    // Create new watermark if symbol exists
    if (tokenSymbol) {
      const pane = chartRef.current.panes()[0]
      watermarkRef.current = createTextWatermark(pane, {
        visible: true,
        horzAlign: 'left',
        vertAlign: 'top',
        lines: [
          {
            text: tokenSymbol,
            color: 'rgba(255, 255, 255, 0.07)',
            fontSize: 48,
          },
        ],
      })
    }
  }, [tokenSymbol])

  // Update data when candles change
  useEffect(() => {
    if (!seriesRef.current) return

    const dataToShow = visibleCandles || candles
    if (dataToShow.length === 0) return

    const chartData = dataToShow.map(toCandlestickData)
    seriesRef.current.setData(chartData)

    // Fit content to view
    chartRef.current?.timeScale().fitContent()
  }, [candles, visibleCandles])

  // Handle click for marker placement
  const handleClick = useCallback((event: MouseEvent) => {
    if (!onChartClick || !isPlacingMarker || !chartRef.current || !seriesRef.current) return

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = event.clientX - rect.left

    // Get logical point from coordinates
    const timeScale = chartRef.current.timeScale()
    const time = timeScale.coordinateToTime(x)

    if (time === null) return

    // Find the candle at this time
    const displayCandles = visibleCandles || candles
    const candleIndex = displayCandles.findIndex(c => c.time === time)

    if (candleIndex === -1) return

    const candle = displayCandles[candleIndex]
    onChartClick(candle.close, candle.time, candleIndex)
  }, [onChartClick, isPlacingMarker, candles, visibleCandles])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('click', handleClick)
    return () => container.removeEventListener('click', handleClick)
  }, [handleClick])

  // Update cursor style when placing markers
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.cursor = isPlacingMarker ? 'crosshair' : 'default'
    }
  }, [isPlacingMarker])

  // Update circle markers on candles
  useEffect(() => {
    if (!markersRef.current) return

    const markers: Array<{
      time: Time
      position: 'belowBar' | 'aboveBar'
      color: string
      shape: 'circle'
      text: string
      size: number
    }> = []

    // Add entry marker (green circle below candle)
    if (entryMarker && showEntryMarker) {
      markers.push({
        time: entryMarker.time as Time,
        position: 'belowBar',
        color: MARKER_COLORS.entry,
        shape: 'circle',
        text: 'BUY',
        size: 2,
      })
    }

    // Add exit marker (red circle above candle)
    if (exitMarker && showExitMarker) {
      markers.push({
        time: exitMarker.time as Time,
        position: 'aboveBar',
        color: MARKER_COLORS.exit,
        shape: 'circle',
        text: 'SELL',
        size: 2,
      })
    }

    // Sort markers by time (required by lightweight-charts)
    markers.sort((a, b) => (a.time as number) - (b.time as number))

    markersRef.current.setMarkers(markers)
  }, [entryMarker, exitMarker, showEntryMarker, showExitMarker])

  return (
    <div
      ref={containerRef}
      className="w-full rounded-lg overflow-hidden"
      style={{ height }}
    />
  )
}
