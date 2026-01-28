'use client'

/**
 * Usage Display
 * Shows render usage and upgrade option
 */

import { useState } from 'react'
import { useUser } from '@/hooks/useUser'
import { UpgradeModal } from './UpgradeModal'

export function UsageDisplay() {
  const { isLoading, isAuthenticated, isPro, rendersThisMonth, rendersRemaining, renderLimit } = useUser()
  const [showUpgrade, setShowUpgrade] = useState(false)

  if (isLoading || !isAuthenticated) {
    return null
  }

  if (isPro) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-sm text-green-400 font-medium">Pro</span>
      </div>
    )
  }

  const usagePercent = renderLimit ? (rendersThisMonth / renderLimit) * 100 : 0
  const isLow = rendersRemaining !== null && rendersRemaining <= 2
  const isOut = rendersRemaining === 0

  return (
    <>
      <button
        onClick={() => setShowUpgrade(true)}
        className={`flex items-center gap-3 px-3 py-1.5 rounded-lg border transition-colors ${
          isOut
            ? 'bg-red-500/10 border-red-500/20 hover:bg-red-500/20'
            : isLow
            ? 'bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20'
            : 'bg-[#1f1f1f] border-[#2a2a2a] hover:bg-[#2a2a2a]'
        }`}
      >
        {/* Progress bar */}
        <div className="w-16 h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isOut ? 'bg-red-500' : isLow ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(100, usagePercent)}%` }}
          />
        </div>

        {/* Count */}
        <span className={`text-sm font-medium ${
          isOut ? 'text-red-400' : isLow ? 'text-yellow-400' : 'text-gray-300'
        }`}>
          {rendersRemaining}/{renderLimit}
        </span>

        {/* Upgrade hint */}
        {(isLow || isOut) && (
          <span className="text-xs text-gray-500">Upgrade</span>
        )}
      </button>

      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </>
  )
}
