/**
 * Jobs Database Service
 * Handles all job-related database operations
 */

import { getSupabaseServerClient } from '../supabase'
import { 
  Job, 
  JobInsert, 
  JobUpdate,
  JobType,
  JobStatus 
} from '@/types/database'
import { generateId } from '../api-utils'

/**
 * Create a new job
 */
export async function createJob(
  data: Omit<JobInsert, 'id' | 'created_at' | 'updated_at'>
): Promise<Job> {
  const supabase = getSupabaseServerClient()

  const job: JobInsert = {
    id: generateId('job'),
    ...data,
    status: 'queued',
    progress: 0,
    retry_count: 0,
    priority: data.priority || 0,
  }

  const { data: created, error } = await supabase
    .from('jobs')
    .insert(job)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create job: ${error.message}`)
  }

  return created
}

/**
 * Get jobs for a project
 */
export async function getProjectJobs(projectId: string): Promise<Job[]> {
  const supabase = getSupabaseServerClient()

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to get jobs: ${error.message}`)
  }

  return data || []
}

/**
 * Get a single job by ID
 */
export async function getJob(jobId: string): Promise<Job | null> {
  const supabase = getSupabaseServerClient()

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to get job: ${error.message}`)
  }

  return data
}

/**
 * Update job status and progress
 */
export async function updateJobProgress(
  jobId: string,
  status: JobStatus,
  progress: number,
  additionalUpdates?: Partial<JobUpdate>
): Promise<void> {
  const supabase = getSupabaseServerClient()

  const updates: JobUpdate = {
    status,
    progress,
    ...additionalUpdates,
    updated_at: new Date().toISOString(),
  }

  // Set timestamps based on status
  if (status === 'running' && !additionalUpdates?.started_at) {
    updates.started_at = new Date().toISOString()
  }
  if (status === 'completed' || status === 'failed') {
    updates.completed_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('jobs')
    .update(updates)
    .eq('id', jobId)

  if (error) {
    throw new Error(`Failed to update job: ${error.message}`)
  }
}

/**
 * Mark job as failed
 */
export async function failJob(
  jobId: string,
  errorMessage: string
): Promise<void> {
  await updateJobProgress(jobId, 'failed', 0, {
    error_message: errorMessage,
  })
}

/**
 * Mark job as completed with output
 */
export async function completeJob(
  jobId: string,
  outputData: Record<string, unknown>
): Promise<void> {
  await updateJobProgress(jobId, 'completed', 100, {
    output_data: outputData,
  })
}

/**
 * Get queued jobs for processing
 */
export async function getQueuedJobs(
  jobType?: JobType,
  limit: number = 10
): Promise<Job[]> {
  const supabase = getSupabaseServerClient()

  let query = supabase
    .from('jobs')
    .select('*')
    .eq('status', 'queued')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(limit)

  if (jobType) {
    query = query.eq('job_type', jobType)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to get queued jobs: ${error.message}`)
  }

  return data || []
}

/**
 * Increment retry count and optionally requeue
 */
export async function retryJob(
  jobId: string,
  maxRetries: number = 3
): Promise<boolean> {
  const supabase = getSupabaseServerClient()

  // Get current retry count
  const job = await getJob(jobId)
  if (!job) {
    return false
  }

  if (job.retry_count >= maxRetries) {
    await failJob(jobId, `Max retries (${maxRetries}) exceeded`)
    return false
  }

  // Increment retry count and requeue
  const { error } = await supabase
    .from('jobs')
    .update({
      status: 'queued',
      retry_count: job.retry_count + 1,
      error_message: null,
      started_at: null,
      completed_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId)

  if (error) {
    throw new Error(`Failed to retry job: ${error.message}`)
  }

  return true
}

/**
 * Create all jobs for a video generation pipeline
 */
export async function createPipelineJobs(
  projectId: string
): Promise<Job[]> {
  const jobTypes: JobType[] = ['script', 'image', 'video', 'voice', 'assembly']
  
  const jobs: Job[] = []
  
  for (let i = 0; i < jobTypes.length; i++) {
    const job = await createJob({
      project_id: projectId,
      job_type: jobTypes[i],
      priority: jobTypes.length - i, // Higher priority for earlier jobs
    })
    jobs.push(job)
  }

  return jobs
}

/**
 * Get pipeline status summary
 */
export async function getPipelineStatus(
  projectId: string
): Promise<{
  total: number
  completed: number
  running: number
  failed: number
  progress: number
}> {
  const jobs = await getProjectJobs(projectId)
  
  const total = jobs.length
  const completed = jobs.filter(j => j.status === 'completed').length
  const running = jobs.filter(j => j.status === 'running').length
  const failed = jobs.filter(j => j.status === 'failed').length
  
  // Calculate overall progress
  const totalProgress = jobs.reduce((sum, job) => sum + job.progress, 0)
  const progress = total > 0 ? Math.round(totalProgress / total) : 0

  return { total, completed, running, failed, progress }
}
