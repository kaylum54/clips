'use client'

/**
 * Admin Trades Page
 * View and manage public trades
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Trade {
  rank: number
  tradeId: string
  username: string
  avatarUrl: string | null
  tokenSymbol: string
  pnlPercent: number
  createdAt: string
}

export default function AdminTradesPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState<'all' | 'month' | 'week' | 'today'>('all')

  useEffect(() => {
    async function fetchTrades() {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/leaderboard?period=${period}&limit=100`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load trades')
        }

        setTrades(data.leaderboard)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load trades')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrades()
  }, [period])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const periods = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' },
  ] as const

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Public Trades</h1>
        <p className="text-gray-500">View and manage leaderboard trades</p>
      </div>

      {/* Period filters */}
      <div className="flex items-center gap-2 mb-6">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              period === p.value
                ? 'bg-green-500 text-black'
                : 'bg-[#1f1f1f] text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 py-3 animate-pulse">
              <div className="w-8 h-8 bg-[#2a2a2a] rounded" />
              <div className="w-10 h-10 bg-[#2a2a2a] rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-[#2a2a2a] rounded" />
                <div className="h-3 w-16 bg-[#2a2a2a] rounded" />
              </div>
              <div className="h-6 w-20 bg-[#2a2a2a] rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && trades.length === 0 && (
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-8 text-center">
          <p className="text-gray-400">No public trades for this period</p>
        </div>
      )}

      {/* Trades table */}
      {!isLoading && trades.length > 0 && (
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#1f1f1f] border-b border-[#2a2a2a]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Rank</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">User</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Token</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">P&L</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Date</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {trades.map((trade) => (
                <tr key={trade.tradeId} className="hover:bg-[#1f1f1f] transition-colors">
                  {/* Rank */}
                  <td className="px-4 py-3">
                    <span
                      className={`w-8 h-8 flex items-center justify-center rounded font-bold text-sm ${
                        trade.rank === 1
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : trade.rank === 2
                          ? 'bg-gray-400/20 text-gray-300'
                          : trade.rank === 3
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-[#1f1f1f] text-gray-400'
                      }`}
                    >
                      {trade.rank}
                    </span>
                  </td>

                  {/* User */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center overflow-hidden">
                        {trade.avatarUrl ? (
                          <img
                            src={trade.avatarUrl}
                            alt={trade.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-500 text-xs">
                            {trade.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/u/${trade.username}`}
                        className="text-white hover:text-green-400 transition-colors"
                      >
                        {trade.username}
                      </Link>
                    </div>
                  </td>

                  {/* Token */}
                  <td className="px-4 py-3 text-white">
                    ${trade.tokenSymbol}
                  </td>

                  {/* P&L */}
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded font-bold ${
                        trade.pnlPercent >= 0
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {trade.pnlPercent >= 0 ? '+' : ''}
                      {trade.pnlPercent.toFixed(2)}%
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 text-gray-400 text-sm">
                    {formatDate(trade.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/u/${trade.username}`}
                      className="px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white text-sm rounded-lg transition-colors"
                    >
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stats */}
      {!isLoading && trades.length > 0 && (
        <p className="text-gray-500 text-sm mt-4">
          Showing {trades.length} public trades
        </p>
      )}
    </div>
  )
}
