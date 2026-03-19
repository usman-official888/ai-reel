import { Project, User, SocialAccount, Job } from '@/types'

export const mockUser: User = {
  id: 'user-1',
  email: 'demo@videoforge.ai',
  fullName: 'Demo User',
  avatarUrl: undefined,
  subscriptionTier: 'pro',
  creditsBalance: 87,
  createdAt: '2024-01-15T10:00:00Z',
}

export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    title: 'The History of Ancient Pyramids',
    topic: 'Create a documentary-style video about the construction and mysteries of the Egyptian pyramids',
    status: 'completed',
    progress: 100,
    thumbnailUrl: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=400&h=225&fit=crop',
    outputUrl: 'https://example.com/video-1.mp4',
    durationSeconds: 180,
    costCredits: 1,
    createdAt: '2024-03-15T14:30:00Z',
    updatedAt: '2024-03-15T14:45:00Z',
  },
  {
    id: 'proj-2',
    title: 'Top 10 AI Tools in 2024',
    topic: 'Review the most useful AI tools for productivity and content creation',
    status: 'processing',
    progress: 65,
    thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=225&fit=crop',
    costCredits: 1,
    createdAt: '2024-03-18T09:00:00Z',
    updatedAt: '2024-03-18T09:15:00Z',
    jobs: [
      { id: 'job-1', projectId: 'proj-2', type: 'script', status: 'completed', progress: 100, createdAt: '2024-03-18T09:00:00Z', completedAt: '2024-03-18T09:01:00Z' },
      { id: 'job-2', projectId: 'proj-2', type: 'image', status: 'completed', progress: 100, createdAt: '2024-03-18T09:01:00Z', completedAt: '2024-03-18T09:03:00Z' },
      { id: 'job-3', projectId: 'proj-2', type: 'video', status: 'running', progress: 60, createdAt: '2024-03-18T09:03:00Z' },
      { id: 'job-4', projectId: 'proj-2', type: 'voice', status: 'queued', progress: 0, createdAt: '2024-03-18T09:03:00Z' },
      { id: 'job-5', projectId: 'proj-2', type: 'assembly', status: 'queued', progress: 0, createdAt: '2024-03-18T09:03:00Z' },
    ],
  },
  {
    id: 'proj-3',
    title: 'How Bitcoin Mining Works',
    topic: 'Explain cryptocurrency mining for beginners with visual examples',
    status: 'completed',
    progress: 100,
    thumbnailUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&h=225&fit=crop',
    outputUrl: 'https://example.com/video-3.mp4',
    durationSeconds: 240,
    costCredits: 1,
    createdAt: '2024-03-10T16:00:00Z',
    updatedAt: '2024-03-10T16:20:00Z',
  },
  {
    id: 'proj-4',
    title: 'Morning Yoga Routine',
    topic: 'Create a relaxing 10-minute morning yoga routine with calm narration',
    status: 'failed',
    progress: 45,
    thumbnailUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=225&fit=crop',
    costCredits: 0,
    createdAt: '2024-03-08T07:30:00Z',
    updatedAt: '2024-03-08T07:40:00Z',
    jobs: [
      { id: 'job-6', projectId: 'proj-4', type: 'script', status: 'completed', progress: 100, createdAt: '2024-03-08T07:30:00Z', completedAt: '2024-03-08T07:31:00Z' },
      { id: 'job-7', projectId: 'proj-4', type: 'image', status: 'failed', progress: 50, error: 'Image generation failed: Content policy violation', createdAt: '2024-03-08T07:31:00Z' },
    ],
  },
  {
    id: 'proj-5',
    title: 'Space Exploration Documentary',
    topic: 'The future of human space exploration and Mars colonization',
    status: 'draft',
    progress: 0,
    costCredits: 0,
    createdAt: '2024-03-17T11:00:00Z',
    updatedAt: '2024-03-17T11:00:00Z',
  },
]

export const mockSocialAccounts: SocialAccount[] = [
  {
    id: 'social-1',
    platform: 'youtube',
    accountHandle: '@VideoForgeDemo',
    isActive: true,
    connectedAt: '2024-02-01T10:00:00Z',
  },
  {
    id: 'social-2',
    platform: 'tiktok',
    accountHandle: '@videoforge_ai',
    isActive: true,
    connectedAt: '2024-02-15T14:00:00Z',
  },
  {
    id: 'social-3',
    platform: 'instagram',
    accountHandle: '@videoforge.ai',
    isActive: false,
    connectedAt: '2024-03-01T09:00:00Z',
  },
]

export const mockStats = {
  totalVideos: 23,
  totalViews: 45200,
  creditsUsed: 23,
  avgProcessingTime: '2.5 min',
}

export const recentActivity = [
  { id: 1, type: 'video_completed', message: 'Video "The History of Ancient Pyramids" completed', time: '2 hours ago' },
  { id: 2, type: 'video_published', message: 'Published to YouTube: "How Bitcoin Mining Works"', time: '5 hours ago' },
  { id: 3, type: 'credits_added', message: 'Added 50 credits via Stripe', time: '1 day ago' },
  { id: 4, type: 'account_connected', message: 'Connected TikTok account', time: '3 days ago' },
]
