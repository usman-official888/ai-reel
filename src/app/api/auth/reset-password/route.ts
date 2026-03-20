/**
 * Reset Password API Route
 * POST /api/auth/reset-password
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    // Validation
    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    if (password.length > 72) {
      return NextResponse.json(
        { success: false, error: 'Password must be less than 72 characters' },
        { status: 400 }
      )
    }

    // Password strength check
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    
    if (!(hasUpperCase && hasLowerCase && hasNumbers)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
        },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Update password
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      let message = 'Failed to reset password'
      
      if (error.message.includes('session')) {
        message = 'Password reset link has expired. Please request a new one.'
      }

      return NextResponse.json(
        { success: false, error: message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Password reset successfully',
      },
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
