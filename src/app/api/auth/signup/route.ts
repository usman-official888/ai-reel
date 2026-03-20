/**
 * Signup API Route
 * POST /api/auth/signup
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
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

    // Password strength check (optional but recommended)
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

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Sign up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback`,
      },
    })

    if (error) {
      // Map Supabase errors to user-friendly messages
      let message = 'Signup failed'
      let statusCode = 400

      if (error.message.includes('User already registered')) {
        message = 'An account with this email already exists'
        statusCode = 409
      } else if (error.message.includes('Password')) {
        message = error.message
      } else if (error.message.includes('rate limit')) {
        message = 'Too many signup attempts. Please try again later.'
        statusCode = 429
      }

      return NextResponse.json(
        { success: false, error: message },
        { status: statusCode }
      )
    }

    // Check if email confirmation is required
    const emailConfirmationRequired = !data.session

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: data.user?.id,
          email: data.user?.email,
          emailVerified: data.user?.email_confirmed_at !== null,
          createdAt: data.user?.created_at,
        },
        session: data.session ? {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at,
          expiresIn: data.session.expires_in,
        } : null,
        emailConfirmationRequired,
        message: emailConfirmationRequired 
          ? 'Please check your email to verify your account'
          : 'Account created successfully',
      },
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
