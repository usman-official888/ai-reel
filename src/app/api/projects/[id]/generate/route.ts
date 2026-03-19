import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  estimateCredits,
} from '@/lib/api-utils'
import {
  startPipeline,
  estimatePipelineCost,
  PipelineOptions,
} from '@/lib/services/video-pipeline'

// Shared project store (would be database in production)
const projects = new Map<string, Project>()
const jobs = new Map<string, Job[]>()

interface Project {
  id: string
  userId: string
  title: string
  topic: string
  status: 'draft' | 'processing' | 'completed' | 'failed'
  progress: number
  settings: ProjectSettings
  script?: unknown
  scenes?: unknown[]
  outputUrl?: string
  thumbnailUrl?: string
  durationSeconds?: number
  costCredits: number
  createdAt: string
  updatedAt: string
}

interface ProjectSettings {
  style: 'documentary' | 'tutorial' | 'story' | 'review' | 'explainer'
  duration: number
  voice: 'professional' | 'casual' | 'energetic' | 'calm'
  voiceGender?: 'male' | 'female'
  aspectRatio: '16:9' | '9:16' | '1:1'
}

interface Job {
  id: string
  projectId: string
  type: 'script' | 'image' | 'video' | 'voice' | 'assembly'
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  result?: unknown
  error?: string
  startedAt?: string
  completedAt?: string
}

interface RouteParams {
  params: { id: string }
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
    const { id } = params
    
    // Get user ID from auth (placeholder)
    const userId = 'user-1' // TODO: Get from auth session

    // Get project
    const project = projects.get(id)

    if (!project) {
      return errorResponse('Project not found', 404)
    }

    // Verify ownership
    if (project.userId !== userId) {
      return errorResponse('Access denied', 403)
    }

    // Check if already processing
    if (project.status === 'processing') {
      return errorResponse('Project is already being processed', 400)
    }

    // Check if already completed
    if (project.status === 'completed') {
      return errorResponse('Project has already been generated. Create a new project or reset this one.', 400)
    }

    // Estimate credits needed
    const sceneCount = Math.ceil(project.settings.duration / 15)
    const creditsNeeded = estimateCredits(project.settings.duration, sceneCount)
    
    // TODO: Check user's credit balance
    const userCredits = 100 // Placeholder
    if (userCredits < creditsNeeded) {
      return errorResponse(`Insufficient credits. Need ${creditsNeeded}, have ${userCredits}`, 402)
    }

    // Estimate costs
    const costEstimate = estimatePipelineCost(project.settings.duration, sceneCount)

    // Update project status
    project.status = 'processing'
    project.progress = 0
    project.costCredits = creditsNeeded
    project.updatedAt = new Date().toISOString()
    projects.set(id, project)

    // Prepare pipeline options
    const pipelineOptions: PipelineOptions = {
      topic: project.topic,
      style: project.settings.style,
      duration: project.settings.duration,
      voice: project.settings.voice,
      voiceGender: project.settings.voiceGender,
      aspectRatio: project.settings.aspectRatio,
    }

    // Start pipeline (async - don't await)
    // In production, this would be queued with BullMQ
    startPipeline(id, pipelineOptions, (state) => {
      // Update project with pipeline state
      const p = projects.get(id)
      if (p) {
        p.progress = state.progress
        p.status = state.status === 'completed' ? 'completed' : 
                   state.status === 'failed' ? 'failed' : 'processing'
        
        if (state.script) p.script = state.script
        if (state.scenes) p.scenes = state.scenes
        if (state.outputUrl) p.outputUrl = state.outputUrl
        if (state.error) {
          console.error('Pipeline error:', state.error)
        }
        
        p.updatedAt = new Date().toISOString()
        projects.set(id, p)

        // Store jobs
        jobs.set(id, state.jobs.map(j => ({
          ...j,
          startedAt: j.startedAt?.toISOString(),
          completedAt: j.completedAt?.toISOString(),
        })))
      }
    }).catch((error) => {
      // Handle pipeline failure
      const p = projects.get(id)
      if (p) {
        p.status = 'failed'
        p.updatedAt = new Date().toISOString()
        projects.set(id, p)
      }
      console.error('Pipeline failed:', error)
    })

    return successResponse({
      message: 'Video generation started',
      projectId: id,
      creditsUsed: creditsNeeded,
      estimatedCost: costEstimate,
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
    const { id } = params
    
    // Get user ID from auth (placeholder)
    const userId = 'user-1' // TODO: Get from auth session

    const project = projects.get(id)

    if (!project) {
      return errorResponse('Project not found', 404)
    }

    // Verify ownership
    if (project.userId !== userId) {
      return errorResponse('Access denied', 403)
    }

    // Get jobs for this project
    const projectJobs = jobs.get(id) || []

    return successResponse({
      status: project.status,
      progress: project.progress,
      jobs: projectJobs,
      outputUrl: project.outputUrl,
      script: project.script,
      scenes: project.scenes,
    })
  } catch (error) {
    console.error('Error getting generation status:', error)
    return errorResponse('Failed to get generation status', 500)
  }
}
