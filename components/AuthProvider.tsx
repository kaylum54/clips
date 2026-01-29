'use client'

/**
 * Auth Provider
 * Provides authentication context throughout the app
 *
 * Security: Manages session state and auth events
 */

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
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

  const fetchProfile = useCallback(async (userId: string) => {
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
  }, [supabase.auth])

  useEffect(() => {
    let mounted = true

    // Get initial session
    const initAuth = async () => {
      try {
        // Timeout guard: getSession() can hang if cookies are malformed
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), 5000)
        )

        const result = await Promise.race([sessionPromise, timeoutPromise])
        const initialSession = result && 'data' in result ? result.data.session : null

        if (initialSession && mounted) {
          setSession(initialSession)
          setUser(initialSession.user)

          // Fetch profile with its own timeout
          try {
            const profileData = await fetchProfile(initialSession.user.id)
            if (mounted) setProfile(profileData)
          } catch (profileError) {
            console.error('Error fetching profile:', profileError)
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return

        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        if (currentSession?.user) {
          // Fetch profile on auth state change
          try {
            const profileData = await fetchProfile(currentSession.user.id)
            if (mounted) setProfile(profileData)
          } catch {
            // Profile fetch failed, continue without it
          }
        } else {
          setProfile(null)
        }

        // Handle specific events
        if (event === 'SIGNED_OUT') {
          setProfile(null)
        }
      }
    )

    return () => {
      mounted = false
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
