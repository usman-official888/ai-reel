import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  parseBody,
} from '@/lib/api-utils'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getProject, updateProject, deleteProject } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/projects/[id]
 * Get a single project by ID
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

    const project = await getProject(id, user.id)

    if (!project) {
      return errorResponse('Project not found', 404)
    }

    return successResponse(project)
  } catch (error) {
    console.error('Error getting project:', error)
    return errorResponse('Failed to get project', 500)
  }
}

/**
 * PUT /api/projects/[id]
 * Update a project
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const body = await parseBody<Record<string, unknown>>(request)

    if (!body) {
      return errorResponse('Invalid request body')
    }

    // Get authenticated user
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse('Unauthorized', 401)
    }

    // Check if project exists and belongs to user
    const existingProject = await getProject(id, user.id)
    if (!existingProject) {
      return errorResponse('Project not found', 404)
    }

    // Don't allow updating certain fields
    const { id: _, user_id: __, created_at: ___, ...updates } = body

    // Update project
    const updatedProject = await updateProject(id, user.id, updates)

    return successResponse(updatedProject)
  } catch (error) {
    console.error('Error updating project:', error)
    return errorResponse('Failed to update project', 500)
  }
}

/**
 * DELETE /api/projects/[id]
 * Delete a project
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

    // Check if project exists and belongs to user
    const project = await getProject(id, user.id)
    if (!project) {
      return errorResponse('Project not found', 404)
    }

    // Don't allow deleting while processing
    if (project.status === 'processing') {
      return errorResponse('Cannot delete a project while it is processing', 400)
    }

    // Delete project
    await deleteProject(id, user.id)

    // TODO: Also delete associated files from S3

    return successResponse({ deleted: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return errorResponse('Failed to delete project', 500)
  }
}
