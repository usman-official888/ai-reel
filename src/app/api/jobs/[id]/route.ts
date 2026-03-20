import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
} from '@/lib/api-utils'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getJob, updateJobProgress } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
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
    const { id } = await params
    
    // Get authenticated user
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse('Unauthorized', 401)
    }

    const job = await getJob(id)

    if (!job) {
      return errorResponse('Job not found', 404)
    }

    // Verify ownership via user_id
    if (job.user_id !== user.id) {
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
    const { id } = await params
    
    // Get authenticated user
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse('Unauthorized', 401)
    }

    const job = await getJob(id)

    if (!job) {
      return errorResponse('Job not found', 404)
    }

    // Verify ownership
    if (job.user_id !== user.id) {
      return errorResponse('Access denied', 403)
    }

    // Can only cancel pending or queued jobs
    if (!['pending', 'queued'].includes(job.status)) {
      return errorResponse(`Cannot cancel job with status: ${job.status}`, 400)
    }

    // Update job status to failed with cancel message
    await updateJobProgress(id, 'failed', 0, {
      error_message: 'Cancelled by user',
    })

    const updatedJob = await getJob(id)

    return successResponse({ cancelled: true, job: updatedJob })
  } catch (error) {
    console.error('Error cancelling job:', error)
    return errorResponse('Failed to cancel job', 500)
  }
}
