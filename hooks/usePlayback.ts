'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Candle, PlaybackSpeed } from '@/types'
import { DEFAULT_SPEED, BASE_INTERVAL_MS } from '@/lib/constants'

interface UsePlaybackProps {
  candles: Candle[]
}

interface UsePlaybackReturn {
  // State
  visibleCandles: Candle[]
  playheadIndex: number
  totalCandles: number
  isPlaying: boolean
  speed: PlaybackSpeed
  progress: number  // 0-100 percentage

  // Actions
  play: () => void
  pause: () => void
  toggle: () => void
  seekTo: (index: number) => void
  seekToProgress: (percent: number) => void
  stepForward: () => void
  stepBackward: () => void
  jumpToStart: () => void
  jumpToEnd: () => void
  setSpeed: (speed: PlaybackSpeed) => void
  reset: () => void
}

export function usePlayback({ candles }: UsePlaybackProps): UsePlaybackReturn {
  const [playheadIndex, setPlayheadIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState<PlaybackSpeed>(DEFAULT_SPEED)

  const totalCandles = candles.length

  // Calculate visible candles (all candles up to and including playhead)
  const visibleCandles = useMemo(() => {
    if (totalCandles === 0) return []
    return candles.slice(0, playheadIndex + 1)
  }, [candles, playheadIndex, totalCandles])

  // Calculate progress percentage
  const progress = useMemo(() => {
    if (totalCandles <= 1) return 100
    return (playheadIndex / (totalCandles - 1)) * 100
  }, [playheadIndex, totalCandles])

  // Playback loop
  useEffect(() => {
    if (!isPlaying || playheadIndex >= totalCandles - 1) {
      if (playheadIndex >= totalCandles - 1 && isPlaying) {
        setIsPlaying(false)
      }
      return
    }

    const interval = BASE_INTERVAL_MS / speed

    const timer = setTimeout(() => {
      setPlayheadIndex(prev => Math.min(prev + 1, totalCandles - 1))
    }, interval)

    return () => clearTimeout(timer)
  }, [isPlaying, playheadIndex, speed, totalCandles])

  // When candles change, start at the END (current time) so user sees full chart
  useEffect(() => {
    if (candles.length > 0) {
      setPlayheadIndex(candles.length - 1)
    } else {
      setPlayheadIndex(0)
    }
    setIsPlaying(false)
  }, [candles])

  const play = useCallback(() => {
    if (playheadIndex >= totalCandles - 1) {
      // If at the end, restart from beginning
      setPlayheadIndex(0)
    }
    setIsPlaying(true)
  }, [playheadIndex, totalCandles])

  const pause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }, [isPlaying, play, pause])

  const seekTo = useCallback((index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, totalCandles - 1))
    setPlayheadIndex(clampedIndex)
  }, [totalCandles])

  const seekToProgress = useCallback((percent: number) => {
    if (totalCandles <= 1) return
    const index = Math.round((percent / 100) * (totalCandles - 1))
    seekTo(index)
  }, [totalCandles, seekTo])

  const stepForward = useCallback(() => {
    setPlayheadIndex(prev => Math.min(prev + 1, totalCandles - 1))
  }, [totalCandles])

  const stepBackward = useCallback(() => {
    setPlayheadIndex(prev => Math.max(prev - 1, 0))
  }, [])

  const jumpToStart = useCallback(() => {
    setPlayheadIndex(0)
  }, [])

  const jumpToEnd = useCallback(() => {
    setPlayheadIndex(Math.max(0, totalCandles - 1))
  }, [totalCandles])

  const handleSetSpeed = useCallback((newSpeed: PlaybackSpeed) => {
    setSpeed(newSpeed)
  }, [])

  const reset = useCallback(() => {
    // Reset to end (current time) so user sees full chart
    setPlayheadIndex(Math.max(0, candles.length - 1))
    setIsPlaying(false)
    setSpeed(DEFAULT_SPEED)
  }, [candles.length])

  return {
    visibleCandles,
    playheadIndex,
    totalCandles,
    isPlaying,
    speed,
    progress,
    play,
    pause,
    toggle,
    seekTo,
    seekToProgress,
    stepForward,
    stepBackward,
    jumpToStart,
    jumpToEnd,
    setSpeed: handleSetSpeed,
    reset,
  }
}
