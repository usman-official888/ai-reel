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
  getUserJobs,
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

// Social account operations
export {
  getUserSocialAccounts,
  getSocialAccountByPlatform,
  upsertSocialAccount,
  deleteSocialAccount,
  refreshSocialAccountTokens,
  isTokenExpired,
} from './social'

// Transaction operations
export {
  createTransaction,
  getUserTransactions,
  updateTransactionStatus,
} from './transactions'

// Publication operations
export {
  createPublication,
  getProjectPublications,
  updatePublicationStatus,
  updatePublicationAnalytics,
} from './publications'
