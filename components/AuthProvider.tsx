'use client'

/**
 * Auth Provider
 * Provides authentication context throughout the app
 *
 * Security: Manages session state and auth events
 */

import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = useMemo(() => createClient(), [])
  const profileFetchedRef = useRef(false)

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return data
    } catch (err) {
      console.error('Profile fetch exception:', err)
      return null
    }
  }, [supabase])

  const refreshProfile = useCallback(async () => {
    if (!user?.id) return

    const profileData = await fetchProfile(user.id)
    if (profileData) {
      setProfile(profileData)
    }
  }, [user?.id, fetchProfile])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
    profileFetchedRef.current = false
  }, [supabase.auth])

  useEffect(() => {
    let mounted = true

    // Use onAuthStateChange as the single source of truth.
    // It fires INITIAL_SESSION synchronously on subscribe, avoiding
    // the getSession() hang that occurs in some @supabase/ssr versions.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return

        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        if (currentSession?.user) {
          // Only fetch profile once per mount, or on explicit auth events
          if (!profileFetchedRef.current || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            profileFetchedRef.current = true
            const profileData = await fetchProfile(currentSession.user.id)
            if (mounted) setProfile(profileData)
          }
        } else {
          setProfile(null)
          profileFetchedRef.current = false
        }

        if (event === 'SIGNED_OUT') {
          setProfile(null)
          profileFetchedRef.current = false
        }

        // Always mark loading as done after first auth event
        if (mounted) setLoading(false)
      }
    )

    // Safety net: if onAuthStateChange never fires, still unblock the UI
    const safetyTimeout = setTimeout(() => {
      if (mounted) setLoading(false)
    }, 3000)

    return () => {
      mounted = false
      clearTimeout(safetyTimeout)
      subscription.unsubscribe()
    }
  }, [supabase.auth, fetchProfile])

  const value = useMemo(
    () => ({
      user,
      profile,
      session,
      loading,
      signOut,
      refreshProfile,
    }),
    [user, profile, session, loading, signOut, refreshProfile]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
