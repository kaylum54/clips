'use client'

/**
 * Admin User Detail Page
 * View and manage individual user
 */

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { StatsCard } from '@/components/admin/StatsCard'

interface UserDetails {
  user: {
    id: string
    email: string
    username: string | null
    avatarUrl: string | null
    subscriptionStatus: string
    rendersThisMonth: number
    rendersResetAt: string | null
    isBanned: boolean
    isAdmin: boolean
    createdAt: string
    updatedAt: string
  }
  stats: {
    totalRenders: number
    totalTrades: number
  }
}

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [data, setData] = useState<UserDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Editable fields
  const [rendersThisMonth, setRendersThisMonth] = useState(0)

  useEffect(() => {
    async function fetchUser() {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/admin/users/${id}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to load user')
        }

        setData(result)
        setRendersThisMonth(result.user.rendersThisMonth)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [id])

  const handleUpdateRenders = async () => {
    if (!data) return

    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rendersThisMonth }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to update user')
      }

      const result = await response.json()
      setData((prev) => prev ? {
        ...prev,
        user: { ...prev.user, rendersThisMonth: result.user.rendersThisMonth },
      } : null)

      alert('Render count updated!')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleBan = async () => {
    if (!data) return

    const newBanned = !data.user.isBanned
    const action = newBanned ? 'ban' : 'unban'

    if (!confirm(`Are you sure you want to ${action} this user?`)) {
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBanned: newBanned }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to update user')
      }

      setData((prev) => prev ? {
        ...prev,
        user: { ...prev.user, isBanned: newBanned },
      } : null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-[#2a2a2a] rounded mb-8" />
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="h-32 bg-[#2a2a2a] rounded-xl" />
            <div className="h-32 bg-[#2a2a2a] rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          {error || 'User not found'}
        </div>
        <Link
          href="/admin/users"
          className="inline-block mt-4 text-gray-400 hover:text-white transition-colors"
        >
          &larr; Back to users
        </Link>
      </div>
    )
  }

  const { user, stats } = data

  return (
    <div className="p-8">
      {/* Back link */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to users
      </Link>

      {/* User header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#2a2a2a] flex items-center justify-center overflow-hidden">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.username || 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-500 text-2xl font-medium">
                {(user.username || user.email || 'U').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">
                {user.username || 'No username'}
              </h1>
              {user.isAdmin && (
                <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs font-medium rounded">
                  Admin
                </span>
              )}
              {user.isBanned && (
                <span className="px-2 py-1 bg-gray-500/10 text-gray-400 text-xs font-medium rounded">
                  Banned
                </span>
              )}
            </div>
            <p className="text-gray-500">{user.email}</p>
            <p className="text-gray-500 text-sm">ID: {user.id}</p>
          </div>
        </div>

        {/* Actions */}
        {!user.isAdmin && (
          <button
            onClick={handleToggleBan}
            disabled={actionLoading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
              user.isBanned
                ? 'bg-green-500 hover:bg-green-600 text-black'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {user.isBanned ? 'Unban User' : 'Ban User'}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Subscription"
          value={user.subscriptionStatus === 'active' ? 'Pro' : 'Free'}
          variant={user.subscriptionStatus === 'active' ? 'success' : 'default'}
        />
        <StatsCard
          title="Total Renders"
          value={stats.totalRenders}
        />
        <StatsCard
          title="Total Trades"
          value={stats.totalTrades}
        />
        <StatsCard
          title="Joined"
          value={new Date(user.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        />
      </div>

      {/* Render adjustment */}
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Adjust Render Count</h2>
        <p className="text-gray-400 text-sm mb-4">
          Manually adjust the user&apos;s render count for this month.
          Current: {user.rendersThisMonth} renders
        </p>
        <div className="flex items-center gap-4">
          <input
            type="number"
            value={rendersThisMonth}
            onChange={(e) => setRendersThisMonth(Math.max(0, parseInt(e.target.value) || 0))}
            min={0}
            max={10000}
            className="w-32 px-4 py-2 bg-[#1f1f1f] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
          />
          <button
            onClick={handleUpdateRenders}
            disabled={actionLoading || rendersThisMonth === user.rendersThisMonth}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {actionLoading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>

      {/* User details */}
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">User Details</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-gray-500 text-sm">Email</dt>
            <dd className="text-white">{user.email}</dd>
          </div>
          <div>
            <dt className="text-gray-500 text-sm">Username</dt>
            <dd className="text-white">{user.username || 'Not set'}</dd>
          </div>
          <div>
            <dt className="text-gray-500 text-sm">Created At</dt>
            <dd className="text-white">{formatDate(user.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-gray-500 text-sm">Updated At</dt>
            <dd className="text-white">{formatDate(user.updatedAt)}</dd>
          </div>
          <div>
            <dt className="text-gray-500 text-sm">Renders Reset At</dt>
            <dd className="text-white">
              {user.rendersResetAt ? formatDate(user.rendersResetAt) : 'Not set'}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500 text-sm">Subscription Status</dt>
            <dd className="text-white capitalize">{user.subscriptionStatus || 'free'}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
