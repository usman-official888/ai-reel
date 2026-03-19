import { NextResponse } from 'next/server'

// Standard API response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Success response helper
export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    { success: true, data },
    { status }
  )
}

// Error response helper
export function errorResponse(
  error: string,
  status = 400
): NextResponse<ApiResponse> {
  return NextResponse.json(
    { success: false, error },
    { status }
  )
}

// Pagination helper
export interface PaginationParams {
  page: number
  limit: number
  offset: number
}

export function getPaginationParams(
  searchParams: URLSearchParams
): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)))
  const offset = (page - 1) * limit
  
  return { page, limit, offset }
}

// Validate required fields
export function validateRequired(
  body: Record<string, unknown>,
  fields: string[]
): string | null {
  for (const field of fields) {
    if (!body[field]) {
      return `Missing required field: ${field}`
    }
  }
  return null
}

// Parse JSON body safely
export async function parseBody<T>(request: Request): Promise<T | null> {
  try {
    return await request.json()
  } catch {
    return null
  }
}

// Generate unique IDs
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`
}

// Estimate video generation cost in credits
export function estimateCredits(
  durationSeconds: number,
  sceneCount: number
): number {
  // Base cost: 1 credit per minute, minimum 1 credit
  const baseCost = Math.ceil(durationSeconds / 60)
  // Additional cost for more scenes (0.1 credits per scene over 5)
  const sceneCost = Math.max(0, (sceneCount - 5) * 0.1)
  return Math.ceil(baseCost + sceneCost)
}
