/**
 * Supabase Client Configuration
 * Provides both client-side and server-side Supabase clients
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { serverConfig, clientConfig } from './config'
import { Database } from '@/types/database'

// Type-safe Supabase client
export type TypedSupabaseClient = SupabaseClient<Database>

// Client-side Supabase client (uses anon key)
let clientInstance: TypedSupabaseClient | null = null

export function getSupabaseClient(): TypedSupabaseClient {
  if (clientInstance) return clientInstance

  if (!clientConfig.supabase.url || !clientConfig.supabase.anonKey) {
    throw new Error('Supabase client configuration missing')
  }

  clientInstance = createClient<Database>(
    clientConfig.supabase.url,
    clientConfig.supabase.anonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    }
  )

  return clientInstance
}

// Server-side Supabase client (uses service role key for admin operations)
let serverInstance: TypedSupabaseClient | null = null

export function getSupabaseServerClient(): TypedSupabaseClient {
  if (serverInstance) return serverInstance

  const { url, serviceRoleKey, anonKey } = serverConfig.supabase
  
  if (!url) {
    throw new Error('Supabase URL not configured')
  }

  // Use service role key if available, otherwise fall back to anon key
  const key = serviceRoleKey || anonKey
  
  if (!key) {
    throw new Error('Supabase key not configured')
  }

  serverInstance = createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  return serverInstance
}

// Create a client with specific auth context (for API routes)
export function createSupabaseServerClient(
  accessToken?: string
): TypedSupabaseClient {
  const { url, anonKey } = serverConfig.supabase

  if (!url || !anonKey) {
    throw new Error('Supabase configuration missing')
  }

  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : {},
    },
  })
}

// Helper to get user from request
export async function getUserFromRequest(
  request: Request
): Promise<{ id: string; email: string } | null> {
  const authHeader = request.headers.get('Authorization')
  
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.split(' ')[1]
  const supabase = createSupabaseServerClient(token)

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return {
    id: user.id,
    email: user.email || '',
  }
}
