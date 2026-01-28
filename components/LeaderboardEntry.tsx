'use client'

/**
 * Leaderboard Entry Component
 * Single row in the leaderboard table
 */

import Link from 'next/link'

interface LeaderboardEntryProps {
  rank: number
  username: string
  avatarUrl: string | null
  tokenSymbol: string
  pnlPercent: number
  tradeId: string
  createdAt: string
}

export function LeaderboardEntry({
  rank,
  username,
  avatarUrl,
  tokenSymbol,
  pnlPercent,
  tradeId,
  createdAt,
}: LeaderboardEntryProps) {
  // Rank medal colors
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 2:
        return 'bg-gray-400/20 text-gray-300 border-gray-400/30'
      case 3:
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      default:
        return 'bg-[#1f1f1f] text-gray-400 border-[#2a2a2a]'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-[#141414] border border-[#2a2a2a] rounded-xl hover:border-[#3a3a3a] transition-colors">
      {/* Rank */}
      <div
        className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold border ${getRankStyle(rank)}`}
      >
        {rank}
      </div>

      {/* User info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center overflow-hidden flex-shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={username}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-500 text-sm font-medium">
              {username.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Username and token */}
        <div className="min-w-0">
          <Link
            href={`/u/${username}`}
            className="font-medium text-white hover:text-green-400 transition-colors truncate block"
          >
            {username}
          </Link>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="truncate">${tokenSymbol}</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{formatDate(createdAt)}</span>
          </div>
        </div>
      </div>

      {/* PnL */}
      <div
        className={`px-4 py-2 rounded-lg font-bold text-lg ${
          pnlPercent >= 0
            ? 'bg-green-500/10 text-green-400'
            : 'bg-red-500/10 text-red-400'
        }`}
      >
        {pnlPercent >= 0 ? '+' : ''}
        {pnlPercent.toFixed(2)}%
      </div>
    </div>
  )
}
