'use client'

import Link from 'next/link'
import { Video, Eye, Zap, Clock, Plus, ArrowRight, Loader2 } from 'lucide-react'
import { Header } from '@/components/layout'
import { Button } from '@/components/ui'
import { StatsCard, ProjectCard, RecentActivity } from '@/components/dashboard'
import { useProjects, useCredits } from '@/lib/hooks'
import { formatRelativeTime } from '@/lib/utils'

export default function DashboardPage() {
  // Fetch real data
  const { data: projectsData, loading: projectsLoading, error: projectsError } = useProjects({ limit: 10 })
  const { data: creditsData, loading: creditsLoading } = useCredits()

  // Get recent projects (last 4)
  const recentProjects = projectsData?.projects
    ?.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 4) || []

  // Get processing projects
  const processingProjects = projectsData?.projects?.filter(p => p.status === 'processing') || []

  // Calculate stats
  const totalVideos = projectsData?.pagination?.total || 0
  const completedVideos = projectsData?.projects?.filter(p => p.status === 'completed' || p.status === 'published').length || 0
  const creditsUsed = creditsData?.usedThisMonth || 0
  const creditsBalance = creditsData?.balance || 0

  // Generate recent activity from projects
  const recentActivity = projectsData?.projects?.slice(0, 5).map((p, index) => {
    const typeMap: Record<string, string> = {
      completed: 'video_completed',
      processing: 'video_processing',
      published: 'video_published',
      failed: 'video_failed',
      draft: 'video_created',
    }
    const messageMap: Record<string, string> = {
      completed: `Video "${p.title}" finished processing`,
      processing: `Video "${p.title}" is being generated`,
      published: `Video "${p.title}" was published`,
      failed: `Video "${p.title}" failed to process`,
      draft: `Draft "${p.title}" was created`,
    }
    return {
      id: index,
      type: typeMap[p.status] || 'video_completed',
      message: messageMap[p.status] || `Video "${p.title}" updated`,
      time: formatRelativeTime(p.updated_at),
    }
  }) || []

  // Loading state
  if (projectsLoading && !projectsData) {
    return (
      <>
        <Header
          title="Dashboard"
          subtitle="Welcome back! Here's an overview of your video projects."
        />
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted">Loading dashboard...</p>
          </div>
        </div>
      </>
    )
  }

  // Error state
  if (projectsError) {
    return (
      <>
        <Header
          title="Dashboard"
          subtitle="Welcome back! Here's an overview of your video projects."
        />
        <div className="p-6">
          <div className="bg-error/10 border border-error/20 rounded-xl p-6 text-center">
            <p className="text-error mb-4">Failed to load dashboard: {projectsError}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Welcome back! Here's an overview of your video projects."
        actions={
          <Link href="/dashboard/projects/new">
            <Button>
              <Plus className="w-4 h-4" />
              Create Video
            </Button>
          </Link>
        }
      />

      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Videos"
            value={totalVideos}
            change={totalVideos > 0 ? { value: `${completedVideos} completed`, positive: true } : undefined}
            icon={Video}
            iconColor="text-primary"
          />
          <StatsCard
            title="Credits Balance"
            value={creditsLoading ? '...' : creditsBalance}
            icon={Zap}
            iconColor="text-accent-cyan"
          />
          <StatsCard
            title="Credits Used"
            value={creditsLoading ? '...' : creditsUsed}
            icon={Zap}
            iconColor="text-accent-orange"
          />
          <StatsCard
            title="Processing"
            value={processingProjects.length}
            icon={Clock}
            iconColor="text-accent-pink"
          />
        </div>

        {/* Processing Projects Alert */}
        {processingProjects.length > 0 && (
          <div className="mb-8 p-4 rounded-xl bg-info/10 border border-info/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-info animate-pulse" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">
                  {processingProjects.length} video{processingProjects.length > 1 ? 's' : ''} currently processing
                </h3>
                <p className="text-sm text-muted">
                  {processingProjects.map(p => `"${p.title}"`).join(', ')}
                </p>
              </div>
              <Link href="/dashboard/projects">
                <Button variant="secondary" size="sm">
                  View Progress
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Recent Projects</h2>
              <Link href="/dashboard/projects" className="text-sm text-primary hover:text-primary-light flex items-center gap-1">
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentProjects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={{
                    id: project.id,
                    title: project.title,
                    topic: project.topic,
                    thumbnailUrl: project.thumbnail_url || undefined,
                    status: project.status,
                    durationSeconds: project.duration_target || undefined,
                    progress: project.progress,
                    createdAt: project.created_at,
                    updatedAt: project.updated_at,
                    costCredits: project.cost_credits,
                  }} 
                />
              ))}
            </div>

            {recentProjects.length === 0 && (
              <div className="bg-card rounded-xl border border-border p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-card-hover mx-auto mb-4 flex items-center justify-center">
                  <Video className="w-8 h-8 text-muted" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No videos yet</h3>
                <p className="text-muted mb-6">Create your first AI-generated video in minutes</p>
                <Link href="/dashboard/projects/new">
                  <Button>
                    <Plus className="w-4 h-4" />
                    Create Your First Video
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Activity & Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/dashboard/projects/new"
                  className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Create New Video</p>
                    <p className="text-xs text-muted">Start from a topic or script</p>
                  </div>
                </Link>
                
                <Link
                  href="/dashboard/social"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-card-hover border border-transparent hover:border-border transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-card-hover flex items-center justify-center">
                    <svg className="w-5 h-5 text-muted" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Connect Social</p>
                    <p className="text-xs text-muted">Link YouTube, TikTok & more</p>
                  </div>
                </Link>

                <Link
                  href="/dashboard/billing"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-card-hover border border-transparent hover:border-border transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-card-hover flex items-center justify-center">
                    <Zap className="w-5 h-5 text-muted" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Get More Credits</p>
                    <p className="text-xs text-muted">Upgrade or buy credit packs</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <RecentActivity activities={recentActivity} />
          </div>
        </div>
      </div>
    </>
  )
}
