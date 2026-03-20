import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  parseBody,
} from '@/lib/api-utils'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { 
  getProject, 
  getSocialAccountByPlatform, 
  isTokenExpired,
  createPublication,
  getProjectPublications,
} from '@/lib/db'
import type { SocialPlatform } from '@/types/database'

const VALID_PLATFORMS: SocialPlatform[] = ['youtube', 'tiktok', 'instagram', 'twitter']

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/projects/[id]/publish
 * Publish a completed video to social platforms
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const body = await parseBody<{
      platforms: SocialPlatform[]
      scheduledAt?: string
      caption?: string
      hashtags?: string[]
    }>(request)

    if (!body || !body.platforms || !Array.isArray(body.platforms)) {
      return errorResponse('Missing required field: platforms (array)')
    }

    const { platforms, scheduledAt, caption, hashtags } = body

    // Validate platforms
    for (const platform of platforms) {
      if (!VALID_PLATFORMS.includes(platform)) {
        return errorResponse(`Invalid platform: ${platform}`)
      }
    }

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

    // Check if video is ready
    if (project.status !== 'completed') {
      return errorResponse('Video must be completed before publishing', 400)
    }

    if (!project.output_url) {
      return errorResponse('No video output available', 400)
    }

    // Check connected accounts for each platform
    const accountChecks = await Promise.all(
      platforms.map(async (platform) => {
        const account = await getSocialAccountByPlatform(user.id, platform)
        return {
          platform,
          connected: !!account,
          expired: account ? isTokenExpired(account.token_expires_at) : false,
          accountHandle: account?.account_handle,
        }
      })
    )

    // Check for missing or expired accounts
    const missing = accountChecks.filter((a) => !a.connected)
    const expired = accountChecks.filter((a) => a.connected && a.expired)

    if (missing.length > 0) {
      return errorResponse(
        `Not connected to: ${missing.map((m) => m.platform).join(', ')}`,
        400
      )
    }

    if (expired.length > 0) {
      return errorResponse(
        `Token expired for: ${expired.map((e) => e.platform).join(', ')}. Please reconnect.`,
        400
      )
    }

    // Create publication records
    const publications = await Promise.all(
      platforms.map(async (platform) => {
        const account = accountChecks.find((a) => a.platform === platform)
        
        const publication = await createPublication({
          projectId: id,
          userId: user.id,
          platform,
          scheduledAt: scheduledAt || null,
          caption: caption || project.title,
          hashtags: hashtags || [],
          metadata: {
            accountHandle: account?.accountHandle,
          },
        })

        return publication
      })
    )

    // TODO: In production, this would:
    // 1. Queue the actual upload to each platform using their APIs
    // 2. Update publication status as uploads complete
    // 3. Store the published video URLs

    return successResponse({
      message: scheduledAt
        ? `Scheduled to publish to ${platforms.length} platform(s)`
        : `Publishing to ${platforms.length} platform(s)`,
      publications: publications.map((p) => ({
        id: p.id,
        platform: p.platform,
        status: p.status,
        scheduledAt: p.scheduled_at,
      })),
    })
  } catch (error) {
    console.error('Error publishing:', error)
    return errorResponse('Failed to publish video', 500)
  }
}

/**
 * GET /api/projects/[id]/publish
 * Get publication status for a project
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

    // Get publications for this project
    const publications = await getProjectPublications(id) as Array<{
      id: string
      platform: string
      status: string
      scheduled_at: string | null
      published_at: string | null
      published_url: string | null
      caption: string | null
      hashtags: string[] | null
      error_message: string | null
      views_count: number
      likes_count: number
    }>

    return successResponse({
      projectId: id,
      projectStatus: project.status,
      publications: publications.map((p) => ({
        id: p.id,
        platform: p.platform,
        status: p.status,
        scheduledAt: p.scheduled_at,
        publishedAt: p.published_at,
        publishedUrl: p.published_url,
        caption: p.caption,
        hashtags: p.hashtags,
        error: p.error_message,
        views: p.views_count,
        likes: p.likes_count,
      })),
    })
  } catch (error) {
    console.error('Error getting publications:', error)
    return errorResponse('Failed to get publication status', 500)
  }
}
