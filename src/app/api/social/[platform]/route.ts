import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
} from '@/lib/api-utils'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  getSocialAccountByPlatform,
  deleteSocialAccount,
  refreshSocialAccountTokens,
  isTokenExpired,
} from '@/lib/db'
import type { SocialPlatform } from '@/types/database'

const VALID_PLATFORMS: SocialPlatform[] = ['youtube', 'tiktok', 'instagram', 'twitter']

interface RouteParams {
  params: Promise<{ platform: string }>
}

/**
 * GET /api/social/[platform]
 * Get connected account for a specific platform
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { platform } = await params
    
    // Validate platform
    if (!VALID_PLATFORMS.includes(platform as SocialPlatform)) {
      return errorResponse(`Invalid platform. Must be one of: ${VALID_PLATFORMS.join(', ')}`)
    }

    // Get authenticated user
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse('Unauthorized', 401)
    }

    const account = await getSocialAccountByPlatform(user.id, platform as SocialPlatform)

    if (!account) {
      return errorResponse(`No ${platform} account connected`, 404)
    }

    // Return safe data (no tokens)
    return successResponse({
      id: account.id,
      platform: account.platform,
      accountHandle: account.account_handle,
      accountName: account.account_name,
      profileImageUrl: account.profile_image_url,
      isActive: account.is_active,
      isExpired: isTokenExpired(account.token_expires_at),
      tokenExpiresAt: account.token_expires_at,
      connectedAt: account.created_at,
    })
  } catch (error) {
    console.error('Error getting social account:', error)
    return errorResponse('Failed to get social account', 500)
  }
}

/**
 * DELETE /api/social/[platform]
 * Disconnect a social platform
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { platform } = await params
    
    // Validate platform
    if (!VALID_PLATFORMS.includes(platform as SocialPlatform)) {
      return errorResponse(`Invalid platform. Must be one of: ${VALID_PLATFORMS.join(', ')}`)
    }

    // Get authenticated user
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse('Unauthorized', 401)
    }

    // Check if account exists
    const account = await getSocialAccountByPlatform(user.id, platform as SocialPlatform)

    if (!account) {
      return errorResponse(`No ${platform} account connected`, 404)
    }

    // Delete the account
    await deleteSocialAccount(user.id, platform as SocialPlatform)

    // TODO: In production, also revoke the OAuth tokens with the platform

    return successResponse({
      disconnected: true,
      platform,
      message: `${platform} account disconnected successfully`,
    })
  } catch (error) {
    console.error('Error disconnecting social account:', error)
    return errorResponse('Failed to disconnect social account', 500)
  }
}

/**
 * PUT /api/social/[platform]
 * Refresh tokens for a social platform
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { platform } = await params
    
    // Validate platform
    if (!VALID_PLATFORMS.includes(platform as SocialPlatform)) {
      return errorResponse(`Invalid platform. Must be one of: ${VALID_PLATFORMS.join(', ')}`)
    }

    // Get authenticated user
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse('Unauthorized', 401)
    }

    // Check if account exists
    const account = await getSocialAccountByPlatform(user.id, platform as SocialPlatform)

    if (!account) {
      return errorResponse(`No ${platform} account connected`, 404)
    }

    // In production, this would:
    // 1. Use the refresh token to get a new access token from the platform
    // 2. Update the stored tokens

    // For demo, just extend the expiration
    const updatedAccount = await refreshSocialAccountTokens(
      user.id,
      platform as SocialPlatform,
      {
        access_token: account.access_token || 'demo_token',
        refresh_token: account.refresh_token || undefined,
        token_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }
    )

    return successResponse({
      refreshed: true,
      account: {
        id: updatedAccount.id,
        platform: updatedAccount.platform,
        accountHandle: updatedAccount.account_handle,
        isActive: updatedAccount.is_active,
        tokenExpiresAt: updatedAccount.token_expires_at,
      },
    })
  } catch (error) {
    console.error('Error refreshing social account:', error)
    return errorResponse('Failed to refresh social account tokens', 500)
  }
}
