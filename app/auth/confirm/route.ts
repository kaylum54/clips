/**
 * Auth Confirm Route Handler
 * Handles email confirmation via token hash (avoids PKCE code exchange issues)
 *
 * Security: Verifies token hash directly with Supabase Auth
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocalEnv = process.env.NODE_ENV === 'development'
  const baseUrl = isLocalEnv || !forwardedHost ? origin : `https://${forwardedHost}`

  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'signup' | 'email' | 'recovery' | 'invite' | null

  if (!tokenHash || !type) {
    return NextResponse.redirect(`${baseUrl}/auth/login?error=Invalid confirmation link`)
  }

  const cookieStore = await cookies()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Cookie setting failed - this is expected in some cases
          }
        },
      },
    }
  )

  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })

  if (error) {
    console.error('Email confirmation error:', error)
    return NextResponse.redirect(`${baseUrl}/auth/login?error=Email link is invalid or has expired`)
  }

  // Confirmed — redirect to dashboard
  return NextResponse.redirect(`${baseUrl}/dashboard`)
}
