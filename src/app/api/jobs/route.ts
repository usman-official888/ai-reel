import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  getPaginationParams,
} from '@/lib/api-utils'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getUserJobs } from '@/lib/db'
import type { JobStatus, JobType } from '@/types/database'

/**
 * GET /api/jobs
 * List jobs for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, offset } = getPaginationParams(searchParams)
    
    // Filter params
    const projectId = searchParams.get('projectId') || undefined
    const status = searchParams.get('status') as JobStatus | undefined
    const type = searchParams.get('type') as JobType | undefined

    // Get authenticated user
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse('Unauthorized', 401)
    }

    // Get jobs from database
    const { jobs, total } = await getUserJobs(user.id, {
      projectId,
      status,
      type,
      limit,
      offset,
    })

    return successResponse({
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error listing jobs:', error)
    return errorResponse('Failed to list jobs', 500)
  }
}
