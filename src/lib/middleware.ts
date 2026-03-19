/**
 * Authentication Middleware
 * Handles API route authentication and authorization
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from './supabase'
import { errorResponse } from './api-utils'
import { getUser, getSubscriptionLimits } from './db'

export interface AuthenticatedUser {
  id: string
  email: string
  subscriptionTier: string
  creditsBalance: number
}

export interface AuthContext {
  user: AuthenticatedUser
  request: NextRequest
}

type RouteHandler = (
  request: NextRequest,
  context: { params: Record<string, string> }
) => Promise<NextResponse>

type AuthenticatedHandler = (
  request: NextRequest,
  context: { params: Record<string, string>; user: AuthenticatedUser }
) => Promise<NextResponse>

/**
 * Wrap an API route handler with authentication
 */
export function withAuth(handler: AuthenticatedHandler): RouteHandler {
  return async (request, context) => {
    try {
      // Get user from auth header
      const authUser = await getUserFromRequest(request)
      
      if (!authUser) {
        return errorResponse('Authentication required', 401)
      }

      // Get full user profile from database
      const user = await getUser(authUser.id)
      
      if (!user) {
        return errorResponse('User not found', 404)
      }

      const authenticatedUser: AuthenticatedUser = {
        id: user.id,
        email: user.email,
        subscriptionTier: user.subscription_tier,
        creditsBalance: user.credits_balance,
      }

      // Call the handler with authenticated context
      return handler(request, { ...context, user: authenticatedUser })
    } catch (error) {
      console.error('Auth middleware error:', error)
      return errorResponse('Authentication failed', 401)
    }
  }
}

/**
 * Check if user has required subscription tier
 */
export function requireTier(
  user: AuthenticatedUser,
  requiredTiers: string[]
): boolean {
  return requiredTiers.includes(user.subscriptionTier)
}

/**
 * Check if user has enough credits
 */
export function requireCredits(
  user: AuthenticatedUser,
  required: number
): boolean {
  return user.creditsBalance >= required
}

/**
 * Middleware to check subscription tier
 */
export function withTier(
  handler: AuthenticatedHandler,
  requiredTiers: string[]
): RouteHandler {
  return withAuth(async (request, context) => {
    if (!requireTier(context.user, requiredTiers)) {
      return errorResponse(
        'This feature requires a higher subscription tier',
        403
      )
    }
    return handler(request, context)
  })
}

/**
 * Middleware to check credits
 */
export function withCredits(
  handler: AuthenticatedHandler,
  getRequired: (request: NextRequest) => number | Promise<number>
): RouteHandler {
  return withAuth(async (request, context) => {
    const required = await getRequired(request)
    
    if (!requireCredits(context.user, required)) {
      return errorResponse(
        `Insufficient credits. Required: ${required}, Available: ${context.user.creditsBalance}`,
        402
      )
    }
    return handler(request, context)
  })
}

/**
 * Rate limiting middleware (simple in-memory implementation)
 * In production, use Redis
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

export function withRateLimit(
  handler: RouteHandler,
  options: {
    maxRequests: number
    windowMs: number
    keyGenerator?: (request: NextRequest) => string
  }
): RouteHandler {
  const { maxRequests, windowMs, keyGenerator } = options

  return async (request, context) => {
    // Generate rate limit key
    const key = keyGenerator
      ? keyGenerator(request)
      : request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown'

    const now = Date.now()
    const entry = rateLimitStore.get(key)

    if (!entry || now > entry.resetAt) {
      // New window
      rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
    } else if (entry.count >= maxRequests) {
      // Rate limited
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Too many requests',
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': retryAfter.toString(),
          },
        }
      )
    } else {
      // Increment count
      entry.count++
    }

    return handler(request, context)
  }
}

/**
 * Combine multiple middleware
 */
export function compose(...middlewares: ((handler: RouteHandler) => RouteHandler)[]): (handler: RouteHandler) => RouteHandler {
  return (handler) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler)
  }
}

/**
 * Dev mode auth bypass (for testing without Supabase)
 */
export function withDevAuth(handler: AuthenticatedHandler): RouteHandler {
  return async (request, context) => {
    // In development, allow bypassing auth with a special header
    if (process.env.NODE_ENV === 'development') {
      const devUser = request.headers.get('x-dev-user-id')
      
      if (devUser) {
        const mockUser: AuthenticatedUser = {
          id: devUser,
          email: 'dev@example.com',
          subscriptionTier: 'pro',
          creditsBalance: 100,
        }
        return handler(request, { ...context, user: mockUser })
      }
    }

    // Fall back to normal auth
    return withAuth(handler)(request, context)
  }
}
