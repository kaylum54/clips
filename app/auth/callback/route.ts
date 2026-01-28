/**
 * Auth Callback Route Handler
 * Handles OAuth redirects and email confirmation links
 *
 * Security: Exchanges auth code for session securely
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Handle error from OAuth provider
  if (error) {
    console.error('Auth callback error:', error, errorDescription)
    const errorUrl = new URL('/auth/login', origin)
    errorUrl.searchParams.set('error', errorDescription || error)
    return NextResponse.redirect(errorUrl)
  }

  if (code) {
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

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Code exchange error:', exchangeError)
      const errorUrl = new URL('/auth/login', origin)
      errorUrl.searchParams.set('error', 'Failed to authenticate. Please try again.')
      return NextResponse.redirect(errorUrl)
    }

    // Successful authentication - redirect to intended destination
    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'

    if (isLocalEnv) {
      // Local development - use origin directly
      return NextResponse.redirect(`${origin}${next}`)
    } else if (forwardedHost) {
      // Production with load balancer/proxy
      return NextResponse.redirect(`https://${forwardedHost}${next}`)
    } else {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // No code present - redirect to login
  return NextResponse.redirect(`${origin}/auth/login`)
}
