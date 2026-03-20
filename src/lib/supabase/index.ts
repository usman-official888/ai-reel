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

import { NextRequest } from 'next/server'
import { createServerSupabaseClient } from './server'

// Re-export types
export type { Database } from '@/types/database'

// Helper to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

/**
 * Get user from request using Authorization header
 */
export async function getUserFromRequest(
  request: NextRequest
): Promise<{ id: string; email: string } | null> {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get the session from the request
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    return {
      id: user.id,
      email: user.email || '',
    }
  } catch (error) {
    console.error('Error getting user from request:', error)
    return null
  }
}
