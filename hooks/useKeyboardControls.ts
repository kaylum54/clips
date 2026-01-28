'use client'

import { useEffect, useCallback } from 'react'
import type { PlaybackSpeed } from '@/types'

interface UseKeyboardControlsProps {
  onTogglePlayback: () => void
  onStepForward: () => void
  onStepBackward: () => void
  onJumpToStart: () => void
  onJumpToEnd: () => void
  onSetSpeed: (speed: PlaybackSpeed) => void
  onToggleFullscreen: () => void
  disabled?: boolean
}

export function useKeyboardControls({
  onTogglePlayback,
  onStepForward,
  onStepBackward,
  onJumpToStart,
  onJumpToEnd,
  onSetSpeed,
  onToggleFullscreen,
  disabled = false,
}: UseKeyboardControlsProps) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return
    }

    if (disabled) return

    switch (event.key) {
      case ' ': // Space - toggle playback
        event.preventDefault()
        onTogglePlayback()
        break

      case 'ArrowLeft': // Step backward
        event.preventDefault()
        onStepBackward()
        break

      case 'ArrowRight': // Step forward
        event.preventDefault()
        onStepForward()
        break

      case 'Home': // Jump to start
        event.preventDefault()
        onJumpToStart()
        break

      case 'End': // Jump to end
        event.preventDefault()
        onJumpToEnd()
        break

      case 'f': // Toggle fullscreen
      case 'F':
        event.preventDefault()
        onToggleFullscreen()
        break

      case '1': // Speed 1x
        event.preventDefault()
        onSetSpeed(1)
        break

      case '2': // Speed 2x
        event.preventDefault()
        onSetSpeed(2)
        break

      case '5': // Speed 5x
        event.preventDefault()
        onSetSpeed(5)
        break

      case 'Escape': // Exit placing mode or fullscreen
        // Don't prevent default - let browser handle fullscreen exit
        break
    }
  }, [
    disabled,
    onTogglePlayback,
    onStepForward,
    onStepBackward,
    onJumpToStart,
    onJumpToEnd,
    onSetSpeed,
    onToggleFullscreen,
  ])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
