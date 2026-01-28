/**
 * useUser Hook
 * Simplified hook for accessing current user and profile
 *
 * Usage:
 * const { user, profile, isLoading, isAuthenticated, isPro, canRender } = useUser()
 */

import { useAuth } from '@/components/AuthProvider'

// Free tier render limit
const FREE_RENDER_LIMIT = 5

export function useUser() {
  const { user, profile, loading, signOut, refreshProfile } = useAuth()

  // Check if user has pro subscription (admins are also treated as pro)
  const isPro = profile?.subscription_status === 'active' || profile?.is_admin === true

  // Check if user can render (hasn't hit limit or is pro)
  const rendersRemaining = isPro
    ? Infinity
    : FREE_RENDER_LIMIT - (profile?.renders_this_month ?? 0)
  const canRender = isPro || rendersRemaining > 0

  // Check if user is admin
  const isAdmin = profile?.is_admin ?? false

  // Check if user is banned
  const isBanned = profile?.is_banned ?? false

  return {
    // Auth state
    user,
    profile,
    isLoading: loading,
    isAuthenticated: !!user,

    // Subscription state
    isPro,
    subscriptionStatus: profile?.subscription_status ?? 'free',

    // Render limits
    rendersThisMonth: profile?.renders_this_month ?? 0,
    rendersRemaining,
    canRender,
    renderLimit: isPro ? Infinity : FREE_RENDER_LIMIT,

    // Permissions
    isAdmin,
    isBanned,

    // Actions
    signOut,
    refreshProfile,
  }
}

export type UseUserReturn = ReturnType<typeof useUser>
