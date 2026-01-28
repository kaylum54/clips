'use client'

/**
 * Public Profile Page
 * Shows a user's public profile and their public trades
 */

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ProfileData {
  profile: {
    username: string
    avatarUrl: string | null
    joinedAt: string
  }
  stats: {
    totalPublicTrades: number
    bestTrade: number | null
    avgGain: number | null
    winRate: number | null
  }
  trades: Array<{
    id: string
    tokenSymbol: string
    pnlPercent: number
    createdAt: string
  }>
}

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = use(params)
  const router = useRouter()
  const [data, setData] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchProfile() {
      try {
        setIsLoading(true)
        setError('')

        const response = await fetch(`/api/users/${encodeURIComponent(username)}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to load profile')
        }

        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [username])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#1f1f1f] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">User Not Found</h1>
          <p className="text-gray-400 mb-6">{error || 'This profile does not exist'}</p>
          <Link
            href="/leaderboard"
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-xl transition-colors inline-block"
          >
            View Leaderboard
          </Link>
        </div>
      </div>
    )
  }

  const { profile, stats, trades } = data

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#2a2a2a] bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-white">Profile</h1>
            </div>

            <Link
              href="/leaderboard"
              className="px-4 py-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white font-medium rounded-lg border border-[#2a2a2a] transition-colors"
            >
              Leaderboard
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile header */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-[#2a2a2a] flex items-center justify-center overflow-hidden">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-500 text-3xl font-medium">
                  {profile.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Info */}
            <div>
              <h2 className="text-2xl font-bold text-white">{profile.username}</h2>
              <p className="text-gray-500 text-sm">
                Joined {formatDate(profile.joinedAt)}
              </p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#1f1f1f] rounded-xl p-4">
              <p className="text-gray-500 text-sm mb-1">Public Trades</p>
              <p className="text-2xl font-bold text-white">{stats.totalPublicTrades}</p>
            </div>
            <div className="bg-[#1f1f1f] rounded-xl p-4">
              <p className="text-gray-500 text-sm mb-1">Best Trade</p>
              <p className={`text-2xl font-bold ${stats.bestTrade && stats.bestTrade >= 0 ? 'text-green-400' : 'text-gray-500'}`}>
                {stats.bestTrade !== null ? `${stats.bestTrade >= 0 ? '+' : ''}${stats.bestTrade.toFixed(1)}%` : '-'}
              </p>
            </div>
            <div className="bg-[#1f1f1f] rounded-xl p-4">
              <p className="text-gray-500 text-sm mb-1">Avg Gain</p>
              <p className={`text-2xl font-bold ${stats.avgGain && stats.avgGain >= 0 ? 'text-green-400' : stats.avgGain ? 'text-red-400' : 'text-gray-500'}`}>
                {stats.avgGain !== null ? `${stats.avgGain >= 0 ? '+' : ''}${stats.avgGain.toFixed(1)}%` : '-'}
              </p>
            </div>
            <div className="bg-[#1f1f1f] rounded-xl p-4">
              <p className="text-gray-500 text-sm mb-1">Win Rate</p>
              <p className="text-2xl font-bold text-white">
                {stats.winRate !== null ? `${stats.winRate.toFixed(0)}%` : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Public trades */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Public Trades</h3>

          {trades.length === 0 ? (
            <div className="text-center py-12 bg-[#141414] border border-[#2a2a2a] rounded-xl">
              <p className="text-gray-400">No public trades yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {trades.map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between p-4 bg-[#141414] border border-[#2a2a2a] rounded-xl hover:border-[#3a3a3a] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1f1f1f] rounded-lg flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        ${trade.tokenSymbol?.slice(0, 3) || '???'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-white">${trade.tokenSymbol || 'Unknown'}</p>
                      <p className="text-gray-500 text-sm">{formatDate(trade.createdAt)}</p>
                    </div>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-lg font-bold ${
                      trade.pnlPercent >= 0
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {trade.pnlPercent >= 0 ? '+' : ''}
                    {trade.pnlPercent.toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
