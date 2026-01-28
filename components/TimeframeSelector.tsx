'use client'

import type { Timeframe } from '@/types'
import { TIMEFRAMES } from '@/lib/constants'

interface TimeframeSelectorProps {
  currentTimeframe: Timeframe
  onTimeframeChange: (timeframe: Timeframe) => void
  disabled?: boolean
}

export default function TimeframeSelector({
  currentTimeframe,
  onTimeframeChange,
  disabled = false,
}: TimeframeSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-zinc-500">Timeframe:</span>
      <div className="flex items-center gap-1">
        {TIMEFRAMES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onTimeframeChange(value)}
            disabled={disabled}
            className={`
              px-2 py-1 rounded text-sm font-medium
              transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              ${currentTimeframe === value
                ? 'bg-zinc-700 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
