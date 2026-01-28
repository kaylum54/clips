/**
 * Supabase Admin Client
 * Use this ONLY in secure server-side contexts (API routes, server actions)
 * NEVER expose to the client!
 *
 * Security: Uses service role key which BYPASSES RLS
 * Only use for admin operations that require elevated privileges
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Singleton pattern - create once, reuse
let adminClient: ReturnType<typeof createClient<Database>> | null = null

export function createAdminClient() {
  if (adminClient) {
    return adminClient
  }

  // Security check: Ensure we're not on the client
  if (typeof window !== 'undefined') {
    throw new Error('Admin client cannot be used on the client side!')
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase admin credentials')
  }

  adminClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return adminClient
}
