/**
 * GET /api/health
 * Health check endpoint for monitoring
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  validateConfig, 
  hasAIServicesConfigured, 
  hasSupabaseConfigured,
  hasStorageConfigured 
} from '@/lib/config'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  uptime: number
  services: {
    database: ServiceStatus
    ai: ServiceStatus
    storage: ServiceStatus
    queue: ServiceStatus
  }
  config: {
    valid: boolean
    missing: string[]
  }
}

interface ServiceStatus {
  status: 'up' | 'down' | 'not_configured'
  latency?: number
  error?: string
}

const startTime = Date.now()

export async function GET(request: NextRequest): Promise<NextResponse<HealthStatus>> {
  const timestamp = new Date().toISOString()
  const uptime = Math.floor((Date.now() - startTime) / 1000)
  const version = process.env.npm_package_version || '1.0.0'

  // Check configuration
  const configStatus = validateConfig()

  // Check services
  const services = {
    database: await checkDatabase(),
    ai: checkAIServices(),
    storage: checkStorage(),
    queue: checkQueue(),
  }

  // Determine overall status
  const hasDownService = Object.values(services).some(s => s.status === 'down')
  const hasNotConfigured = Object.values(services).some(s => s.status === 'not_configured')
  
  let status: HealthStatus['status'] = 'healthy'
  if (hasDownService) {
    status = 'unhealthy'
  } else if (hasNotConfigured || !configStatus.valid) {
    status = 'degraded'
  }

  const health: HealthStatus = {
    status,
    timestamp,
    version,
    uptime,
    services,
    config: configStatus,
  }

  const httpStatus = status === 'unhealthy' ? 503 : 200

  return NextResponse.json(health, { status: httpStatus })
}

async function checkDatabase(): Promise<ServiceStatus> {
  if (!hasSupabaseConfigured()) {
    return { status: 'not_configured' }
  }

  try {
    const start = Date.now()
    
    // Import dynamically to avoid issues if not configured
    const { getSupabaseServerClient } = await import('@/lib/supabase')
    const supabase = getSupabaseServerClient()
    
    // Simple health check query
    const { error } = await supabase.from('users').select('id').limit(1)
    
    const latency = Date.now() - start

    if (error && error.code !== 'PGRST116') {
      return { status: 'down', error: error.message, latency }
    }

    return { status: 'up', latency }
  } catch (error) {
    return { 
      status: 'down', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

function checkAIServices(): ServiceStatus {
  if (!hasAIServicesConfigured()) {
    return { status: 'not_configured' }
  }

  // For AI services, we just check if they're configured
  // Actual health checks would require API calls
  return { status: 'up' }
}

function checkStorage(): ServiceStatus {
  if (!hasStorageConfigured()) {
    return { status: 'not_configured' }
  }

  return { status: 'up' }
}

function checkQueue(): ServiceStatus {
  const hasRedis = !!(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  )

  if (!hasRedis) {
    return { status: 'not_configured' }
  }

  return { status: 'up' }
}
