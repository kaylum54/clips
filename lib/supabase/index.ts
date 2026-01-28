/**
 * Supabase Client Exports
 *
 * Usage:
 * - Browser components: import { createClient } from '@/lib/supabase/client'
 * - Server components/API routes: import { createClient } from '@/lib/supabase/server'
 * - Admin operations: import { createAdminClient } from '@/lib/supabase/admin'
 * - Middleware: import { updateSession } from '@/lib/supabase/middleware'
 */

export { createClient as createBrowserClient } from './client'
export { createClient as createServerClient } from './server'
export { createAdminClient } from './admin'
export { updateSession } from './middleware'
