/**
 * useRenderLimit Hook
 * Manages render limit checking and tracking
 *
 * Usage:
 * const { canRender, checkLimit, trackRender, showUpgrade, setShowUpgrade } = useRenderLimit()
 */

import { useState, useCallback } from 'react'
import { useUser } from './useUser'

interface RenderCheckResult {
  canRender: boolean
  isPro: boolean
  rendersThisMonth: number
  renderLimit: number | null
  rendersRemaining: number | null
}

interface TrackRenderParams {
  tradeId?: string
  tokenSymbol?: string
  pnlPercent?: number
  renderDurationMs?: number
}

interface TrackRenderResult {
  success: boolean
  renderId?: string
  rendersThisMonth: number
  rendersRemaining: number | null
  error?: string
}

export function useRenderLimit() {
  const { refreshProfile } = useUser()
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [isTracking, setIsTracking] = useState(false)

  /**
   * Check if user can render (server-side validation)
   */
  const checkLimit = useCallback(async (): Promise<RenderCheckResult> => {
    setIsChecking(true)

    try {
      const response = await fetch('/api/renders/check')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check render limit')
      }

      // Show upgrade modal if can't render
      if (!data.canRender) {
        setShowUpgrade(true)
      }

      return data
    } catch (error) {
      console.error('Failed to check render limit:', error)
      // Fail closed: block render if we can't verify limits
      return {
        canRender: false,
        isPro: false,
        rendersThisMonth: 0,
        renderLimit: 5,
        rendersRemaining: 0,
      }
    } finally {
      setIsChecking(false)
    }
  }, [])

  /**
   * Track a completed render
   */
  const trackRender = useCallback(async (params: TrackRenderParams = {}): Promise<TrackRenderResult> => {
    setIsTracking(true)

    try {
      const response = await fetch('/api/renders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })

      const data = await response.json()

      if (!response.ok) {
        // If limit reached, show upgrade modal
        if (response.status === 403 && data.error === 'Render limit reached') {
          setShowUpgrade(true)
        }

        return {
          success: false,
          rendersThisMonth: data.rendersThisMonth || 0,
          rendersRemaining: data.rendersRemaining ?? null,
          error: data.error,
        }
      }

      // Refresh profile to update local state
      await refreshProfile()

      return {
        success: true,
        renderId: data.renderId,
        rendersThisMonth: data.rendersThisMonth,
        rendersRemaining: data.rendersRemaining,
      }
    } catch (error) {
      console.error('Failed to track render:', error)
      return {
        success: false,
        rendersThisMonth: 0,
        rendersRemaining: null,
        error: 'Failed to track render',
      }
    } finally {
      setIsTracking(false)
    }
  }, [refreshProfile])

  return {
    checkLimit,
    trackRender,
    showUpgrade,
    setShowUpgrade,
    isChecking,
    isTracking,
  }
}
