'use client'

/**
 * Admin Users Table
 * Displays users with search, filter, and actions
 */

import { useState } from 'react'
import Link from 'next/link'

interface User {
  id: string
  email: string
  username: string | null
  avatarUrl: string | null
  subscriptionStatus: string
  rendersThisMonth: number
  isBanned: boolean
  isAdmin: boolean
  createdAt: string
}

interface UsersTableProps {
  users: User[]
  onBanToggle?: (userId: string, isBanned: boolean) => Promise<void>
  onAdjustRenders?: (userId: string, renders: number) => Promise<void>
  isLoading?: boolean
}

export function UsersTable({
  users,
  onBanToggle,
  onAdjustRenders,
  isLoading,
}: UsersTableProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const handleBanToggle = async (userId: string, currentBanned: boolean) => {
    if (!onBanToggle) return
    setActionLoading(userId)
    try {
      await onBanToggle(userId, !currentBanned)
    } finally {
      setActionLoading(null)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <div className="p-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 py-3 animate-pulse">
              <div className="w-10 h-10 bg-[#2a2a2a] rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-[#2a2a2a] rounded" />
                <div className="h-3 w-48 bg-[#2a2a2a] rounded" />
              </div>
              <div className="h-6 w-16 bg-[#2a2a2a] rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-8 text-center">
        <p className="text-gray-400">No users found</p>
      </div>
    )
  }

  return (
    <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#1f1f1f] border-b border-[#2a2a2a]">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">User</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Renders</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Joined</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a2a]">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-[#1f1f1f] transition-colors">
                {/* User info */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center overflow-hidden flex-shrink-0">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.username || 'User'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-500 text-sm font-medium">
                          {(user.username || user.email || 'U').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white truncate">
                          {user.username || 'No username'}
                        </p>
                        {user.isAdmin && (
                          <span className="px-1.5 py-0.5 bg-red-500/10 text-red-400 text-xs font-medium rounded">
                            Admin
                          </span>
                        )}
                        {user.isBanned && (
                          <span className="px-1.5 py-0.5 bg-gray-500/10 text-gray-400 text-xs font-medium rounded">
                            Banned
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm truncate">{user.email}</p>
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      user.subscriptionStatus === 'active'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-gray-500/10 text-gray-400'
                    }`}
                  >
                    {user.subscriptionStatus === 'active' ? 'Pro' : 'Free'}
                  </span>
                </td>

                {/* Renders */}
                <td className="px-4 py-3">
                  <span className="text-white">{user.rendersThisMonth}</span>
                  <span className="text-gray-500 text-sm ml-1">/ month</span>
                </td>

                {/* Joined */}
                <td className="px-4 py-3 text-gray-400 text-sm">
                  {formatDate(user.createdAt)}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white text-sm rounded-lg transition-colors"
                    >
                      View
                    </Link>
                    {onBanToggle && !user.isAdmin && (
                      <button
                        onClick={() => handleBanToggle(user.id, user.isBanned)}
                        disabled={actionLoading === user.id}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors disabled:opacity-50 ${
                          user.isBanned
                            ? 'bg-green-500/10 hover:bg-green-500/20 text-green-400'
                            : 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                        }`}
                      >
                        {actionLoading === user.id ? '...' : user.isBanned ? 'Unban' : 'Ban'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
