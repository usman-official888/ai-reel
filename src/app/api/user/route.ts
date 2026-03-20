import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  parseBody,
} from '@/lib/api-utils'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getUser, updateUser } from '@/lib/db'

/**
 * GET /api/user
 * Get current user profile
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createServerSupabaseClient()
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return errorResponse('Unauthorized', 401)
    }

    // Get user profile from database
    const user = await getUser(authUser.id)

    if (!user) {
      return errorResponse('User profile not found', 404)
    }

    // Don't expose sensitive fields
    const { stripe_customer_id, ...safeUser } = user

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
    const body = await parseBody<Record<string, unknown>>(request)

    if (!body) {
      return errorResponse('Invalid request body')
    }

    // Get authenticated user
    const supabase = await createServerSupabaseClient()
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return errorResponse('Unauthorized', 401)
    }

    // Get existing user profile
    const existingUser = await getUser(authUser.id)

    if (!existingUser) {
      return errorResponse('User profile not found', 404)
    }

    // Only allow updating certain fields
    const allowedFields = ['full_name', 'avatar_url']
    const updates: Record<string, unknown> = {}
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    // Update user
    const updatedUser = await updateUser(authUser.id, updates)

    // Don't expose sensitive fields
    const { stripe_customer_id, ...safeUser } = updatedUser

    return successResponse(safeUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return errorResponse('Failed to update user profile', 500)
  }
}
