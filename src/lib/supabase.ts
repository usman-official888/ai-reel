/**
 * Supabase Client Configuration
 * 
 * This file sets up the Supabase client for:
 * - Authentication
 * - Database queries
 * - Real-time subscriptions
 * - Storage
 * 
 * Uses @supabase/ssr for proper Next.js 14 App Router support
 */

import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/database'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Type-safe Supabase client
export type TypedSupabaseClient = SupabaseClient<Database>

/**
 * Client-side Supabase client
 * Use this in Client Components ('use client')
 */
export function createBrowserSupabaseClient(): TypedSupabaseClient {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

/**
 * Server-side Supabase client for Server Components
 * Use this in Server Components and Route Handlers
 */
export async function createServerSupabaseClient(): Promise<TypedSupabaseClient> {
  const cookieStore = await cookies()

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
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
          // This can happen in Server Components
          // Middleware will handle cookie refresh
        }
      },
    },
  })
}

/**
 * Create Supabase client for middleware
 * Handles session refresh and cookie management
 */
export async function createMiddlewareSupabaseClient(
  request: NextRequest
): Promise<{ supabase: TypedSupabaseClient; response: NextResponse }> {
  // Create a response object that we can modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        })
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  return { supabase, response }
}

/**
 * Admin Supabase client with service role
 * Bypasses RLS - use only for admin operations
 */
export function createAdminSupabaseClient(): TypedSupabaseClient {
  if (!supabaseServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Get current user from server-side
 */
export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

/**
 * Get current session from server-side
 */
export async function getCurrentSession() {
  const supabase = await createServerSupabaseClient()
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error || !session) {
    return null
  }

  return session
}

/**
 * Get user profile from database
 */
export async function getUserProfile(userId: string) {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey)
}

/**
 * Legacy exports for backward compatibility
 */
export const getSupabaseClient = createBrowserSupabaseClient
export const getSupabaseServerClient = createServerSupabaseClient

// Re-export types
export type { Database } from '@/types/database'
