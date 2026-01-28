'use client'

import type { DateRange } from '@/types'
import { DATE_RANGES } from '@/lib/constants'

interface DateRangeSelectorProps {
  currentRange: DateRange
  onRangeChange: (range: DateRange) => void
  disabled?: boolean
}

export default function DateRangeSelector({
  currentRange,
  onRangeChange,
  disabled = false,
}: DateRangeSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-zinc-500">Range:</span>
      <div className="flex items-center gap-1">
        {DATE_RANGES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onRangeChange(value)}
            disabled={disabled}
            className={`
              px-2 py-1 rounded text-sm font-medium
              transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              ${currentRange === value
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
