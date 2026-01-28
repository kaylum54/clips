'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { Candle } from '@/types'

export type RenderStatus = 'idle' | 'starting' | 'pending' | 'processing' | 'completed' | 'failed'

interface RenderMarker {
  candleIndex: number
  price: number
  time: number
}

interface StartRenderData {
  candles: Candle[]
  entryMarker: RenderMarker
  exitMarker: RenderMarker
  speed: number
  tokenSymbol?: string
  startIndex: number
  endIndex: number
}

interface RenderJobState {
  jobId: string | null
  status: RenderStatus
  progress: number
  position: number | null
  estimatedWaitSeconds: number | null
  downloadReady: boolean
  error: string | null
  canRetry: boolean
}

const POLL_INTERVAL_MS = 2000

export function useRenderJob() {
  const [state, setState] = useState<RenderJobState>({
    jobId: null,
    status: 'idle',
    progress: 0,
    position: null,
    estimatedWaitSeconds: null,
    downloadReady: false,
    error: null,
    canRetry: false,
  })

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [])

  // Start a new render job
  const startRender = useCallback(async (data: StartRenderData): Promise<boolean> => {
    // Stop any existing polling
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }

    setState({
      jobId: null,
      status: 'starting',
      progress: 0,
      position: null,
      estimatedWaitSeconds: null,
      downloadReady: false,
      error: null,
      canRetry: false,
    })

    try {
      const response = await fetch('/api/render/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setState(prev => ({
          ...prev,
          status: 'failed',
          error: result.error || 'Failed to start render',
          canRetry: true,
        }))
        return false
      }

      setState(prev => ({
        ...prev,
        jobId: result.jobId,
        status: 'pending',
        position: result.position,
        estimatedWaitSeconds: result.estimatedWaitSeconds,
      }))

      // Start polling for status
      startPolling(result.jobId)

      return true
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Failed to start render',
        canRetry: true,
      }))
      return false
    }
  }, [])

  // Poll for job status
  const startPolling = useCallback((jobId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/render/status/${jobId}`)
        const result = await response.json()

        if (!response.ok) {
          console.error('Status poll error:', result.error)
          return
        }

        setState(prev => ({
          ...prev,
          status: result.status,
          progress: result.progress,
          position: result.position ?? null,
          estimatedWaitSeconds: result.estimatedWaitSeconds ?? null,
          downloadReady: result.downloadReady ?? false,
          error: result.error ?? null,
          canRetry: result.canRetry ?? false,
        }))

        // Stop polling when job is complete or failed
        if (result.status === 'completed' || result.status === 'failed') {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current)
            pollIntervalRef.current = null
          }
        }
      } catch (error) {
        console.error('Status poll error:', error)
      }
    }

    // Poll immediately, then at interval
    poll()
    pollIntervalRef.current = setInterval(poll, POLL_INTERVAL_MS)
  }, [])

  // Download the rendered video
  const downloadVideo = useCallback(async (): Promise<boolean> => {
    if (!state.jobId || !state.downloadReady) {
      return false
    }

    try {
      const response = await fetch(`/api/render/download/${state.jobId}`)

      if (!response.ok) {
        const error = await response.json()
        setState(prev => ({
          ...prev,
          error: error.error || 'Download failed',
        }))
        return false
      }

      // Get the blob and create download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `clip-${state.jobId.slice(0, 8)}.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      // Mark as downloaded
      setState(prev => ({
        ...prev,
        downloadReady: false,
      }))

      return true
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Download failed',
      }))
      return false
    }
  }, [state.jobId, state.downloadReady])

  // Reset state
  const reset = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }

    setState({
      jobId: null,
      status: 'idle',
      progress: 0,
      position: null,
      estimatedWaitSeconds: null,
      downloadReady: false,
      error: null,
      canRetry: false,
    })
  }, [])

  return {
    ...state,
    startRender,
    downloadVideo,
    reset,
    isRendering: state.status === 'starting' || state.status === 'pending' || state.status === 'processing',
  }
}
