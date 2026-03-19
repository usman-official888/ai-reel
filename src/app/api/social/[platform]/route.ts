import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
} from '@/lib/api-utils'

// In-memory store (replace with database)
const socialAccounts = new Map<string, SocialAccount>()

interface SocialAccount {
  id: string
  userId: string
  platform: 'youtube' | 'tiktok' | 'instagram' | 'twitter'
  accountHandle: string
  accountName: string
  profileImageUrl?: string
  isActive: boolean
  tokenExpiresAt: string
  connectedAt: string
}

interface RouteParams {
  params: { platform: string }
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
    const { platform } = params
    
    // Validate platform
    const validPlatforms = ['youtube', 'tiktok', 'instagram', 'twitter']
    if (!validPlatforms.includes(platform)) {
      return errorResponse(`Invalid platform. Must be one of: ${validPlatforms.join(', ')}`)
    }

    // Get user ID from auth (placeholder)
    const userId = 'user-1' // TODO: Get from auth session

    const account = Array.from(socialAccounts.values())
      .find((a) => a.userId === userId && a.platform === platform)

    if (!account) {
      return errorResponse(`No ${platform} account connected`, 404)
    }

    return successResponse({
      ...account,
      isExpired: new Date(account.tokenExpiresAt) < new Date(),
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
    const { platform } = params
    
    // Validate platform
    const validPlatforms = ['youtube', 'tiktok', 'instagram', 'twitter']
    if (!validPlatforms.includes(platform)) {
      return errorResponse(`Invalid platform. Must be one of: ${validPlatforms.join(', ')}`)
    }

    // Get user ID from auth (placeholder)
    const userId = 'user-1' // TODO: Get from auth session

    // Find the account
    const account = Array.from(socialAccounts.entries())
      .find(([, a]) => a.userId === userId && a.platform === platform)

    if (!account) {
      return errorResponse(`No ${platform} account connected`, 404)
    }

    const [accountId] = account

    // Delete the account
    socialAccounts.delete(accountId)

    // In production, also revoke the OAuth tokens with the platform

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
    const { platform } = params
    
    // Validate platform
    const validPlatforms = ['youtube', 'tiktok', 'instagram', 'twitter']
    if (!validPlatforms.includes(platform)) {
      return errorResponse(`Invalid platform. Must be one of: ${validPlatforms.join(', ')}`)
    }

    // Get user ID from auth (placeholder)
    const userId = 'user-1' // TODO: Get from auth session

    // Find the account
    const accountEntry = Array.from(socialAccounts.entries())
      .find(([, a]) => a.userId === userId && a.platform === platform)

    if (!accountEntry) {
      return errorResponse(`No ${platform} account connected`, 404)
    }

    const [accountId, account] = accountEntry

    // In production, this would:
    // 1. Use the refresh token to get new access token
    // 2. Update the stored tokens

    // For demo, just extend the expiration
    const updatedAccount: SocialAccount = {
      ...account,
      tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
    }

    socialAccounts.set(accountId, updatedAccount)

    return successResponse({
      refreshed: true,
      account: updatedAccount,
    })
  } catch (error) {
    console.error('Error refreshing social account:', error)
    return errorResponse('Failed to refresh social account tokens', 500)
  }
}
