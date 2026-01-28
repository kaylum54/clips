'use client'

/**
 * My Trades Page
 * Shows user's saved trades with management options
 */

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TradesList } from '@/components/TradesList'
import { useUser } from '@/hooks/useUser'
import type { Trade } from '@/types/database'

export default function TradesPage() {
  const router = useRouter()
  const { isLoading: authLoading, isAuthenticated, isPro } = useUser()
  const [trades, setTrades] = useState<Trade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false,
  })

  const fetchTrades = useCallback(async (offset = 0) => {
    try {
      setIsLoading(true)
      setError('')

      const response = await fetch(`/api/trades?limit=50&offset=${offset}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch trades')
      }

      if (offset === 0) {
        setTrades(data.trades)
      } else {
        setTrades((prev) => [...prev, ...data.trades])
      }
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trades')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchTrades()
    }
  }, [authLoading, isAuthenticated, fetchTrades])

  const handleDelete = async (tradeId: string) => {
    try {
      const response = await fetch(`/api/trades/${tradeId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete trade')
      }

      // Remove from local state
      setTrades((prev) => prev.filter((t) => t.id !== tradeId))
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete trade')
    }
  }

  const handleTogglePublic = async (tradeId: string, isPublic: boolean) => {
    if (!isPro && isPublic) {
      alert('Upgrade to Pro to make trades public')
      return
    }

    try {
      const response = await fetch(`/api/trades/${tradeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update trade')
      }

      const { trade } = await response.json()

      // Update local state
      setTrades((prev) =>
        prev.map((t) => (t.id === tradeId ? trade : t))
      )
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update trade')
    }
  }

  const handleReplay = (trade: Trade) => {
    // Navigate to dashboard with trade data
    const params = new URLSearchParams({
      entryHash: trade.entry_hash,
      exitHash: trade.exit_hash,
      tokenAddress: trade.token_address,
    })
    router.push(`/?${params.toString()}`)
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500" />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Sign In Required</h1>
          <p className="text-gray-400 mb-6">Sign in to view your saved trades</p>
          <Link
            href="/auth/login?redirect=/trades"
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-xl transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#2a2a2a] bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">My Trades</h1>
                <p className="text-sm text-gray-500">
                  {pagination.total} trade{pagination.total !== 1 ? 's' : ''} saved
                </p>
              </div>
            </div>

            <Link
              href="/"
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-lg transition-colors"
            >
              New Trade
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            {error}
          </div>
        )}

        <TradesList
          trades={trades}
          onDelete={handleDelete}
          onTogglePublic={isPro ? handleTogglePublic : undefined}
          onReplay={handleReplay}
          isLoading={isLoading}
          emptyMessage="No trades saved yet. Create a replay and save it!"
        />

        {/* Load more */}
        {pagination.hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={() => fetchTrades(pagination.offset + pagination.limit)}
              disabled={isLoading}
              className="px-6 py-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white font-medium rounded-lg border border-[#2a2a2a] transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
