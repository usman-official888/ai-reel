import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  getPaginationParams,
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

/**
 * GET /api/jobs
 * List jobs for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, offset } = getPaginationParams(searchParams)
    
    // Filter params
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    // Get user ID from auth (placeholder)
    const userId = 'user-1' // TODO: Get from auth session

    // Filter jobs
    let userJobs = Array.from(jobs.values())
      .filter((j) => j.userId === userId)

    if (projectId) {
      userJobs = userJobs.filter((j) => j.projectId === projectId)
    }

    if (status) {
      userJobs = userJobs.filter((j) => j.status === status)
    }

    if (type) {
      userJobs = userJobs.filter((j) => j.type === type)
    }

    // Sort by creation date (newest first)
    userJobs.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    // Paginate
    const total = userJobs.length
    const paginatedJobs = userJobs.slice(offset, offset + limit)

    return successResponse({
      jobs: paginatedJobs,
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
