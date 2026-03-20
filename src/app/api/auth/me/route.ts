/**
 * Current User (Me) API Route
 * GET /api/auth/me
 */

import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/db'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get user profile from database
    const profile = await getUser(user.id)

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        emailVerified: user.email_confirmed_at !== null,
        createdAt: user.created_at,
        profile: profile ? {
          fullName: profile.full_name,
          avatarUrl: profile.avatar_url,
          subscriptionTier: profile.subscription_tier,
          creditsBalance: profile.credits_balance,
          creditsUsedThisMonth: profile.credits_used_this_month,
        } : null,
      },
    })
  } catch (error) {
    console.error('Get current user error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
