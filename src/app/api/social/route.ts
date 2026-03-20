import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  parseBody,
  generateId,
} from '@/lib/api-utils'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getUserSocialAccounts, isTokenExpired } from '@/lib/db'
import type { SocialPlatform } from '@/types/database'

const VALID_PLATFORMS: SocialPlatform[] = ['youtube', 'tiktok', 'instagram', 'twitter']

/**
 * GET /api/social
 * List all connected social accounts
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse('Unauthorized', 401)
    }

    const accounts = await getUserSocialAccounts(user.id)

    // Add isExpired flag and remove sensitive tokens from response
    const safeAccounts = accounts.map((account) => ({
      id: account.id,
      platform: account.platform,
      accountHandle: account.account_handle,
      accountName: account.account_name,
      profileImageUrl: account.profile_image_url,
      isActive: account.is_active,
      isExpired: isTokenExpired(account.token_expires_at),
      tokenExpiresAt: account.token_expires_at,
      connectedAt: account.created_at,
    }))

    return successResponse({ accounts: safeAccounts })
  } catch (error) {
    console.error('Error listing social accounts:', error)
    return errorResponse('Failed to list social accounts', 500)
  }
}

/**
 * POST /api/social
 * Initiate OAuth connection to a platform
 */
export async function POST(request: NextRequest) {
  try {
    const body = await parseBody<{
      platform: SocialPlatform
      redirectUrl?: string
    }>(request)

    if (!body || !body.platform) {
      return errorResponse('Missing required field: platform')
    }

    const { platform, redirectUrl } = body

    if (!VALID_PLATFORMS.includes(platform)) {
      return errorResponse(`Invalid platform. Must be one of: ${VALID_PLATFORMS.join(', ')}`)
    }

    // Get authenticated user
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse('Unauthorized', 401)
    }

    // Check if already connected
    const accounts = await getUserSocialAccounts(user.id)
    const existingAccount = accounts.find((a) => a.platform === platform)

    if (existingAccount && existingAccount.is_active) {
      return errorResponse(`${platform} account already connected`, 400)
    }

    // Generate OAuth URL based on platform
    const oauthUrls: Record<SocialPlatform, string> = {
      youtube: 'https://accounts.google.com/o/oauth2/v2/auth',
      tiktok: 'https://www.tiktok.com/v2/auth/authorize/',
      instagram: 'https://api.instagram.com/oauth/authorize',
      twitter: 'https://twitter.com/i/oauth2/authorize',
    }

    // In production, this would generate proper OAuth URLs with:
    // - client_id from env vars
    // - redirect_uri to callback endpoint
    // - scope for required permissions
    // - state for CSRF protection

    const state = generateId('oauth')
    const callbackUrl = redirectUrl || `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/social/callback`
    
    const oauthUrl = `${oauthUrls[platform]}?client_id=YOUR_CLIENT_ID&redirect_uri=${encodeURIComponent(callbackUrl)}&state=${state}&platform=${platform}`

    return successResponse({
      oauthUrl,
      state,
      message: `Redirect user to OAuth URL to connect ${platform}`,
    })
  } catch (error) {
    console.error('Error initiating OAuth:', error)
    return errorResponse('Failed to initiate OAuth connection', 500)
  }
}
