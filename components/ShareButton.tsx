'use client'

/**
 * Share Button Component
 * Allows sharing trades to social media
 *
 * Security:
 * - Uses encodeURIComponent for all dynamic text
 * - Opens links in new tab with noopener noreferrer
 * - No user data is sent to external services
 */

import { useState } from 'react'

interface ShareButtonProps {
  tokenSymbol: string
  pnlPercent: number
  tradeUrl?: string
  className?: string
}

export function ShareButton({
  tokenSymbol,
  pnlPercent,
  tradeUrl,
  className = '',
}: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  // Generate share text
  const getShareText = () => {
    const pnlText = pnlPercent >= 0
      ? `+${pnlPercent.toFixed(2)}%`
      : `${pnlPercent.toFixed(2)}%`
    const emoji = pnlPercent >= 0 ? '📈' : '📉'
    return `Just made ${pnlText} on $${tokenSymbol} ${emoji}\n\nMade with @ClipsApp`
  }

  // Share to Twitter/X
  const shareToTwitter = () => {
    const text = getShareText()
    const url = tradeUrl || window.location.href
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    window.open(twitterUrl, '_blank', 'noopener,noreferrer')
    setShowMenu(false)
  }

  // Copy link to clipboard
  const copyLink = async () => {
    const url = tradeUrl || window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
    setShowMenu(false)
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-gray-300 text-sm font-medium rounded-lg border border-[#2a2a2a] transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share
      </button>

      {/* Dropdown menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-[#1f1f1f] border border-[#2a2a2a] rounded-xl shadow-xl z-50 overflow-hidden">
            {/* Twitter/X */}
            <button
              onClick={shareToTwitter}
              className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#2a2a2a] transition-colors text-left"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span className="text-sm font-medium">Share on X</span>
            </button>

            {/* Copy link */}
            <button
              onClick={copyLink}
              className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#2a2a2a] transition-colors text-left border-t border-[#2a2a2a]"
            >
              {copied ? (
                <>
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">Copy Link</span>
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
