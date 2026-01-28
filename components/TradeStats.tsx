'use client'

import Image from 'next/image'
import type { TradeStats as TradeStatsType } from '@/types'
import { formatPrice, formatPercent } from '@/lib/formatters'

interface TradeStatsProps {
  stats: TradeStatsType | null
  isVisible: boolean
  onClose?: () => void
}

export default function TradeStats({ stats, isVisible, onClose }: TradeStatsProps) {
  if (!stats || !isVisible) return null

  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
      <div className="relative w-[500px] aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl pointer-events-auto">
        {/* Background Image */}
        <Image
          src="/clipspnl4.jpeg"
          alt="Trade Result"
          fill
          className="object-cover"
          priority
        />

        {/* Stats Overlay - positioned on the left dark area */}
        <div className="absolute inset-0 flex flex-col justify-center pl-8 pr-[55%]">
          {/* P&L - Large and prominent */}
          <div className="mb-6">
            <div
              className={`
                text-5xl font-bold tracking-tight drop-shadow-lg
                ${stats.isProfit ? 'text-green-400' : 'text-red-400'}
              `}
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
            >
              {formatPercent(stats.percentChange)}
            </div>
            <div className="text-zinc-300 text-sm mt-1 drop-shadow-md">
              {stats.isProfit ? 'Profit' : 'Loss'}
            </div>
          </div>

          {/* Entry & Exit - stacked below */}
          <div className="space-y-3">
            {/* Entry */}
            <div>
              <div className="text-zinc-400 text-xs font-medium uppercase tracking-wider">
                Entry
              </div>
              <div
                className="text-green-400 text-xl font-semibold font-mono drop-shadow-md"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
              >
                {formatPrice(stats.entryPrice)}
              </div>
            </div>

            {/* Exit */}
            <div>
              <div className="text-zinc-400 text-xs font-medium uppercase tracking-wider">
                Exit
              </div>
              <div
                className="text-red-400 text-xl font-semibold font-mono drop-shadow-md"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
              >
                {formatPrice(stats.exitPrice)}
              </div>
            </div>
          </div>
        </div>

        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white/70 hover:text-white transition-colors"
            title="Minimize"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
