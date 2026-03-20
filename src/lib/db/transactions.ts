/**
 * Transactions Database Service
 * Handles all transaction-related database operations
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { generateId } from '../api-utils'
import type { TransactionType, PaymentMethod, Json } from '@/types/database'

export interface CreateTransactionData {
  userId: string
  type: TransactionType
  paymentMethod: PaymentMethod
  amountUsd?: number
  creditsAmount?: number
  description?: string
  status?: string
  metadata?: Record<string, unknown>
}

/**
 * Create a new transaction record
 */
export async function createTransaction(
  data: CreateTransactionData
): Promise<{ id: string }> {
  const supabase = await createServerSupabaseClient()

  const { data: transaction, error } = await supabase
    .from('transactions')
    .insert({
      id: generateId('txn'),
      user_id: data.userId,
      type: data.type,
      payment_method: data.paymentMethod,
      amount_usd: data.amountUsd || 0,
      credits_amount: data.creditsAmount || 0,
      description: data.description || null,
      status: data.status || 'completed',
      metadata: (data.metadata || null) as Json,
    } as never)
    .select('id')
    .single()

  if (error) {
    throw new Error(`Failed to create transaction: ${error.message}`)
  }

  return { id: (transaction as { id: string }).id }
}

/**
 * Get transactions for a user
 */
export async function getUserTransactions(
  userId: string,
  options: {
    limit?: number
    offset?: number
    type?: TransactionType
  } = {}
): Promise<{ transactions: unknown[]; total: number }> {
  const supabase = await createServerSupabaseClient()
  const { limit = 20, offset = 0, type } = options

  let query = supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (type) {
    query = query.eq('type', type)
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1)

  if (error) {
    throw new Error(`Failed to get transactions: ${error.message}`)
  }

  return { transactions: data || [], total: count || 0 }
}

/**
 * Update transaction status
 */
export async function updateTransactionStatus(
  transactionId: string,
  status: string
): Promise<void> {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase
    .from('transactions')
    .update({ status } as never)
    .eq('id', transactionId)

  if (error) {
    throw new Error(`Failed to update transaction: ${error.message}`)
  }
}
