'use client'

/**
 * Trades List Component
 * Displays user's saved trades with actions
 */

import { useState } from 'react'
import Link from 'next/link'
import { ShareButton } from './ShareButton'
import type { Trade } from '@/types/database'

interface TradesListProps {
  trades: Trade[]
  onDelete?: (tradeId: string) => Promise<void>
  onTogglePublic?: (tradeId: string, isPublic: boolean) => Promise<void>
  onReplay?: (trade: Trade) => void
  isPro?: boolean
  isLoading?: boolean
  emptyMessage?: string
}

export function TradesList({
  trades,
  onDelete,
  onTogglePublic,
  onReplay,
  isPro,
  isLoading,
  emptyMessage = 'No trades saved yet',
}: TradesListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const handleDelete = async (tradeId: string) => {
    if (!onDelete) return

    if (!confirm('Are you sure you want to delete this trade?')) {
      return
    }

    setDeletingId(tradeId)
    try {
      await onDelete(tradeId)
    } finally {
      setDeletingId(null)
    }
  }

  const handleTogglePublic = async (tradeId: string, currentIsPublic: boolean) => {
    if (!onTogglePublic) return

    setTogglingId(tradeId)
    try {
      await onTogglePublic(tradeId, !currentIsPublic)
    } finally {
      setTogglingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-5 w-32 bg-[#2a2a2a] rounded" />
                <div className="h-4 w-24 bg-[#2a2a2a] rounded" />
              </div>
              <div className="h-8 w-20 bg-[#2a2a2a] rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (trades.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-[#1f1f1f] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <p className="text-gray-400">{emptyMessage}</p>
        <Link
          href="/dashboard"
          className="inline-block mt-4 text-green-400 hover:text-green-300 transition-colors"
        >
          Create your first trade replay
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {trades.map((trade) => (
        <div
          key={trade.id}
          className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 hover:border-[#3a3a3a] transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            {/* Trade info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-white truncate">
                  {trade.name || `${trade.token_symbol || 'Unknown'} Trade`}
                </h3>
                {trade.is_public && (
                  <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded text-xs text-green-400">
                    Public
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {trade.token_symbol || 'Unknown'}
                </span>
                <span>{formatDate(trade.created_at)}</span>
              </div>
            </div>

            {/* P&L */}
            {trade.pnl_percent !== null && (
              <div
                className={`px-3 py-1.5 rounded-lg font-semibold ${
                  trade.pnl_percent >= 0
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-red-500/10 text-red-400'
                }`}
              >
                {trade.pnl_percent >= 0 ? '+' : ''}
                {trade.pnl_percent.toFixed(2)}%
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#2a2a2a]">
            {onReplay && (
              <button
                onClick={() => onReplay(trade)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  isPro
                    ? 'bg-green-500/10 hover:bg-green-500/20 text-green-400'
                    : 'bg-[#1f1f1f] hover:bg-[#2a2a2a] text-gray-400'
                }`}
              >
                {isPro ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
                Replay
                {!isPro && (
                  <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-bold rounded">PRO</span>
                )}
              </button>
            )}

            {/* Share button - only show for public trades with PnL */}
            {trade.is_public && trade.pnl_percent !== null && (
              <ShareButton
                tokenSymbol={trade.token_symbol || 'Unknown'}
                pnlPercent={trade.pnl_percent}
              />
            )}

            {onTogglePublic && (
              <button
                onClick={() => handleTogglePublic(trade.id, trade.is_public)}
                disabled={togglingId === trade.id}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-gray-300 text-sm font-medium rounded-lg border border-[#2a2a2a] transition-colors disabled:opacity-50"
              >
                {togglingId === trade.id ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : trade.is_public ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
                {trade.is_public ? 'Make Private' : 'Make Public'}
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => handleDelete(trade.id)}
                disabled={deletingId === trade.id}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ml-auto"
              >
                {deletingId === trade.id ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
