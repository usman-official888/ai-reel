import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-utils'

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 * 
 * Events handled:
 * - checkout.session.completed: Credit purchase completed
 * - customer.subscription.created: New subscription
 * - customer.subscription.updated: Plan change
 * - customer.subscription.deleted: Subscription cancelled
 * - invoice.payment_succeeded: Subscription renewal
 * - invoice.payment_failed: Payment failed
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return errorResponse('Missing Stripe signature', 400)
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured')
      return errorResponse('Webhook not configured', 500)
    }

    // In production, verify the webhook signature using Stripe SDK:
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    // const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    // For demo, parse the body directly
    const event = JSON.parse(body)

    console.log('Stripe webhook received:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        await handleCheckoutComplete(session)
        break
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object
        await handleSubscriptionCreated(subscription)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        await handleSubscriptionCancelled(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        await handlePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        await handlePaymentFailed(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return successResponse({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return errorResponse('Webhook processing failed', 500)
  }
}

async function handleCheckoutComplete(session: Record<string, unknown>) {
  // Extract metadata
  const userId = session.client_reference_id as string
  const credits = session.metadata?.credits as string

  if (userId && credits) {
    // Add credits to user account
    console.log(`Adding ${credits} credits to user ${userId}`)
    // TODO: Update user credits in database
  }
}

async function handleSubscriptionCreated(subscription: Record<string, unknown>) {
  const customerId = subscription.customer as string
  const priceId = (subscription.items as { data: Array<{ price: { id: string } }> })?.data[0]?.price?.id

  console.log(`Subscription created for customer ${customerId}, price: ${priceId}`)
  
  // TODO: 
  // 1. Look up user by Stripe customer ID
  // 2. Update subscription tier based on price ID
  // 3. Reset monthly credits
}

async function handleSubscriptionUpdated(subscription: Record<string, unknown>) {
  const customerId = subscription.customer as string
  const priceId = (subscription.items as { data: Array<{ price: { id: string } }> })?.data[0]?.price?.id
  const status = subscription.status as string

  console.log(`Subscription updated for customer ${customerId}, price: ${priceId}, status: ${status}`)
  
  // TODO:
  // 1. Look up user by Stripe customer ID
  // 2. Update subscription tier if price changed
  // 3. Handle status changes (active, past_due, unpaid, etc.)
}

async function handleSubscriptionCancelled(subscription: Record<string, unknown>) {
  const customerId = subscription.customer as string

  console.log(`Subscription cancelled for customer ${customerId}`)
  
  // TODO:
  // 1. Look up user by Stripe customer ID
  // 2. Downgrade to free tier
  // 3. Optionally: Send retention email
}

async function handlePaymentSucceeded(invoice: Record<string, unknown>) {
  const customerId = invoice.customer as string
  const amountPaid = invoice.amount_paid as number

  console.log(`Payment succeeded for customer ${customerId}, amount: ${amountPaid}`)
  
  // TODO:
  // 1. Look up user by Stripe customer ID
  // 2. Reset monthly credits if subscription renewal
  // 3. Send receipt email
}

async function handlePaymentFailed(invoice: Record<string, unknown>) {
  const customerId = invoice.customer as string
  const attemptCount = invoice.attempt_count as number

  console.log(`Payment failed for customer ${customerId}, attempt: ${attemptCount}`)
  
  // TODO:
  // 1. Look up user by Stripe customer ID
  // 2. Send payment failed notification
  // 3. If max retries exceeded, suspend account
}
