/**
 * Supabase Client Exports
 * 
 * For Client Components ('use client'):
 *   import { createBrowserSupabaseClient } from '@/lib/supabase/client'
 * 
 * For Server Components, Route Handlers:
 *   import { createServerSupabaseClient } from '@/lib/supabase/server'
 * 
 * For Middleware:
 *   import { createMiddlewareSupabaseClient } from '@/lib/supabase/middleware'
 */

// Re-export types
export type { Database } from '@/types/database'

// Helper to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
