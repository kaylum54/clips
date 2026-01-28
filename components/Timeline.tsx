'use client'

import { useRef, useState, useCallback, MouseEvent, TouchEvent } from 'react'

interface TimelineProps {
  progress: number          // 0-100
  currentIndex: number
  totalCandles: number
  onSeek: (percent: number) => void
  disabled?: boolean
}

export default function Timeline({
  progress,
  currentIndex,
  totalCandles,
  onSeek,
  disabled = false,
}: TimelineProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [hoverPercent, setHoverPercent] = useState<number | null>(null)

  const calculatePercent = useCallback((clientX: number) => {
    if (!trackRef.current) return 0
    const rect = trackRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100))
    return percent
  }, [])

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (disabled || totalCandles === 0) return
    setIsDragging(true)
    const percent = calculatePercent(e.clientX)
    onSeek(percent)
  }, [disabled, totalCandles, calculatePercent, onSeek])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!trackRef.current) return

    const percent = calculatePercent(e.clientX)
    setHoverPercent(percent)

    if (isDragging && !disabled) {
      onSeek(percent)
    }
  }, [isDragging, disabled, calculatePercent, onSeek])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false)
    setHoverPercent(null)
  }, [])

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || totalCandles === 0) return
    setIsDragging(true)
    const percent = calculatePercent(e.touches[0].clientX)
    onSeek(percent)
  }, [disabled, totalCandles, calculatePercent, onSeek])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging && !disabled) {
      const percent = calculatePercent(e.touches[0].clientX)
      onSeek(percent)
    }
  }, [isDragging, disabled, calculatePercent, onSeek])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Format candle index for display
  const formatIndex = (index: number) => {
    return totalCandles > 0 ? `${index + 1}` : '0'
  }

  return (
    <div className="w-full py-2">
      {/* Track container */}
      <div
        ref={trackRef}
        className={`
          relative h-8 flex items-center cursor-pointer
          ${disabled || totalCandles === 0 ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background track */}
        <div className="absolute inset-x-0 h-2 bg-zinc-800 rounded-full" />

        {/* Hover preview line */}
        {hoverPercent !== null && !disabled && (
          <div
            className="absolute h-2 bg-zinc-600 rounded-full pointer-events-none"
            style={{ width: `${hoverPercent}%` }}
          />
        )}

        {/* Progress fill */}
        <div
          className="absolute h-2 bg-green-500 rounded-full pointer-events-none transition-all duration-75"
          style={{ width: `${progress}%` }}
        />

        {/* Drag handle */}
        <div
          className={`
            absolute w-4 h-4 bg-white rounded-full shadow-lg
            transform -translate-x-1/2 pointer-events-none
            transition-transform duration-75
            ${isDragging ? 'scale-125' : 'hover:scale-110'}
          `}
          style={{ left: `${progress}%` }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between items-center mt-1 text-xs text-zinc-500">
        <span className="font-mono">
          {formatIndex(currentIndex)}
        </span>
        <span className="font-mono">
          {totalCandles > 0 ? totalCandles : '0'} candles
        </span>
      </div>
    </div>
  )
}
