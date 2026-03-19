import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  parseBody,
} from '@/lib/api-utils'

// In-memory user store (replace with Supabase)
const users = new Map<string, User>()

// Initialize with demo user
users.set('user-1', {
  id: 'user-1',
  email: 'demo@videoforge.ai',
  fullName: 'Demo User',
  avatarUrl: null,
  subscriptionTier: 'pro',
  creditsBalance: 87,
  creditsUsedThisMonth: 13,
  stripeCustomerId: null,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: new Date().toISOString(),
})

interface User {
  id: string
  email: string
  fullName: string
  avatarUrl: string | null
  subscriptionTier: 'free' | 'starter' | 'pro' | 'business' | 'enterprise'
  creditsBalance: number
  creditsUsedThisMonth: number
  stripeCustomerId: string | null
  createdAt: string
  updatedAt: string
}

/**
 * GET /api/user
 * Get current user profile
 */
export async function GET(request: NextRequest) {
  try {
    // Get user ID from auth (placeholder)
    const userId = 'user-1' // TODO: Get from auth session

    const user = users.get(userId)

    if (!user) {
      return errorResponse('User not found', 404)
    }

    // Don't expose sensitive fields
    const { stripeCustomerId, ...safeUser } = user

    return successResponse(safeUser)
  } catch (error) {
    console.error('Error getting user:', error)
    return errorResponse('Failed to get user profile', 500)
  }
}

/**
 * PUT /api/user
 * Update current user profile
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await parseBody<Partial<User>>(request)

    if (!body) {
      return errorResponse('Invalid request body')
    }

    // Get user ID from auth (placeholder)
    const userId = 'user-1' // TODO: Get from auth session

    const user = users.get(userId)

    if (!user) {
      return errorResponse('User not found', 404)
    }

    // Only allow updating certain fields
    const allowedFields = ['fullName', 'avatarUrl']
    const updates: Partial<User> = {}
    
    for (const field of allowedFields) {
      if (body[field as keyof User] !== undefined) {
        (updates as Record<string, unknown>)[field] = body[field as keyof User]
      }
    }

    // Update user
    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    users.set(userId, updatedUser)

    // Don't expose sensitive fields
    const { stripeCustomerId, ...safeUser } = updatedUser

    return successResponse(safeUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return errorResponse('Failed to update user profile', 500)
  }
}
