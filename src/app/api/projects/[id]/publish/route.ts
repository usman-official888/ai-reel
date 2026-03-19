import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  parseBody,
  generateId,
} from '@/lib/api-utils'

// Shared stores (would be database in production)
const projects = new Map<string, Project>()
const publications = new Map<string, Publication>()

interface Project {
  id: string
  userId: string
  title: string
  topic: string
  status: 'draft' | 'processing' | 'completed' | 'failed'
  outputUrl?: string
  [key: string]: unknown
}

interface Publication {
  id: string
  projectId: string
  platform: 'youtube' | 'tiktok' | 'instagram' | 'twitter'
  status: 'pending' | 'uploading' | 'published' | 'failed'
  title: string
  description: string
  hashtags: string[]
  scheduledAt?: string
  publishedAt?: string
  platformPostId?: string
  platformPostUrl?: string
  error?: string
  createdAt: string
}

interface RouteParams {
  params: { id: string }
}

interface PublishRequest {
  platform: 'youtube' | 'tiktok' | 'instagram' | 'twitter'
  title: string
  description: string
  hashtags?: string[]
  scheduledAt?: string // ISO date string for scheduled publishing
}

/**
 * POST /api/projects/[id]/publish
 * Publish a completed video to a social platform
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params
    const body = await parseBody<PublishRequest>(request)

    if (!body) {
      return errorResponse('Invalid request body')
    }

    const { platform, title, description, hashtags = [], scheduledAt } = body

    if (!platform || !title) {
      return errorResponse('Missing required fields: platform, title')
    }

    // Validate platform
    const validPlatforms = ['youtube', 'tiktok', 'instagram', 'twitter']
    if (!validPlatforms.includes(platform)) {
      return errorResponse(`Invalid platform. Must be one of: ${validPlatforms.join(', ')}`)
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

    // Check if project is completed
    if (project.status !== 'completed') {
      return errorResponse('Project must be completed before publishing', 400)
    }

    // Check if video output exists
    if (!project.outputUrl) {
      return errorResponse('No video output available', 400)
    }

    // TODO: Check if user has connected this social platform
    // const socialAccount = await getSocialAccount(userId, platform)
    // if (!socialAccount) {
    //   return errorResponse(`${platform} account not connected`, 400)
    // }

    // Create publication record
    const publication: Publication = {
      id: generateId('pub'),
      projectId: id,
      platform,
      status: scheduledAt ? 'pending' : 'uploading',
      title,
      description,
      hashtags,
      scheduledAt,
      createdAt: new Date().toISOString(),
    }

    publications.set(publication.id, publication)

    // If not scheduled, start upload immediately
    if (!scheduledAt) {
      // In production, this would queue the upload job
      publishToSocialPlatform(publication, project.outputUrl!)
        .then((result) => {
          publication.status = 'published'
          publication.publishedAt = new Date().toISOString()
          publication.platformPostId = result.postId
          publication.platformPostUrl = result.postUrl
          publications.set(publication.id, publication)
        })
        .catch((error) => {
          publication.status = 'failed'
          publication.error = error.message
          publications.set(publication.id, publication)
        })
    }

    return successResponse({
      publication,
      message: scheduledAt 
        ? `Video scheduled for publishing at ${scheduledAt}` 
        : 'Video upload started',
    }, 201)
  } catch (error) {
    console.error('Error publishing project:', error)
    return errorResponse('Failed to publish project', 500)
  }
}

/**
 * GET /api/projects/[id]/publish
 * Get all publications for a project
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

    // Get all publications for this project
    const projectPublications = Array.from(publications.values())
      .filter((p) => p.projectId === id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return successResponse({ publications: projectPublications })
  } catch (error) {
    console.error('Error getting publications:', error)
    return errorResponse('Failed to get publications', 500)
  }
}

/**
 * Publish video to social platform (placeholder implementation)
 */
async function publishToSocialPlatform(
  publication: Publication,
  videoUrl: string
): Promise<{ postId: string; postUrl: string }> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 3000))

  // In production, this would call the respective platform APIs:
  // - YouTube: google-api-nodejs-client
  // - TikTok: TikTok for Developers API
  // - Instagram: Instagram Graph API (via Facebook)
  // - Twitter/X: Twitter API v2

  const platformUrls: Record<string, string> = {
    youtube: 'https://youtube.com/watch?v=',
    tiktok: 'https://tiktok.com/@user/video/',
    instagram: 'https://instagram.com/reel/',
    twitter: 'https://twitter.com/user/status/',
  }

  const postId = generateId('')
  const postUrl = `${platformUrls[publication.platform]}${postId}`

  return { postId, postUrl }
}
