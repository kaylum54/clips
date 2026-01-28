'use client'

import { useState, useCallback, useMemo } from 'react'
import type { TradeMarker, TradeStats } from '@/types'

interface UseMarkersReturn {
  // State
  entry: TradeMarker | null
  exit: TradeMarker | null
  isPlacingEntry: boolean
  isPlacingExit: boolean
  tradeStats: TradeStats | null

  // Actions
  startPlacingEntry: () => void
  startPlacingExit: () => void
  cancelPlacing: () => void
  placeMarker: (price: number, time: number, candleIndex: number) => void
  setEntryMarker: (marker: TradeMarker) => void
  setExitMarker: (marker: TradeMarker) => void
  removeEntry: () => void
  removeExit: () => void
  clearAll: () => void
}

function calculateTradeStats(entry: TradeMarker, exit: TradeMarker): TradeStats {
  const priceChange = exit.price - entry.price
  const percentChange = ((exit.price - entry.price) / entry.price) * 100

  return {
    entryPrice: entry.price,
    exitPrice: exit.price,
    priceChange,
    percentChange,
    isProfit: priceChange > 0,
  }
}

export function useMarkers(): UseMarkersReturn {
  const [entry, setEntry] = useState<TradeMarker | null>(null)
  const [exit, setExit] = useState<TradeMarker | null>(null)
  const [isPlacingEntry, setIsPlacingEntry] = useState(false)
  const [isPlacingExit, setIsPlacingExit] = useState(false)

  // Calculate trade stats when both markers are set
  const tradeStats = useMemo(() => {
    if (!entry || !exit) return null
    return calculateTradeStats(entry, exit)
  }, [entry, exit])

  const startPlacingEntry = useCallback(() => {
    setIsPlacingEntry(true)
    setIsPlacingExit(false)
  }, [])

  const startPlacingExit = useCallback(() => {
    setIsPlacingExit(true)
    setIsPlacingEntry(false)
  }, [])

  const cancelPlacing = useCallback(() => {
    setIsPlacingEntry(false)
    setIsPlacingExit(false)
  }, [])

  const placeMarker = useCallback((price: number, time: number, candleIndex: number) => {
    if (isPlacingEntry) {
      setEntry({
        type: 'entry',
        price,
        time,
        candleIndex,
      })
      setIsPlacingEntry(false)
    } else if (isPlacingExit) {
      setExit({
        type: 'exit',
        price,
        time,
        candleIndex,
      })
      setIsPlacingExit(false)
    }
  }, [isPlacingEntry, isPlacingExit])

  // Programmatic marker setting (for transaction import)
  const setEntryMarker = useCallback((marker: TradeMarker) => {
    setEntry(marker)
    setIsPlacingEntry(false)
    setIsPlacingExit(false)
  }, [])

  const setExitMarker = useCallback((marker: TradeMarker) => {
    setExit(marker)
    setIsPlacingEntry(false)
    setIsPlacingExit(false)
  }, [])

  const removeEntry = useCallback(() => {
    setEntry(null)
  }, [])

  const removeExit = useCallback(() => {
    setExit(null)
  }, [])

  const clearAll = useCallback(() => {
    setEntry(null)
    setExit(null)
    setIsPlacingEntry(false)
    setIsPlacingExit(false)
  }, [])

  return {
    entry,
    exit,
    isPlacingEntry,
    isPlacingExit,
    tradeStats,
    startPlacingEntry,
    startPlacingExit,
    cancelPlacing,
    placeMarker,
    setEntryMarker,
    setExitMarker,
    removeEntry,
    removeExit,
    clearAll,
  }
}
