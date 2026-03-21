'use client'

/**
 * React Hooks for API Data Fetching
 * Uses SWR pattern for caching and revalidation
 */

import { useState, useEffect, useCallback } from 'react'
import {
  projectsApi,
  userApi,
  jobsApi,
  socialApi,
  authApi,
  type Project,
  type User,
  type Job,
  type SocialAccount,
  type CreditsInfo,
  type AuthUser,
} from './api-client'

// Generic hook state
interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

// ============================================
// AUTH HOOKS
// ============================================

export function useCurrentUser(): UseApiState<AuthUser> {
  const [data, setData] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    const result = await authApi.me()
    
    if (result.success && result.data) {
      setData(result.data)
    } else {
      setError(result.error || 'Failed to fetch user')
    }
    
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// ============================================
// USER HOOKS
// ============================================

export function useUser(): UseApiState<User> {
  const [data, setData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    const result = await userApi.get()
    
    if (result.success && result.data) {
      setData(result.data)
    } else {
      setError(result.error || 'Failed to fetch user')
    }
    
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

export function useCredits(): UseApiState<CreditsInfo> {
  const [data, setData] = useState<CreditsInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    const result = await userApi.getCredits()
    
    if (result.success && result.data) {
      setData(result.data)
    } else {
      setError(result.error || 'Failed to fetch credits')
    }
    
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// ============================================
// PROJECTS HOOKS
// ============================================

interface UseProjectsOptions {
  page?: number
  limit?: number
  status?: string
}

interface ProjectsData {
  projects: Project[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function useProjects(options?: UseProjectsOptions): UseApiState<ProjectsData> {
  const [data, setData] = useState<ProjectsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    const result = await projectsApi.list(options)
    
    if (result.success && result.data) {
      setData(result.data)
    } else {
      setError(result.error || 'Failed to fetch projects')
    }
    
    setLoading(false)
  }, [options?.page, options?.limit, options?.status])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

export function useProject(id: string | null): UseApiState<Project> {
  const [data, setData] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!id) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    setError(null)
    
    const result = await projectsApi.get(id)
    
    if (result.success && result.data) {
      setData(result.data)
    } else {
      setError(result.error || 'Failed to fetch project')
    }
    
    setLoading(false)
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

interface GenerationStatus {
  status: string
  progress: number
  currentStep: string
  jobs: Job[]
}

export function useProjectGeneration(
  projectId: string | null,
  pollInterval?: number
): UseApiState<GenerationStatus> & { isPolling: boolean } {
  const [data, setData] = useState<GenerationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(false)

  const fetchData = useCallback(async () => {
    if (!projectId) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    setError(null)
    
    const result = await projectsApi.getGenerationStatus(projectId)
    
    if (result.success && result.data) {
      setData(result.data)
      
      // Check if we should continue polling
      const shouldPoll = result.data.status === 'processing'
      setIsPolling(shouldPoll)
    } else {
      setError(result.error || 'Failed to fetch generation status')
      setIsPolling(false)
    }
    
    setLoading(false)
  }, [projectId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Polling effect
  useEffect(() => {
    if (!isPolling || !pollInterval) return

    const interval = setInterval(fetchData, pollInterval)
    return () => clearInterval(interval)
  }, [isPolling, pollInterval, fetchData])

  return { data, loading, error, refetch: fetchData, isPolling }
}

// ============================================
// JOBS HOOKS
// ============================================

interface UseJobsOptions {
  status?: string
  limit?: number
}

export function useJobs(options?: UseJobsOptions): UseApiState<{ jobs: Job[] }> {
  const [data, setData] = useState<{ jobs: Job[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    const result = await jobsApi.list(options)
    
    if (result.success && result.data) {
      setData(result.data)
    } else {
      setError(result.error || 'Failed to fetch jobs')
    }
    
    setLoading(false)
  }, [options?.status, options?.limit])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

export function useJob(id: string | null): UseApiState<Job> {
  const [data, setData] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!id) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    setError(null)
    
    const result = await jobsApi.get(id)
    
    if (result.success && result.data) {
      setData(result.data)
    } else {
      setError(result.error || 'Failed to fetch job')
    }
    
    setLoading(false)
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// ============================================
// SOCIAL HOOKS
// ============================================

export function useSocialAccounts(): UseApiState<{ accounts: SocialAccount[] }> {
  const [data, setData] = useState<{ accounts: SocialAccount[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    const result = await socialApi.list()
    
    if (result.success && result.data) {
      setData(result.data)
    } else {
      setError(result.error || 'Failed to fetch social accounts')
    }
    
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// ============================================
// MUTATION HOOKS
// ============================================

interface UseMutationState<T> {
  mutate: (...args: unknown[]) => Promise<{ success: boolean; data?: T; error?: string }>
  loading: boolean
  error: string | null
  data: T | null
  reset: () => void
}

export function useCreateProject(): UseMutationState<Project> {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<Project | null>(null)

  const mutate = useCallback(async (projectData: Parameters<typeof projectsApi.create>[0]) => {
    setLoading(true)
    setError(null)
    
    const result = await projectsApi.create(projectData)
    
    if (result.success && result.data) {
      setData(result.data)
    } else {
      setError(result.error || 'Failed to create project')
    }
    
    setLoading(false)
    return result
  }, [])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return { mutate: mutate as UseMutationState<Project>['mutate'], loading, error, data, reset }
}

export function useDeleteProject(): UseMutationState<{ message: string }> {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<{ message: string } | null>(null)

  const mutate = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    const result = await projectsApi.delete(id)
    
    if (result.success && result.data) {
      setData(result.data)
    } else {
      setError(result.error || 'Failed to delete project')
    }
    
    setLoading(false)
    return result
  }, [])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return { mutate: mutate as UseMutationState<{ message: string }>['mutate'], loading, error, data, reset }
}

export function useStartGeneration(): UseMutationState<{ projectId: string; status: string; jobs: Job[] }> {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<{ projectId: string; status: string; jobs: Job[] } | null>(null)

  const mutate = useCallback(async (projectId: string, priority?: 'low' | 'normal' | 'high') => {
    setLoading(true)
    setError(null)
    
    const result = await projectsApi.startGeneration(projectId, priority)
    
    if (result.success && result.data) {
      setData(result.data)
    } else {
      setError(result.error || 'Failed to start generation')
    }
    
    setLoading(false)
    return result
  }, [])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return { mutate: mutate as UseMutationState<{ projectId: string; status: string; jobs: Job[] }>['mutate'], loading, error, data, reset }
}
