'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { FULLSCREEN_HIDE_DELAY } from '@/lib/constants'

interface UseFullscreenReturn {
  isFullscreen: boolean
  showControls: boolean
  containerRef: React.RefObject<HTMLDivElement | null>
  toggleFullscreen: () => void
  exitFullscreen: () => void
}

export function useFullscreen(): UseFullscreenReturn {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Update state when fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
      if (!document.fullscreenElement) {
        setShowControls(true)
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Auto-hide controls in fullscreen mode
  useEffect(() => {
    if (!isFullscreen) {
      setShowControls(true)
      return
    }

    const handleMouseMove = () => {
      setShowControls(true)

      // Clear existing timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }

      // Set new timeout to hide controls
      hideTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, FULLSCREEN_HIDE_DELAY)
    }

    // Initial hide after delay
    hideTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, FULLSCREEN_HIDE_DELAY)

    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }, [isFullscreen])

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (err) {
      console.error('Fullscreen error:', err)
    }
  }, [])

  const exitFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen()
      } catch (err) {
        console.error('Exit fullscreen error:', err)
      }
    }
  }, [])

  return {
    isFullscreen,
    showControls,
    containerRef,
    toggleFullscreen,
    exitFullscreen,
  }
}
