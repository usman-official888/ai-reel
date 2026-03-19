import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  parseBody,
  generateId,
} from '@/lib/api-utils'

// In-memory stores (replace with Supabase)
const users = new Map<string, User>()
const transactions = new Map<string, Transaction>()

// Initialize with demo user
users.set('user-1', {
  id: 'user-1',
  creditsBalance: 87,
  creditsUsedThisMonth: 13,
  subscriptionTier: 'pro',
})

interface User {
  id: string
  creditsBalance: number
  creditsUsedThisMonth: number
  subscriptionTier: 'free' | 'starter' | 'pro' | 'business' | 'enterprise'
}

interface Transaction {
  id: string
  userId: string
  type: 'purchase' | 'subscription' | 'usage' | 'refund' | 'bonus'
  amount: number
  credits: number
  description: string
  status: 'pending' | 'completed' | 'failed'
  stripePaymentId?: string
  createdAt: string
}

// Subscription credit allowances
const SUBSCRIPTION_CREDITS: Record<string, number> = {
  free: 3,
  starter: 30,
  pro: 100,
  business: 500,
  enterprise: 999999,
}

// Credit pack pricing
const CREDIT_PACKS = [
  { credits: 10, price: 9 },
  { credits: 25, price: 19 },
  { credits: 50, price: 35 },
  { credits: 100, price: 59 },
]

/**
 * GET /api/user/credits
 * Get user's credit balance and history
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeHistory = searchParams.get('history') === 'true'
    
    // Get user ID from auth (placeholder)
    const userId = 'user-1' // TODO: Get from auth session

    const user = users.get(userId)

    if (!user) {
      return errorResponse('User not found', 404)
    }

    const response: Record<string, unknown> = {
      balance: user.creditsBalance,
      usedThisMonth: user.creditsUsedThisMonth,
      monthlyAllowance: SUBSCRIPTION_CREDITS[user.subscriptionTier],
      subscriptionTier: user.subscriptionTier,
    }

    // Include transaction history if requested
    if (includeHistory) {
      const userTransactions = Array.from(transactions.values())
        .filter((t) => t.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 20) // Last 20 transactions

      response.transactions = userTransactions
    }

    return successResponse(response)
  } catch (error) {
    console.error('Error getting credits:', error)
    return errorResponse('Failed to get credit balance', 500)
  }
}

/**
 * POST /api/user/credits
 * Purchase additional credits
 */
export async function POST(request: NextRequest) {
  try {
    const body = await parseBody<{
      packIndex: number  // Index of the credit pack to purchase
      paymentMethodId?: string  // Stripe payment method ID
    }>(request)

    if (!body || body.packIndex === undefined) {
      return errorResponse('Missing required field: packIndex')
    }

    const { packIndex } = body

    // Validate pack index
    if (packIndex < 0 || packIndex >= CREDIT_PACKS.length) {
      return errorResponse('Invalid credit pack')
    }

    const pack = CREDIT_PACKS[packIndex]

    // Get user ID from auth (placeholder)
    const userId = 'user-1' // TODO: Get from auth session

    const user = users.get(userId)

    if (!user) {
      return errorResponse('User not found', 404)
    }

    // Create transaction record
    const transaction: Transaction = {
      id: generateId('txn'),
      userId,
      type: 'purchase',
      amount: pack.price,
      credits: pack.credits,
      description: `Purchased ${pack.credits} credits`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    transactions.set(transaction.id, transaction)

    // In production, this would:
    // 1. Create Stripe PaymentIntent
    // 2. Return client secret for frontend to complete payment
    // 3. Handle webhook to confirm payment and add credits

    // For demo, we'll auto-complete the purchase
    transaction.status = 'completed'
    user.creditsBalance += pack.credits
    users.set(userId, user)
    transactions.set(transaction.id, transaction)

    return successResponse({
      success: true,
      transaction,
      newBalance: user.creditsBalance,
    })
  } catch (error) {
    console.error('Error purchasing credits:', error)
    return errorResponse('Failed to purchase credits', 500)
  }
}

/**
 * Internal: Deduct credits for video generation
 */
export async function deductCredits(
  userId: string,
  amount: number,
  description: string
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  const user = users.get(userId)

  if (!user) {
    return { success: false, error: 'User not found' }
  }

  if (user.creditsBalance < amount) {
    return { success: false, error: 'Insufficient credits' }
  }

  // Deduct credits
  user.creditsBalance -= amount
  user.creditsUsedThisMonth += amount
  users.set(userId, user)

  // Record transaction
  const transaction: Transaction = {
    id: generateId('txn'),
    userId,
    type: 'usage',
    amount: 0,
    credits: -amount,
    description,
    status: 'completed',
    createdAt: new Date().toISOString(),
  }
  transactions.set(transaction.id, transaction)

  return { success: true, newBalance: user.creditsBalance }
}

/**
 * Internal: Refund credits
 */
export async function refundCredits(
  userId: string,
  amount: number,
  description: string
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  const user = users.get(userId)

  if (!user) {
    return { success: false, error: 'User not found' }
  }

  // Add credits back
  user.creditsBalance += amount
  if (user.creditsUsedThisMonth >= amount) {
    user.creditsUsedThisMonth -= amount
  }
  users.set(userId, user)

  // Record transaction
  const transaction: Transaction = {
    id: generateId('txn'),
    userId,
    type: 'refund',
    amount: 0,
    credits: amount,
    description,
    status: 'completed',
    createdAt: new Date().toISOString(),
  }
  transactions.set(transaction.id, transaction)

  return { success: true, newBalance: user.creditsBalance }
}
