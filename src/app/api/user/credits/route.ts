import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  parseBody,
} from '@/lib/api-utils'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { 
  getUser, 
  addCredits, 
  getSubscriptionLimits,
  createTransaction,
  updateTransactionStatus,
  getUserTransactions,
} from '@/lib/db'

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
    
    // Get authenticated user
    const supabase = await createServerSupabaseClient()
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return errorResponse('Unauthorized', 401)
    }

    // Get user profile
    const user = await getUser(authUser.id)

    if (!user) {
      return errorResponse('User profile not found', 404)
    }

    const limits = getSubscriptionLimits(user.subscription_tier)

    const response: Record<string, unknown> = {
      balance: user.credits_balance,
      usedThisMonth: user.credits_used_this_month,
      monthlyAllowance: limits.monthlyCredits,
      subscriptionTier: user.subscription_tier,
    }

    // Include transaction history if requested
    if (includeHistory) {
      const { transactions } = await getUserTransactions(authUser.id, { limit: 20 })
      response.transactions = transactions
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

    // Get authenticated user
    const supabase = await createServerSupabaseClient()
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return errorResponse('Unauthorized', 401)
    }

    // Get user profile
    const user = await getUser(authUser.id)

    if (!user) {
      return errorResponse('User profile not found', 404)
    }

    // Create transaction record
    const { id: transactionId } = await createTransaction({
      userId: authUser.id,
      type: 'purchase',
      paymentMethod: 'stripe',
      amountUsd: pack.price,
      creditsAmount: pack.credits,
      description: `Purchased ${pack.credits} credits`,
      status: 'pending',
    })

    // In production, this would:
    // 1. Create Stripe PaymentIntent
    // 2. Return client secret for frontend to complete payment
    // 3. Handle webhook to confirm payment and add credits

    // For demo, we'll auto-complete the purchase
    const newBalance = await addCredits(authUser.id, pack.credits)

    // Update transaction status
    await updateTransactionStatus(transactionId, 'completed')

    return successResponse({
      success: true,
      transactionId,
      creditsAdded: pack.credits,
      newBalance,
    })
  } catch (error) {
    console.error('Error purchasing credits:', error)
    return errorResponse('Failed to purchase credits', 500)
  }
}
