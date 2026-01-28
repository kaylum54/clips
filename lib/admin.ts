/**
 * Admin Utilities
 *
 * Security:
 * - Helper functions for admin access verification
 * - Used by all admin API routes
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export interface AdminCheckResult {
  authorized: boolean
  userId?: string
  response?: NextResponse
}

/**
 * Verify that the current user is an admin
 * Returns early response if not authorized
 */
export async function verifyAdmin(): Promise<AdminCheckResult> {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
    }
  }

  // Check admin status
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.is_admin) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      ),
    }
  }

  return {
    authorized: true,
    userId: user.id,
  }
}

/**
 * Log admin action for audit trail
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  targetType: string,
  targetId: string,
  details?: Record<string, unknown>
) {
  // In production, you would log this to a dedicated audit table
  // For now, we'll log to console with structured data
  console.log('[ADMIN_AUDIT]', {
    timestamp: new Date().toISOString(),
    adminId,
    action,
    targetType,
    targetId,
    details,
  })
}
