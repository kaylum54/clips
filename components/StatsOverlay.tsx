'use client'

import type { Candle } from '@/types'
import { formatPrice, formatPercent, formatDateTime } from '@/lib/formatters'

interface StatsOverlayProps {
  currentCandle: Candle | null
  firstCandle: Candle | null
  tokenSymbol?: string
}

export default function StatsOverlay({ currentCandle, firstCandle, tokenSymbol }: StatsOverlayProps) {
  if (!currentCandle || !firstCandle) return null

  const priceChange = currentCandle.close - firstCandle.close
  const percentChange = ((currentCandle.close - firstCandle.close) / firstCandle.close) * 100
  const isPositive = priceChange >= 0

  return (
    <div className="absolute top-4 left-4 z-10 p-3 rounded-lg bg-zinc-900/80 backdrop-blur-sm border border-zinc-800">
      <div className="space-y-1 font-mono text-sm">
        {tokenSymbol && (
          <div className="text-sm font-bold text-zinc-300 tracking-wide">
            {tokenSymbol}
          </div>
        )}
        <div className="text-lg font-bold text-white">
          {formatPrice(currentCandle.close)}
        </div>
        <div className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {formatPercent(percentChange)}
        </div>
        <div className="text-xs text-zinc-500">
          {formatDateTime(currentCandle.time)}
        </div>
      </div>
    </div>
  )
}
