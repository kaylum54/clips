'use client'

import type { PlaybackSpeed } from '@/types'
import { PLAYBACK_SPEEDS } from '@/lib/constants'

interface SpeedSelectorProps {
  currentSpeed: PlaybackSpeed
  onSpeedChange: (speed: PlaybackSpeed) => void
  disabled?: boolean
}

export default function SpeedSelector({
  currentSpeed,
  onSpeedChange,
  disabled = false,
}: SpeedSelectorProps) {
  return (
    <div className="flex items-center gap-1">
      {PLAYBACK_SPEEDS.map((speed) => (
        <button
          key={speed}
          onClick={() => onSpeedChange(speed)}
          disabled={disabled}
          className={`
            px-2 py-1 rounded text-sm font-medium
            transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
            ${currentSpeed === speed
              ? 'bg-zinc-700 text-white ring-1 ring-green-500'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'
            }
          `}
          title={`Set speed to ${speed}x`}
        >
          {speed}x
        </button>
      ))}
    </div>
  )
}
