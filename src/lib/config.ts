/**
 * Environment Configuration
 * Centralized config with validation and type safety
 */

// Server-side only config (not exposed to client)
export const serverConfig = {
  // AI Providers
  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
    model: process.env.GROQ_MODEL || 'llama-3.1-70b-versatile',
  },
  fal: {
    apiKey: process.env.FAL_API_KEY || '',
  },
  fishAudio: {
    apiKey: process.env.FISH_AUDIO_API_KEY || '',
  },

  // Database
  supabase: {
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },

  // Redis / Queue
  redis: {
    url: process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
  },

  // Storage
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    bucket: process.env.AWS_S3_BUCKET || '',
  },

  // Payments
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
  nowPayments: {
    apiKey: process.env.NOWPAYMENTS_API_KEY || '',
    ipnSecret: process.env.NOWPAYMENTS_IPN_SECRET || '',
  },

  // App
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  },
}

// Client-safe config (exposed to browser)
export const clientConfig = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  },
  app: {
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
}

// Validation helper
export function validateConfig(): { valid: boolean; missing: string[] } {
  const required = [
    'GROQ_API_KEY',
    'FAL_API_KEY', 
    'FISH_AUDIO_API_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]

  const missing = required.filter((key) => !process.env[key])
  
  return {
    valid: missing.length === 0,
    missing,
  }
}

// Check if running in production
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

// Check if all AI services are configured
export function hasAIServicesConfigured(): boolean {
  return !!(
    serverConfig.groq.apiKey &&
    serverConfig.fal.apiKey &&
    serverConfig.fishAudio.apiKey
  )
}

// Check if Supabase is configured
export function hasSupabaseConfigured(): boolean {
  return !!(
    serverConfig.supabase.url &&
    serverConfig.supabase.anonKey
  )
}

// Check if storage is configured
export function hasStorageConfigured(): boolean {
  return !!(
    serverConfig.s3.accessKeyId &&
    serverConfig.s3.secretAccessKey &&
    serverConfig.s3.bucket
  )
}
