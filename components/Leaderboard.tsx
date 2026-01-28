'use client'

/**
 * Leaderboard Component
 * Shows top trades with period filtering
 */

import { useState, useEffect, useCallback } from 'react'
import { LeaderboardEntry } from './LeaderboardEntry'

type Period = 'all' | 'month' | 'week' | 'today'

interface LeaderboardItem {
  rank: number
  tradeId: string
  username: string
  avatarUrl: string | null
  tokenSymbol: string
  pnlPercent: number
  createdAt: string
}

interface LeaderboardProps {
  initialPeriod?: Period
}

export function Leaderboard({ initialPeriod = 'all' }: LeaderboardProps) {
  const [period, setPeriod] = useState<Period>(initialPeriod)
  const [entries, setEntries] = useState<LeaderboardItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false,
  })

  const fetchLeaderboard = useCallback(async (selectedPeriod: Period, offset = 0) => {
    try {
      setIsLoading(true)
      setError('')

      const response = await fetch(
        `/api/leaderboard?period=${selectedPeriod}&limit=50&offset=${offset}`
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch leaderboard')
      }

      if (offset === 0) {
        setEntries(data.leaderboard)
      } else {
        setEntries((prev) => [...prev, ...data.leaderboard])
      }
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeaderboard(period)
  }, [period, fetchLeaderboard])

  const handlePeriodChange = (newPeriod: Period) => {
    if (newPeriod !== period) {
      setPeriod(newPeriod)
    }
  }

  const periods: { value: Period; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' },
  ]

  return (
    <div>
      {/* Period tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => handlePeriodChange(p.value)}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
              period === p.value
                ? 'bg-green-500 text-black'
                : 'bg-[#1f1f1f] text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 mb-6">
          {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading && entries.length === 0 && (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#2a2a2a] rounded-lg" />
                <div className="w-10 h-10 bg-[#2a2a2a] rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-[#2a2a2a] rounded" />
                  <div className="h-3 w-16 bg-[#2a2a2a] rounded" />
                </div>
                <div className="h-10 w-24 bg-[#2a2a2a] rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && entries.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-[#1f1f1f] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-400">No public trades yet for this period</p>
          <p className="text-gray-500 text-sm mt-2">Be the first to make your trade public!</p>
        </div>
      )}

      {/* Leaderboard entries */}
      {entries.length > 0 && (
        <div className="space-y-3">
          {entries.map((entry) => (
            <LeaderboardEntry
              key={entry.tradeId}
              rank={entry.rank}
              username={entry.username}
              avatarUrl={entry.avatarUrl}
              tokenSymbol={entry.tokenSymbol}
              pnlPercent={entry.pnlPercent}
              tradeId={entry.tradeId}
              createdAt={entry.createdAt}
            />
          ))}
        </div>
      )}

      {/* Load more */}
      {pagination.hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={() => fetchLeaderboard(period, pagination.offset + pagination.limit)}
            disabled={isLoading}
            className="px-6 py-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white font-medium rounded-lg border border-[#2a2a2a] transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* Total count */}
      {entries.length > 0 && (
        <p className="text-center text-gray-500 text-sm mt-6">
          Showing {entries.length} of {pagination.total} trades
        </p>
      )}
    </div>
  )
}
