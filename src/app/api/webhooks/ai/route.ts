import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-utils'

/**
 * POST /api/webhooks/ai
 * Handle callbacks from AI providers (Fal.ai, etc.)
 * 
 * Used for:
 * - Long-running job completion notifications
 * - Error notifications
 * - Progress updates
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Identify the provider from headers or body
    const provider = request.headers.get('x-provider') || body.provider
    
    console.log(`AI webhook received from ${provider}:`, body)

    switch (provider) {
      case 'fal': {
        await handleFalWebhook(body)
        break
      }

      case 'fish-audio': {
        await handleFishAudioWebhook(body)
        break
      }

      default:
        console.log(`Unknown AI provider: ${provider}`)
    }

    return successResponse({ received: true })
  } catch (error) {
    console.error('AI webhook error:', error)
    return errorResponse('Webhook processing failed', 500)
  }
}

interface FalWebhookPayload {
  request_id: string
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  result?: {
    images?: Array<{ url: string }>
    video?: { url: string }
  }
  error?: string
  progress?: number
}

async function handleFalWebhook(payload: FalWebhookPayload) {
  const { request_id, status, result, error, progress } = payload

  console.log(`Fal.ai job ${request_id}: ${status}`)

  // TODO: Look up job by request_id and update status
  // const job = await db.jobs.findByExternalId(request_id)

  switch (status) {
    case 'IN_QUEUE':
      // Job is queued, update status
      console.log(`Job ${request_id} queued`)
      break

    case 'IN_PROGRESS':
      // Job is processing, update progress
      console.log(`Job ${request_id} progress: ${progress}%`)
      break

    case 'COMPLETED':
      // Job completed, store results
      console.log(`Job ${request_id} completed:`, result)
      
      if (result?.images) {
        // Image generation completed
        // TODO: Download and store images to S3
      }
      
      if (result?.video) {
        // Video generation completed
        // TODO: Download and store video to S3
      }
      break

    case 'FAILED':
      // Job failed, log error
      console.error(`Job ${request_id} failed:`, error)
      // TODO: Update job status to failed
      // TODO: Optionally refund credits
      break
  }
}

interface FishAudioWebhookPayload {
  job_id: string
  status: 'completed' | 'failed'
  audio_url?: string
  duration?: number
  error?: string
}

async function handleFishAudioWebhook(payload: FishAudioWebhookPayload) {
  const { job_id, status, audio_url, duration, error } = payload

  console.log(`Fish.audio job ${job_id}: ${status}`)

  // TODO: Look up job by job_id and update status
  // const job = await db.jobs.findByExternalId(job_id)

  switch (status) {
    case 'completed':
      console.log(`Voice generation completed: ${audio_url}, duration: ${duration}s`)
      // TODO: Download and store audio to S3
      // TODO: Update job status to completed
      break

    case 'failed':
      console.error(`Voice generation failed:`, error)
      // TODO: Update job status to failed
      // TODO: Optionally retry or refund
      break
  }
}

/**
 * Verify webhook signature from Fal.ai
 * In production, implement proper signature verification
 */
function verifyFalSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  // TODO: Implement HMAC verification
  // const expectedSignature = crypto
  //   .createHmac('sha256', secret)
  //   .update(body)
  //   .digest('hex')
  // return signature === expectedSignature
  return true
}
