import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  generateId,
} from '@/lib/api-utils'

// In-memory store (replace with database)
const socialAccounts = new Map<string, SocialAccount>()

// Initialize with demo accounts
socialAccounts.set('social-1', {
  id: 'social-1',
  userId: 'user-1',
  platform: 'youtube',
  accountHandle: '@VideoForgeDemo',
  accountName: 'VideoForge Demo Channel',
  isActive: true,
  tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  connectedAt: '2024-02-01T10:00:00Z',
})

socialAccounts.set('social-2', {
  id: 'social-2',
  userId: 'user-1',
  platform: 'tiktok',
  accountHandle: '@videoforge_ai',
  accountName: 'VideoForge AI',
  isActive: true,
  tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  connectedAt: '2024-02-15T14:00:00Z',
})

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

/**
 * GET /api/social
 * List all connected social accounts
 */
export async function GET(request: NextRequest) {
  try {
    // Get user ID from auth (placeholder)
    const userId = 'user-1' // TODO: Get from auth session

    const userAccounts = Array.from(socialAccounts.values())
      .filter((a) => a.userId === userId)
      .map((account) => ({
        ...account,
        // Check if token is expired
        isExpired: new Date(account.tokenExpiresAt) < new Date(),
      }))

    return successResponse({ accounts: userAccounts })
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
    const body = await request.json()
    const { platform, redirectUrl } = body

    if (!platform) {
      return errorResponse('Missing required field: platform')
    }

    const validPlatforms = ['youtube', 'tiktok', 'instagram', 'twitter']
    if (!validPlatforms.includes(platform)) {
      return errorResponse(`Invalid platform. Must be one of: ${validPlatforms.join(', ')}`)
    }

    // Get user ID from auth (placeholder)
    const userId = 'user-1' // TODO: Get from auth session

    // Check if already connected
    const existingAccount = Array.from(socialAccounts.values())
      .find((a) => a.userId === userId && a.platform === platform)

    if (existingAccount) {
      return errorResponse(`${platform} account already connected`, 400)
    }

    // Generate OAuth URL based on platform
    const oauthUrls: Record<string, string> = {
      youtube: 'https://accounts.google.com/o/oauth2/v2/auth',
      tiktok: 'https://www.tiktok.com/v2/auth/authorize/',
      instagram: 'https://api.instagram.com/oauth/authorize',
      twitter: 'https://twitter.com/i/oauth2/authorize',
    }

    // In production, this would generate proper OAuth URLs with:
    // - client_id
    // - redirect_uri
    // - scope
    // - state (for CSRF protection)

    const state = generateId('oauth')
    const oauthUrl = `${oauthUrls[platform]}?client_id=YOUR_CLIENT_ID&redirect_uri=${encodeURIComponent(redirectUrl || '/api/social/callback')}&state=${state}&platform=${platform}`

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
