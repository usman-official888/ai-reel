/**
 * Users Database Service
 * Handles all user-related database operations
 */

import { getSupabaseServerClient } from '../supabase'
import { 
  User, 
  UserInsert, 
  UserUpdate,
  SubscriptionTier 
} from '@/types/database'

/**
 * Get user by ID
 */
export async function getUser(userId: string): Promise<User | null> {
  const supabase = getSupabaseServerClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to get user: ${error.message}`)
  }

  return data
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const supabase = getSupabaseServerClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to get user: ${error.message}`)
  }

  return data
}

/**
 * Create or update user (upsert)
 */
export async function upsertUser(
  userData: UserInsert
): Promise<User> {
  const supabase = getSupabaseServerClient()

  const { data, error } = await supabase
    .from('users')
    .upsert(userData)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to upsert user: ${error.message}`)
  }

  return data
}

/**
 * Update user profile
 */
export async function updateUser(
  userId: string,
  updates: UserUpdate
): Promise<User> {
  const supabase = getSupabaseServerClient()

  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update user: ${error.message}`)
  }

  return data
}

/**
 * Get user's credit balance
 */
export async function getUserCredits(userId: string): Promise<number> {
  const user = await getUser(userId)
  return user?.credits_balance || 0
}

/**
 * Add credits to user's balance
 */
export async function addCredits(
  userId: string,
  amount: number
): Promise<number> {
  const supabase = getSupabaseServerClient()

  const { data, error } = await supabase.rpc('add_credits', {
    user_id: userId,
    credit_amount: amount,
  })

  if (error) {
    // Fallback to manual update if RPC doesn't exist
    const user = await getUser(userId)
    if (!user) throw new Error('User not found')
    
    const newBalance = user.credits_balance + amount
    await updateUser(userId, { credits_balance: newBalance })
    return newBalance
  }

  return data
}

/**
 * Deduct credits from user's balance
 */
export async function deductCredits(
  userId: string,
  amount: number
): Promise<{ success: boolean; newBalance: number }> {
  const user = await getUser(userId)
  if (!user) {
    throw new Error('User not found')
  }

  if (user.credits_balance < amount) {
    return { success: false, newBalance: user.credits_balance }
  }

  const newBalance = user.credits_balance - amount
  await updateUser(userId, { credits_balance: newBalance })
  
  return { success: true, newBalance }
}

/**
 * Check if user has enough credits
 */
export async function hasEnoughCredits(
  userId: string,
  required: number
): Promise<boolean> {
  const balance = await getUserCredits(userId)
  return balance >= required
}

/**
 * Update user subscription
 */
export async function updateSubscription(
  userId: string,
  tier: SubscriptionTier,
  stripeCustomerId?: string,
  subscriptionEnd?: Date
): Promise<User> {
  const updates: UserUpdate = {
    subscription_tier: tier,
    subscription_start: new Date().toISOString(),
  }

  if (stripeCustomerId) {
    updates.stripe_customer_id = stripeCustomerId
  }

  if (subscriptionEnd) {
    updates.subscription_end = subscriptionEnd.toISOString()
  }

  return updateUser(userId, updates)
}

/**
 * Get subscription tier limits
 */
export function getSubscriptionLimits(tier: SubscriptionTier): {
  monthlyVideos: number
  maxDuration: number
  maxResolution: '720p' | '1080p' | '4K'
  priorityProcessing: boolean
  apiAccess: boolean
} {
  const limits: Record<SubscriptionTier, ReturnType<typeof getSubscriptionLimits>> = {
    free: {
      monthlyVideos: 3,
      maxDuration: 60,
      maxResolution: '720p',
      priorityProcessing: false,
      apiAccess: false,
    },
    starter: {
      monthlyVideos: 30,
      maxDuration: 120,
      maxResolution: '1080p',
      priorityProcessing: false,
      apiAccess: false,
    },
    pro: {
      monthlyVideos: 100,
      maxDuration: 180,
      maxResolution: '4K',
      priorityProcessing: true,
      apiAccess: true,
    },
    business: {
      monthlyVideos: 500,
      maxDuration: 300,
      maxResolution: '4K',
      priorityProcessing: true,
      apiAccess: true,
    },
    enterprise: {
      monthlyVideos: Infinity,
      maxDuration: 600,
      maxResolution: '4K',
      priorityProcessing: true,
      apiAccess: true,
    },
  }

  return limits[tier]
}
