/**
 * Database Services Index
 * Export all database operations
 */

// Project operations
export {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  updateProjectProgress,
  getProjectsByStatus,
  type ListProjectsOptions,
  type PaginatedProjects,
} from './projects'

// Job operations
export {
  createJob,
  getProjectJobs,
  getJob,
  updateJobProgress,
  failJob,
  completeJob,
  getQueuedJobs,
  retryJob,
  createPipelineJobs,
  getPipelineStatus,
} from './jobs'

// User operations
export {
  getUser,
  getUserByEmail,
  upsertUser,
  updateUser,
  getUserCredits,
  addCredits,
  deductCredits,
  hasEnoughCredits,
  updateSubscription,
  getSubscriptionLimits,
} from './users'
