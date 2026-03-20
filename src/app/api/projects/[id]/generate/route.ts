import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  estimateCredits,
} from '@/lib/api-utils'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  getProject,
  updateProject,
  getUser,
  deductCredits,
  createPipelineJobs,
  getProjectJobs,
  getPipelineStatus,
  createTransaction,
} from '@/lib/db'
import { estimatePipelineCost } from '@/lib/services/video-pipeline'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/projects/[id]/generate
 * Start video generation for a project
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    
    // Get authenticated user
    const supabase = await createServerSupabaseClient()
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return errorResponse('Unauthorized', 401)
    }

    // Get project
    const project = await getProject(id, authUser.id)

    if (!project) {
      return errorResponse('Project not found', 404)
    }

    // Check if already processing
    if (project.status === 'processing') {
      return errorResponse('Project is already being processed', 400)
    }

    // Check if already completed
    if (project.status === 'completed') {
      return errorResponse('Project has already been generated. Create a new project or reset this one.', 400)
    }

    // Get user for credit check
    const user = await getUser(authUser.id)
    if (!user) {
      return errorResponse('User not found', 404)
    }

    // Estimate credits needed
    const sceneCount = Math.ceil((project.duration_target || 60) / 15)
    const creditsNeeded = estimateCredits(project.duration_target || 60, sceneCount)
    
    // Check user's credit balance
    if (user.credits_balance < creditsNeeded) {
      return errorResponse(
        `Insufficient credits. Need ${creditsNeeded}, have ${user.credits_balance}`,
        402
      )
    }

    // Deduct credits
    const { success, newBalance } = await deductCredits(authUser.id, creditsNeeded)
    if (!success) {
      return errorResponse('Failed to deduct credits', 500)
    }

    // Estimate costs
    const costEstimate = estimatePipelineCost(project.duration_target || 60, sceneCount)

    // Update project status
    await updateProject(id, authUser.id, {
      status: 'processing',
      progress: 0,
      cost_credits: creditsNeeded,
    })

    // Create pipeline jobs
    const jobs = await createPipelineJobs(id, authUser.id)

    // Record transaction
    await createTransaction({
      userId: authUser.id,
      type: 'usage',
      paymentMethod: 'free',
      amountUsd: costEstimate.totalCost,
      creditsAmount: -creditsNeeded,
      description: `Video generation: ${project.title}`,
      status: 'completed',
      metadata: { project_id: id },
    })

    // TODO: In production, queue the actual video generation pipeline
    // This would use BullMQ or similar to process jobs asynchronously

    return successResponse({
      message: 'Video generation started',
      projectId: id,
      creditsUsed: creditsNeeded,
      newCreditBalance: newBalance,
      estimatedCost: costEstimate,
      jobs: jobs.map(j => ({ id: j.id, type: j.type, status: j.status })),
      estimatedTime: '2-3 minutes',
    })
  } catch (error) {
    console.error('Error starting generation:', error)
    return errorResponse('Failed to start video generation', 500)
  }
}

/**
 * GET /api/projects/[id]/generate
 * Get generation status and progress
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

    // Get project
    const project = await getProject(id, user.id)

    if (!project) {
      return errorResponse('Project not found', 404)
    }

    // Get jobs for this project
    const jobs = await getProjectJobs(id)
    const pipelineStatus = await getPipelineStatus(id)

    return successResponse({
      status: project.status,
      progress: project.progress,
      pipelineStatus,
      jobs: jobs.map(j => ({
        id: j.id,
        type: j.type,
        status: j.status,
        progress: j.progress,
        error: j.error_message,
        startedAt: j.started_at,
        completedAt: j.completed_at,
      })),
      outputUrl: project.output_url,
      script: project.script,
      scenes: project.scenes,
    })
  } catch (error) {
    console.error('Error getting generation status:', error)
    return errorResponse('Failed to get generation status', 500)
  }
}
