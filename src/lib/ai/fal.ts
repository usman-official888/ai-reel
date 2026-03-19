/**
 * Fal.ai Integration
 * Used for image generation (Flux Schnell) and video generation (LTX Video)
 * 
 * API Docs: https://fal.ai/docs
 * Image Model: fal-ai/flux/schnell (~$0.003/image)
 * Video Model: fal-ai/ltx-video (~$0.02/5s clip)
 */

const FAL_API_URL = 'https://queue.fal.run'

export interface ImageGenerationOptions {
  prompt: string
  negativePrompt?: string
  width?: number
  height?: number
  numImages?: number
}

export interface ImageGenerationResult {
  images: Array<{
    url: string
    width: number
    height: number
    contentType: string
  }>
  seed: number
  prompt: string
}

export interface VideoGenerationOptions {
  imageUrl: string
  prompt?: string
  duration?: number // 5 or 10 seconds
  fps?: number
}

export interface VideoGenerationResult {
  video: {
    url: string
    contentType: string
    duration: number
  }
}

// Aspect ratio presets
export const ASPECT_RATIOS = {
  '16:9': { width: 1280, height: 720 },   // YouTube, landscape
  '9:16': { width: 720, height: 1280 },   // TikTok, portrait
  '1:1': { width: 1024, height: 1024 },   // Instagram square
  '4:3': { width: 1024, height: 768 },    // Classic
}

/**
 * Generate an image using Flux Schnell
 */
export async function generateImage(
  options: ImageGenerationOptions
): Promise<ImageGenerationResult> {
  const apiKey = process.env.FAL_API_KEY
  
  if (!apiKey) {
    throw new Error('FAL_API_KEY is not configured')
  }

  // Default to 16:9 for video-friendly images
  const width = options.width || 1280
  const height = options.height || 720

  const response = await fetch(`${FAL_API_URL}/fal-ai/flux/schnell`, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: options.prompt,
      negative_prompt: options.negativePrompt || 'blurry, low quality, distorted, deformed',
      image_size: { width, height },
      num_images: options.numImages || 1,
      enable_safety_checker: true,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Fal.ai image generation error: ${error}`)
  }

  return await response.json()
}

/**
 * Generate a video from an image using LTX Video
 */
export async function generateVideo(
  options: VideoGenerationOptions
): Promise<VideoGenerationResult> {
  const apiKey = process.env.FAL_API_KEY
  
  if (!apiKey) {
    throw new Error('FAL_API_KEY is not configured')
  }

  // Submit the video generation request
  const submitResponse = await fetch(`${FAL_API_URL}/fal-ai/ltx-video/image-to-video`, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_url: options.imageUrl,
      prompt: options.prompt || 'smooth camera motion, cinematic, high quality',
      num_frames: (options.duration || 5) * (options.fps || 24),
      fps: options.fps || 24,
    }),
  })

  if (!submitResponse.ok) {
    const error = await submitResponse.text()
    throw new Error(`Fal.ai video generation error: ${error}`)
  }

  return await submitResponse.json()
}

/**
 * Queue-based generation for longer operations
 * Returns a request ID that can be polled for status
 */
export async function queueVideoGeneration(
  options: VideoGenerationOptions
): Promise<{ requestId: string }> {
  const apiKey = process.env.FAL_API_KEY
  
  if (!apiKey) {
    throw new Error('FAL_API_KEY is not configured')
  }

  const response = await fetch(`${FAL_API_URL}/fal-ai/ltx-video/image-to-video`, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${apiKey}`,
      'Content-Type': 'application/json',
      'X-Fal-Queue-Priority': 'normal',
    },
    body: JSON.stringify({
      image_url: options.imageUrl,
      prompt: options.prompt || 'smooth camera motion, cinematic, high quality',
      num_frames: (options.duration || 5) * (options.fps || 24),
      fps: options.fps || 24,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Fal.ai queue error: ${error}`)
  }

  const data = await response.json()
  return { requestId: data.request_id }
}

/**
 * Check status of a queued request
 */
export async function checkQueueStatus(
  requestId: string,
  model: string = 'fal-ai/ltx-video/image-to-video'
): Promise<{
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  result?: VideoGenerationResult
  error?: string
  position?: number
}> {
  const apiKey = process.env.FAL_API_KEY
  
  if (!apiKey) {
    throw new Error('FAL_API_KEY is not configured')
  }

  const response = await fetch(
    `${FAL_API_URL}/${model}/requests/${requestId}/status`,
    {
      headers: {
        'Authorization': `Key ${apiKey}`,
      },
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Fal.ai status check error: ${error}`)
  }

  return await response.json()
}

/**
 * Enhance a prompt for better image generation
 */
export function enhanceImagePrompt(
  basePrompt: string,
  style: 'cinematic' | 'illustration' | 'photorealistic' | 'anime' = 'cinematic'
): string {
  const styleEnhancements: Record<string, string> = {
    cinematic: 'cinematic lighting, film grain, dramatic composition, professional photography, 8k resolution',
    illustration: 'digital illustration, vibrant colors, detailed artwork, professional illustration style',
    photorealistic: 'photorealistic, ultra detailed, professional photography, natural lighting, 8k',
    anime: 'anime style, vibrant colors, detailed anime artwork, studio ghibli inspired',
  }

  return `${basePrompt}, ${styleEnhancements[style]}`
}

// Cost calculation
export function calculateImageCost(numImages: number): number {
  return numImages * 0.003 // $0.003 per image
}

export function calculateVideoCost(durationSeconds: number): number {
  // $0.02 per 5-second clip
  return Math.ceil(durationSeconds / 5) * 0.02
}
