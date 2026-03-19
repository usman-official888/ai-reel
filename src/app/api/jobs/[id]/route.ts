import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
} from '@/lib/api-utils'

// In-memory job store (replace with database)
const jobs = new Map<string, Job>()

interface Job {
  id: string
  projectId: string
  userId: string
  type: 'script' | 'image' | 'video' | 'voice' | 'assembly'
  status: 'pending' | 'queued' | 'running' | 'completed' | 'failed'
  progress: number
  result?: unknown
  error?: string
  retryCount: number
  priority: number
  startedAt?: string
  completedAt?: string
  createdAt: string
}

interface RouteParams {
  params: { id: string }
}

/**
 * GET /api/jobs/[id]
 * Get a single job by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params
    
    // Get user ID from auth (placeholder)
    const userId = 'user-1' // TODO: Get from auth session

    const job = jobs.get(id)

    if (!job) {
      return errorResponse('Job not found', 404)
    }

    // Verify ownership
    if (job.userId !== userId) {
      return errorResponse('Access denied', 403)
    }

    return successResponse(job)
  } catch (error) {
    console.error('Error getting job:', error)
    return errorResponse('Failed to get job', 500)
  }
}

/**
 * DELETE /api/jobs/[id]
 * Cancel a pending or queued job
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params
    
    // Get user ID from auth (placeholder)
    const userId = 'user-1' // TODO: Get from auth session

    const job = jobs.get(id)

    if (!job) {
      return errorResponse('Job not found', 404)
    }

    // Verify ownership
    if (job.userId !== userId) {
      return errorResponse('Access denied', 403)
    }

    // Can only cancel pending or queued jobs
    if (!['pending', 'queued'].includes(job.status)) {
      return errorResponse(`Cannot cancel job with status: ${job.status}`, 400)
    }

    // Update job status
    job.status = 'failed'
    job.error = 'Cancelled by user'
    job.completedAt = new Date().toISOString()
    jobs.set(id, job)

    return successResponse({ cancelled: true, job })
  } catch (error) {
    console.error('Error cancelling job:', error)
    return errorResponse('Failed to cancel job', 500)
  }
}
