import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  parseBody,
} from '@/lib/api-utils'

// Import the shared projects store (in real app, this would be database calls)
// For now, we'll define a simple in-memory store
const projects = new Map<string, Project>()

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

interface RouteParams {
  params: { id: string }
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
    const { id } = params
    const body = await parseBody<Partial<Project>>(request)

    if (!body) {
      return errorResponse('Invalid request body')
    }

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

    // Don't allow updating certain fields
    const { id: _, userId: __, createdAt: ___, ...updates } = body

    // Update project
    const updatedProject: Project = {
      ...project,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    projects.set(id, updatedProject)

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

    // Don't allow deleting while processing
    if (project.status === 'processing') {
      return errorResponse('Cannot delete a project while it is processing', 400)
    }

    // Delete project
    projects.delete(id)

    // TODO: Also delete associated files from S3

    return successResponse({ deleted: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return errorResponse('Failed to delete project', 500)
  }
}
