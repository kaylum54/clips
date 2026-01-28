'use client'

/**
 * Save Trade Modal
 * Allows users to save a trade with name and public/private setting
 */

import { useState } from 'react'
import { useUser } from '@/hooks/useUser'

interface SaveTradeModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: SaveTradeData) => Promise<void>
  defaultData?: {
    tokenAddress: string
    tokenSymbol?: string
    entryHash: string
    exitHash: string
    entryPrice?: number
    exitPrice?: number
    pnlPercent?: number
  }
}

export interface SaveTradeData {
  name: string
  tokenAddress: string
  tokenSymbol?: string
  entryHash: string
  exitHash: string
  entryPrice?: number
  exitPrice?: number
  pnlPercent?: number
  isPublic: boolean
}

export function SaveTradeModal({ isOpen, onClose, onSave, defaultData }: SaveTradeModalProps) {
  const { isAuthenticated, isPro } = useUser()
  const [name, setName] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!defaultData) {
      setError('No trade data to save')
      return
    }

    setError('')
    setLoading(true)

    try {
      await onSave({
        name: name.trim() || `${defaultData.tokenSymbol || 'Trade'} - ${new Date().toLocaleDateString()}`,
        tokenAddress: defaultData.tokenAddress,
        tokenSymbol: defaultData.tokenSymbol,
        entryHash: defaultData.entryHash,
        exitHash: defaultData.exitHash,
        entryPrice: defaultData.entryPrice,
        exitPrice: defaultData.exitPrice,
        pnlPercent: defaultData.pnlPercent,
        isPublic,
      })

      // Reset form and close
      setName('')
      setIsPublic(false)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save trade')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6 max-w-md w-full shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <h2 className="text-xl font-semibold text-white mb-2">Save Trade</h2>
        <p className="text-gray-400 text-sm mb-6">
          Save this trade to your collection for easy replay later.
        </p>

        {/* Auth check */}
        {!isAuthenticated ? (
          <div className="text-center py-4">
            <p className="text-gray-400 mb-4">Sign in to save trades</p>
            <a
              href="/auth/login"
              className="inline-block px-6 py-2 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-lg transition-colors"
            >
              Sign In
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Trade preview */}
            {defaultData && (
              <div className="p-4 bg-[#1f1f1f] border border-[#2a2a2a] rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Token</span>
                  <span className="text-white font-medium">
                    {defaultData.tokenSymbol || 'Unknown'}
                  </span>
                </div>
                {defaultData.pnlPercent !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">P&L</span>
                    <span
                      className={`font-bold ${
                        defaultData.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {defaultData.pnlPercent >= 0 ? '+' : ''}
                      {defaultData.pnlPercent.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Name input */}
            <div>
              <label htmlFor="tradeName" className="block text-sm font-medium text-gray-300 mb-1">
                Trade Name (optional)
              </label>
              <input
                id="tradeName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                maxLength={100}
                className="w-full px-4 py-2.5 bg-[#1f1f1f] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 disabled:opacity-50"
                placeholder={`${defaultData?.tokenSymbol || 'Trade'} - ${new Date().toLocaleDateString()}`}
              />
            </div>

            {/* Public toggle */}
            <div className="flex items-center justify-between p-4 bg-[#1f1f1f] border border-[#2a2a2a] rounded-xl">
              <div>
                <div className="text-white font-medium">Make Public</div>
                <div className="text-gray-500 text-sm">
                  {isPro
                    ? 'Show on your profile and leaderboards'
                    : 'Upgrade to Pro to share publicly'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => isPro && setIsPublic(!isPublic)}
                disabled={!isPro}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  isPublic ? 'bg-green-500' : 'bg-[#2a2a2a]'
                } ${!isPro ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    isPublic ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-2.5 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white font-medium rounded-xl border border-[#2a2a2a] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Trade'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
