/**
 * Next.js Middleware
 * Handles authentication and route protection
 *
 * Security: Validates sessions and redirects unauthenticated users
 */

import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/auth/callback',
  '/auth/confirm',
  '/auth/reset-password',
  '/leaderboard',
  '/u', // Public profiles base path
]

// Routes that require admin access
const adminRoutes = ['/admin']

// Check if path matches any public route or is a public profile
function isPublicRoute(pathname: string): boolean {
  // Exact matches
  if (publicRoutes.includes(pathname)) {
    return true
  }

  // Public profile pages (/u/[username])
  if (pathname.startsWith('/u/')) {
    return true
  }

  // Static files and API routes that handle their own auth
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.')
  ) {
    return true
  }

  return false
}

// Check if path requires admin access
function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some((route) => pathname.startsWith(route))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Update session and get user info
  const { user, supabaseResponse, supabase } = await updateSession(request)

  // Allow public routes without authentication
  if (isPublicRoute(pathname)) {
    return supabaseResponse
  }

  // Redirect unauthenticated users to login
  if (!user) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check admin routes
  if (isAdminRoute(pathname)) {
    // Fetch user profile to check admin status
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      // Non-admin trying to access admin routes - redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
