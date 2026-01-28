'use client'

import type { DisplayMode } from '@/types'

interface DisplayModeSelectorProps {
  currentMode: DisplayMode
  onModeChange: (mode: DisplayMode) => void
  disabled?: boolean
  supplyAvailable?: boolean
}

const DISPLAY_MODES: { value: DisplayMode; label: string }[] = [
  { value: 'price', label: 'Price' },
  { value: 'marketcap', label: 'Market Cap' },
]

export default function DisplayModeSelector({
  currentMode,
  onModeChange,
  disabled = false,
  supplyAvailable = true,
}: DisplayModeSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-zinc-400">Display:</span>
      <div className="flex rounded-lg bg-zinc-800 p-1">
        {DISPLAY_MODES.map((mode) => {
          const isMarketCapUnavailable = mode.value === 'marketcap' && !supplyAvailable
          const isDisabled = disabled || isMarketCapUnavailable

          return (
            <button
              key={mode.value}
              onClick={() => onModeChange(mode.value)}
              disabled={isDisabled}
              title={isMarketCapUnavailable ? 'Market cap data not available for this token' : undefined}
              className={`
                px-3 py-1 text-sm rounded-md transition-colors
                ${currentMode === mode.value
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:text-white'
                }
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {mode.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
