// Project types
export type ProjectStatus = 'draft' | 'processing' | 'completed' | 'failed'

export type JobType = 'script' | 'image' | 'video' | 'voice' | 'assembly'

export type JobStatus = 'queued' | 'running' | 'completed' | 'failed'

export interface Project {
  id: string
  title: string
  topic: string
  status: ProjectStatus
  progress: number
  thumbnailUrl?: string
  outputUrl?: string
  durationSeconds?: number
  costCredits: number
  createdAt: string
  updatedAt: string
  scenes?: Scene[]
  jobs?: Job[]
}

export interface Scene {
  id: string
  order: number
  narration: string
  imagePrompt: string
  imageUrl?: string
  videoUrl?: string
  durationSeconds: number
}

export interface Job {
  id: string
  projectId: string
  type: JobType
  status: JobStatus
  progress: number
  error?: string
  createdAt: string
  completedAt?: string
}

// User types
export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'business' | 'enterprise'

export interface User {
  id: string
  email: string
  fullName: string
  avatarUrl?: string
  subscriptionTier: SubscriptionTier
  creditsBalance: number
  createdAt: string
}

// Social account types
export type SocialPlatform = 'youtube' | 'tiktok' | 'instagram' | 'twitter'

export interface SocialAccount {
  id: string
  platform: SocialPlatform
  accountHandle: string
  isActive: boolean
  connectedAt: string
}

// Publication types
export type PublicationStatus = 'scheduled' | 'publishing' | 'published' | 'failed'

export interface Publication {
  id: string
  projectId: string
  socialAccountId: string
  platform: SocialPlatform
  status: PublicationStatus
  postUrl?: string
  scheduledAt?: string
  publishedAt?: string
  analytics?: PublicationAnalytics
}

export interface PublicationAnalytics {
  views: number
  likes: number
  comments: number
  shares: number
}

// UI types
export interface NavItem {
  label: string
  href: string
  icon: string
}

export interface StepConfig {
  id: string
  title: string
  description: string
}
