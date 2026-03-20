/**
 * Projects Database Service
 * Handles all project-related database operations
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { 
  Project, 
  ProjectInsert, 
  ProjectUpdate,
  ProjectStatus 
} from '@/types/database'
import { generateId } from '../api-utils'

export interface ListProjectsOptions {
  userId: string
  status?: ProjectStatus
  search?: string
  page?: number
  limit?: number
}

export interface PaginatedProjects {
  projects: Project[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * List projects with filtering and pagination
 */
export async function listProjects(
  options: ListProjectsOptions
): Promise<PaginatedProjects> {
  const { userId, status, search, page = 1, limit = 20 } = options
  const offset = (page - 1) * limit

  const supabase = await createServerSupabaseClient()

  // Build query
  let query = supabase
    .from('projects')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,topic.ilike.%${search}%`)
  }

  // Execute with pagination
  const { data, error, count } = await query.range(offset, offset + limit - 1)

  if (error) {
    throw new Error(`Failed to list projects: ${error.message}`)
  }

  return {
    projects: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

/**
 * Get a single project by ID
 */
export async function getProject(
  projectId: string,
  userId: string
): Promise<Project | null> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    throw new Error(`Failed to get project: ${error.message}`)
  }

  return data
}

/**
 * Create a new project
 */
export async function createProject(
  data: Omit<ProjectInsert, 'id' | 'created_at' | 'updated_at'>
): Promise<Project> {
  const supabase = await createServerSupabaseClient()

  const project = {
    id: generateId('proj'),
    ...data,
    status: 'draft' as const,
    progress: 0,
    cost_credits: 0,
  }

  const { data: created, error } = await supabase
    .from('projects')
    .insert(project as never)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create project: ${error.message}`)
  }

  return created as Project
}

/**
 * Update a project
 */
export async function updateProject(
  projectId: string,
  userId: string,
  updates: ProjectUpdate
): Promise<Project> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('projects')
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq('id', projectId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update project: ${error.message}`)
  }

  return data as Project
}

/**
 * Delete a project
 */
export async function deleteProject(
  projectId: string,
  userId: string
): Promise<void> {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to delete project: ${error.message}`)
  }
}

/**
 * Update project status and progress
 */
export async function updateProjectProgress(
  projectId: string,
  status: ProjectStatus,
  progress: number,
  additionalUpdates?: Partial<ProjectUpdate>
): Promise<void> {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase
    .from('projects')
    .update({
      status,
      progress,
      ...additionalUpdates,
      updated_at: new Date().toISOString(),
    } as never)
    .eq('id', projectId)

  if (error) {
    throw new Error(`Failed to update project progress: ${error.message}`)
  }
}

/**
 * Get projects by status (for background processing)
 */
export async function getProjectsByStatus(
  status: ProjectStatus,
  limit: number = 10
): Promise<Project[]> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to get projects by status: ${error.message}`)
  }

  return data || []
}
