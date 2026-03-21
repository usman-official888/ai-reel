/**
 * API Client Utilities
 * Centralized API calls for frontend components
 */

const API_BASE = '/api'

// Generic fetch wrapper with error handling
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    const json = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: json.error || `HTTP ${response.status}`,
      }
    }

    return {
      success: true,
      data: json.data,
    }
  } catch (error) {
    console.error('API Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

// ============================================
// AUTH API
// ============================================

export interface AuthUser {
  id: string
  email: string
  emailVerified: boolean
  createdAt: string
  profile?: {
    fullName: string | null
    avatarUrl: string | null
    subscriptionTier: string
    creditsBalance: number
    creditsUsedThisMonth: number
  }
}

export interface AuthSession {
  accessToken: string
  refreshToken: string
  expiresAt: number
  expiresIn: number
}

export const authApi = {
  async signup(email: string, password: string, fullName?: string) {
    return apiFetch<{ user: AuthUser; session: AuthSession | null; emailConfirmationRequired: boolean; message: string }>(
      '/auth/signup',
      {
        method: 'POST',
        body: JSON.stringify({ email, password, fullName }),
      }
    )
  },

  async login(email: string, password: string) {
    return apiFetch<{ user: AuthUser; session: AuthSession }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    )
  },

  async logout() {
    return apiFetch<{ message: string }>('/auth/logout', { method: 'POST' })
  },

  async me() {
    return apiFetch<AuthUser>('/auth/me')
  },

  async refresh(refreshToken: string) {
    return apiFetch<{ session: AuthSession; user: { id: string; email: string } }>(
      '/auth/refresh',
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }
    )
  },

  async forgotPassword(email: string) {
    return apiFetch<{ message: string }>(
      '/auth/forgot-password',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      }
    )
  },

  async resetPassword(password: string) {
    return apiFetch<{ message: string }>(
      '/auth/reset-password',
      {
        method: 'POST',
        body: JSON.stringify({ password }),
      }
    )
  },
}

// ============================================
// PROJECTS API
// ============================================

export interface Project {
  id: string
  user_id: string
  title: string
  topic: string
  status: 'draft' | 'processing' | 'completed' | 'failed' | 'published'
  progress: number
  style: string
  duration_target: number
  voice_style: string
  voice_gender: string
  aspect_ratio: string
  script_data: Record<string, unknown> | null
  video_url: string | null
  thumbnail_url: string | null
  cost_credits: number
  created_at: string
  updated_at: string
}

export interface CreateProjectData {
  title: string
  topic: string
  style?: string
  duration_target?: number
  voice_style?: string
  voice_gender?: string
  aspect_ratio?: string
}

export interface ProjectsListResponse {
  projects: Project[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const projectsApi = {
  async list(params?: { page?: number; limit?: number; status?: string }) {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', params.page.toString())
    if (params?.limit) query.set('limit', params.limit.toString())
    if (params?.status) query.set('status', params.status)
    
    const queryString = query.toString()
    return apiFetch<ProjectsListResponse>(`/projects${queryString ? `?${queryString}` : ''}`)
  },

  async get(id: string) {
    return apiFetch<Project>(`/projects/${id}`)
  },

  async create(data: CreateProjectData) {
    return apiFetch<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(id: string, data: Partial<CreateProjectData>) {
    return apiFetch<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async delete(id: string) {
    return apiFetch<{ message: string }>(`/projects/${id}`, {
      method: 'DELETE',
    })
  },

  async startGeneration(id: string, priority?: 'low' | 'normal' | 'high') {
    return apiFetch<{ projectId: string; status: string; jobs: Job[] }>(
      `/projects/${id}/generate`,
      {
        method: 'POST',
        body: JSON.stringify({ priority: priority || 'normal' }),
      }
    )
  },

  async getGenerationStatus(id: string) {
    return apiFetch<{ status: string; progress: number; currentStep: string; jobs: Job[] }>(
      `/projects/${id}/generate`
    )
  },

  async publish(id: string, data: { platforms: string[]; caption?: string; hashtags?: string[]; scheduledAt?: string }) {
    return apiFetch<{ publications: Publication[] }>(
      `/projects/${id}/publish`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    )
  },

  async getPublications(id: string) {
    return apiFetch<{ publications: Publication[] }>(`/projects/${id}/publish`)
  },
}

// ============================================
// JOBS API
// ============================================

export interface Job {
  id: string
  project_id: string
  user_id: string
  job_type: string
  status: 'pending' | 'queued' | 'running' | 'completed' | 'failed'
  progress: number
  error_message: string | null
  input_data: Record<string, unknown> | null
  output_data: Record<string, unknown> | null
  started_at: string | null
  completed_at: string | null
  created_at: string
}

export const jobsApi = {
  async list(params?: { status?: string; limit?: number }) {
    const query = new URLSearchParams()
    if (params?.status) query.set('status', params.status)
    if (params?.limit) query.set('limit', params.limit.toString())
    
    const queryString = query.toString()
    return apiFetch<{ jobs: Job[] }>(`/jobs${queryString ? `?${queryString}` : ''}`)
  },

  async get(id: string) {
    return apiFetch<Job>(`/jobs/${id}`)
  },

  async cancel(id: string) {
    return apiFetch<{ message: string }>(`/jobs/${id}`, {
      method: 'DELETE',
    })
  },
}

// ============================================
// USER API
// ============================================

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  subscription_tier: string
  credits_balance: number
  credits_used_this_month: number
  subscription_expires_at: string | null
  created_at: string
  updated_at: string
}

export interface CreditsInfo {
  balance: number
  usedThisMonth: number
  monthlyLimit: number
  subscriptionTier: string
}

export const userApi = {
  async get() {
    return apiFetch<User>('/user')
  },

  async update(data: { full_name?: string; avatar_url?: string }) {
    return apiFetch<User>('/user', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async getCredits() {
    return apiFetch<CreditsInfo>('/user/credits')
  },

  async addCredits(amount: number, paymentMethod: string, paymentId: string) {
    return apiFetch<{ balance: number; added: number }>(
      '/user/credits',
      {
        method: 'POST',
        body: JSON.stringify({ amount, paymentMethod, paymentId }),
      }
    )
  },
}

// ============================================
// SOCIAL API
// ============================================

export interface SocialAccount {
  id: string
  platform: string
  account_handle: string
  account_name: string | null
  profile_image_url: string | null
  is_active: boolean
  token_expires_at: string | null
  created_at: string
}

export interface Publication {
  id: string
  platform: string
  status: 'pending' | 'scheduled' | 'publishing' | 'published' | 'failed'
  caption: string | null
  hashtags: string[]
  published_url: string | null
  scheduled_at: string | null
  published_at: string | null
  views_count: number
  likes_count: number
}

export const socialApi = {
  async list() {
    return apiFetch<{ accounts: SocialAccount[] }>('/social')
  },

  async connect(platform: string, authCode: string, redirectUri?: string) {
    return apiFetch<SocialAccount>('/social', {
      method: 'POST',
      body: JSON.stringify({ platform, authCode, redirectUri }),
    })
  },

  async get(platform: string) {
    return apiFetch<SocialAccount>(`/social/${platform}`)
  },

  async refresh(platform: string) {
    return apiFetch<SocialAccount>(`/social/${platform}`, {
      method: 'PUT',
    })
  },

  async disconnect(platform: string) {
    return apiFetch<{ message: string }>(`/social/${platform}`, {
      method: 'DELETE',
    })
  },
}

// ============================================
// HEALTH API
// ============================================

export const healthApi = {
  async check() {
    return apiFetch<{ status: string; timestamp: string; services: Record<string, string> }>('/health')
  },
}
