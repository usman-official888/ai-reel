/**
 * Social Accounts Database Service
 * Handles all social account-related database operations
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { generateId } from '../api-utils'
import type { SocialPlatform } from '@/types/database'

export interface SocialAccount {
  id: string
  user_id: string
  platform: SocialPlatform
  account_handle: string
  account_name: string | null
  profile_image_url: string | null
  access_token: string | null
  refresh_token: string | null
  token_expires_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * Get all social accounts for a user
 */
export async function getUserSocialAccounts(
  userId: string
): Promise<SocialAccount[]> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to get social accounts: ${error.message}`)
  }

  return data || []
}

/**
 * Get a specific social account by platform
 */
export async function getSocialAccountByPlatform(
  userId: string,
  platform: SocialPlatform
): Promise<SocialAccount | null> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('platform', platform)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to get social account: ${error.message}`)
  }

  return data
}

/**
 * Create or update a social account
 */
export async function upsertSocialAccount(
  userId: string,
  platform: SocialPlatform,
  data: {
    account_handle: string
    account_name?: string
    profile_image_url?: string
    access_token: string
    refresh_token?: string
    token_expires_at?: string
  }
): Promise<SocialAccount> {
  const supabase = await createServerSupabaseClient()

  // Check if account already exists
  const existing = await getSocialAccountByPlatform(userId, platform)

  if (existing) {
    // Update existing
    const { data: updated, error } = await supabase
      .from('social_accounts')
      .update({
        ...data,
        is_active: true,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', existing.id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update social account: ${error.message}`)
    }

    return updated as SocialAccount
  } else {
    // Create new
    const { data: created, error } = await supabase
      .from('social_accounts')
      .insert({
        id: generateId('social'),
        user_id: userId,
        platform,
        ...data,
        is_active: true,
      } as never)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create social account: ${error.message}`)
    }

    return created as SocialAccount
  }
}

/**
 * Delete a social account
 */
export async function deleteSocialAccount(
  userId: string,
  platform: SocialPlatform
): Promise<void> {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase
    .from('social_accounts')
    .delete()
    .eq('user_id', userId)
    .eq('platform', platform)

  if (error) {
    throw new Error(`Failed to delete social account: ${error.message}`)
  }
}

/**
 * Refresh tokens for a social account
 */
export async function refreshSocialAccountTokens(
  userId: string,
  platform: SocialPlatform,
  tokens: {
    access_token: string
    refresh_token?: string
    token_expires_at: string
  }
): Promise<SocialAccount> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('social_accounts')
    .update({
      ...tokens,
      is_active: true,
      updated_at: new Date().toISOString(),
    } as never)
    .eq('user_id', userId)
    .eq('platform', platform)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to refresh tokens: ${error.message}`)
  }

  return data as SocialAccount
}

/**
 * Check if a token is expired
 */
export function isTokenExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}
