'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/components/AuthProvider'
import { useUser } from '@/hooks/useUser'

export function DashboardHeader() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { rendersThisMonth, renderLimit, isPro, isAdmin, isLoading } = useUser()
  const [showMenu, setShowMenu] = useState(false)
  const [upgradeLoading, setUpgradeLoading] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleUpgrade = async () => {
    setUpgradeLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setUpgradeLoading(false)
    }
  }

  const usagePercent = renderLimit > 0 && renderLimit !== Infinity ? (rendersThisMonth / renderLimit) * 100 : 0
  const isNearLimit = usagePercent >= 80

  return (
    <header className="h-16 border-b border-[#1a1a1a] bg-[#0a0a0a]/95 backdrop-blur-md flex items-center justify-between px-6 relative z-20">
      {/* Logo */}
      <Link href="/" className="hover:opacity-80 transition-opacity">
        <Image
          src="/motionlogo1.png"
          alt="Clips"
          width={317}
          height={40}
          className="h-5 w-auto"
        />
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-5">
        {/* Usage display */}
        {!isLoading && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-[#52525b] font-medium">
                {isPro ? 'Pro Plan' : 'Free Plan'}
              </p>
              <p className="text-sm font-semibold text-white">
                {isPro ? (
                  <span className="text-green-400">Unlimited</span>
                ) : (
                  <>
                    <span className={isNearLimit ? 'text-yellow-400' : 'text-white'}>
                      {rendersThisMonth}
                    </span>
                    <span className="text-[#52525b] font-normal">/{renderLimit} renders</span>
                  </>
                )}
              </p>
            </div>
            {!isPro && (
              <div className="w-24 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ease-out rounded-full ${
                    isNearLimit
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                      : 'bg-gradient-to-r from-green-500 to-emerald-400'
                  }`}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Upgrade button (free users only) */}
        {!isPro && !isLoading && (
          <button
            onClick={handleUpgrade}
            disabled={upgradeLoading}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black text-sm font-semibold rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(34,197,94,0.4)] disabled:opacity-50"
          >
            {upgradeLoading ? 'Loading...' : 'Upgrade'}
          </button>
        )}

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1f1f1f] to-[#141414] border border-[#2a2a2a] flex items-center justify-center text-white text-sm font-medium hover:border-[#3a3a3a] transition-all duration-200"
          >
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-gradient-to-b from-[#141414] to-[#111111] border border-[#1f1f1f] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-[#1f1f1f]">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.email}
                  </p>
                  <p className="text-xs text-[#52525b]">
                    {isPro ? 'Pro Member' : 'Free Plan'}
                  </p>
                </div>

                <div className="py-1">
                  <Link
                    href="/trades"
                    className="flex items-center gap-3 px-4 py-2.5 text-[#a1a1aa] hover:text-white hover:bg-[#1a1a1a] transition-all duration-150"
                    onClick={() => setShowMenu(false)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    My Trades
                  </Link>
                  <Link
                    href="/leaderboard"
                    className="flex items-center gap-3 px-4 py-2.5 text-[#a1a1aa] hover:text-white hover:bg-[#1a1a1a] transition-all duration-150"
                    onClick={() => setShowMenu(false)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Leaderboard
                  </Link>
                  {!isPro && (
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        handleUpgrade()
                      }}
                      disabled={upgradeLoading}
                      className="flex items-center gap-3 px-4 py-2.5 text-green-400 hover:text-green-300 hover:bg-green-500/5 transition-all duration-150 w-full text-left disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      {upgradeLoading ? 'Loading...' : 'Upgrade to Pro'}
                    </button>
                  )}
                </div>

                {isAdmin && (
                  <div className="border-t border-[#1f1f1f] py-1">
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 px-4 py-2.5 text-purple-400 hover:text-purple-300 hover:bg-purple-500/5 transition-all duration-150"
                      onClick={() => setShowMenu(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Admin Dashboard
                    </Link>
                  </div>
                )}

                <div className="border-t border-[#1f1f1f] py-1">
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      handleSignOut()
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all duration-150 w-full text-left"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
