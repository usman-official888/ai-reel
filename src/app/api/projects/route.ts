import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  getPaginationParams,
  parseBody,
  validateRequired,
} from '@/lib/api-utils'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { listProjects, createProject } from '@/lib/db'
import type { ProjectStatus } from '@/types/database'

interface ProjectSettings {
  style: 'documentary' | 'tutorial' | 'story' | 'review' | 'explainer'
  duration: number
  voice: 'professional' | 'casual' | 'energetic' | 'calm'
  voiceGender?: 'male' | 'female'
  aspectRatio: '16:9' | '9:16' | '1:1'
}

/**
 * GET /api/projects
 * List all projects for the current user
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const { page, limit } = getPaginationParams(searchParams)
    
    // Filter params
    const status = searchParams.get('status') as ProjectStatus | null
    const search = searchParams.get('search') || undefined

    // Get projects from database
    const result = await listProjects({
      userId: user.id,
      status: status || undefined,
      search,
      page,
      limit,
    })

    return successResponse({
      projects: result.projects,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    })
  } catch (error) {
    console.error('Error listing projects:', error)
    return errorResponse('Failed to list projects', 500)
  }
}

/**
 * POST /api/projects
 * Create a new project
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse('Unauthorized', 401)
    }

    const body = await parseBody<{
      title: string
      topic: string
      settings: ProjectSettings
    }>(request)

    if (!body) {
      return errorResponse('Invalid request body')
    }

    const validationError = validateRequired(body, ['title', 'topic', 'settings'])
    if (validationError) {
      return errorResponse(validationError)
    }

    // Validate settings
    const { settings } = body
    if (!settings.style || !settings.duration || !settings.voice || !settings.aspectRatio) {
      return errorResponse('Invalid settings: missing required fields')
    }

    // Create project in database
    const project = await createProject({
      user_id: user.id,
      title: body.title,
      topic: body.topic,
      style: settings.style,
      duration_target: settings.duration,
      voice_style: settings.voice,
      voice_gender: settings.voiceGender || 'male',
      aspect_ratio: settings.aspectRatio,
    })

    return successResponse(project, 201)
  } catch (error) {
    console.error('Error creating project:', error)
    return errorResponse('Failed to create project', 500)
  }
}
