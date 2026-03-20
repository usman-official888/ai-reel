/**
 * Publications Database Service
 * Handles all publication-related database operations
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { generateId } from '../api-utils'
import type { SocialPlatform, PublicationStatus, Json } from '@/types/database'

export interface CreatePublicationData {
  projectId: string
  userId: string
  platform: SocialPlatform
  caption?: string
  hashtags?: string[]
  scheduledAt?: string | null
  metadata?: Record<string, unknown>
}

/**
 * Create a new publication record
 */
export async function createPublication(
  data: CreatePublicationData
): Promise<{
  id: string
  platform: SocialPlatform
  status: PublicationStatus
  scheduled_at: string | null
}> {
  const supabase = await createServerSupabaseClient()

  const status: PublicationStatus = data.scheduledAt ? 'scheduled' : 'pending'

  const { data: publication, error } = await supabase
    .from('publications')
    .insert({
      id: generateId('pub'),
      project_id: data.projectId,
      user_id: data.userId,
      platform: data.platform,
      status,
      caption: data.caption || null,
      hashtags: data.hashtags || [],
      scheduled_at: data.scheduledAt || null,
      metadata: (data.metadata || null) as Json,
    } as never)
    .select('id, platform, status, scheduled_at')
    .single()

  if (error) {
    throw new Error(`Failed to create publication: ${error.message}`)
  }

  return publication as {
    id: string
    platform: SocialPlatform
    status: PublicationStatus
    scheduled_at: string | null
  }
}

/**
 * Get publications for a project
 */
export async function getProjectPublications(
  projectId: string
): Promise<unknown[]> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('publications')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to get publications: ${error.message}`)
  }

  return data || []
}

/**
 * Update publication status
 */
export async function updatePublicationStatus(
  publicationId: string,
  status: PublicationStatus,
  additionalData?: {
    publishedAt?: string
    publishedUrl?: string
    errorMessage?: string
  }
): Promise<void> {
  const supabase = await createServerSupabaseClient()

  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (additionalData?.publishedAt) {
    updates.published_at = additionalData.publishedAt
  }
  if (additionalData?.publishedUrl) {
    updates.published_url = additionalData.publishedUrl
  }
  if (additionalData?.errorMessage) {
    updates.error_message = additionalData.errorMessage
  }

  const { error } = await supabase
    .from('publications')
    .update(updates as never)
    .eq('id', publicationId)

  if (error) {
    throw new Error(`Failed to update publication: ${error.message}`)
  }
}

/**
 * Update publication analytics
 */
export async function updatePublicationAnalytics(
  publicationId: string,
  analytics: {
    views?: number
    likes?: number
    comments?: number
    shares?: number
  }
): Promise<void> {
  const supabase = await createServerSupabaseClient()

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (analytics.views !== undefined) updates.views_count = analytics.views
  if (analytics.likes !== undefined) updates.likes_count = analytics.likes
  if (analytics.comments !== undefined) updates.comments_count = analytics.comments
  if (analytics.shares !== undefined) updates.shares_count = analytics.shares

  const { error } = await supabase
    .from('publications')
    .update(updates as never)
    .eq('id', publicationId)

  if (error) {
    throw new Error(`Failed to update publication analytics: ${error.message}`)
  }
}
