'use client'

/**
 * Admin User Management Page
 * Lists and manages all users
 */

import { useState, useEffect, useCallback } from 'react'
import { UsersTable } from '@/components/admin/UsersTable'

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

type StatusFilter = 'all' | 'free' | 'pro' | 'banned'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false,
  })

  const fetchUsers = useCallback(async (offset = 0) => {
    try {
      setIsLoading(true)
      setError('')

      const params = new URLSearchParams({
        limit: '50',
        offset: offset.toString(),
        status: statusFilter,
      })

      if (search) {
        params.set('search', search)
      }

      const response = await fetch(`/api/admin/users?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users')
      }

      if (offset === 0) {
        setUsers(data.users)
      } else {
        setUsers((prev) => [...prev, ...data.users])
      }
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleBanToggle = async (userId: string, newBanned: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBanned: newBanned }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update user')
      }

      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isBanned: newBanned } : u))
      )
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update user')
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers()
  }

  const statusFilters: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All Users' },
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro' },
    { value: 'banned', label: 'Banned' },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <p className="text-gray-500">Manage platform users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by username or email..."
              className="w-full pl-10 pr-4 py-2 bg-[#141414] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === filter.value
                  ? 'bg-green-500 text-black'
                  : 'bg-[#1f1f1f] text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {/* Users table */}
      <UsersTable
        users={users}
        onBanToggle={handleBanToggle}
        isLoading={isLoading && users.length === 0}
      />

      {/* Pagination info and load more */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-gray-500 text-sm">
          Showing {users.length} of {pagination.total} users
        </p>
        {pagination.hasMore && (
          <button
            onClick={() => fetchUsers(pagination.offset + pagination.limit)}
            disabled={isLoading}
            className="px-4 py-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white font-medium rounded-lg border border-[#2a2a2a] transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        )}
      </div>
    </div>
  )
}
