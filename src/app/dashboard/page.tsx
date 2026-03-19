import Link from 'next/link'
import { Video, Eye, Zap, Clock, Plus, ArrowRight } from 'lucide-react'
import { Header } from '@/components/layout'
import { Button } from '@/components/ui'
import { StatsCard, ProjectCard, RecentActivity } from '@/components/dashboard'
import { mockProjects, mockStats, recentActivity } from '@/data/mock'

export default function DashboardPage() {
  // Get recent projects (last 4)
  const recentProjects = mockProjects
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4)

  // Get processing projects
  const processingProjects = mockProjects.filter(p => p.status === 'processing')

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
            value={mockStats.totalVideos}
            change={{ value: '+12%', positive: true }}
            icon={Video}
            iconColor="text-primary"
          />
          <StatsCard
            title="Total Views"
            value={mockStats.totalViews.toLocaleString()}
            change={{ value: '+28%', positive: true }}
            icon={Eye}
            iconColor="text-accent-cyan"
          />
          <StatsCard
            title="Credits Used"
            value={mockStats.creditsUsed}
            icon={Zap}
            iconColor="text-accent-orange"
          />
          <StatsCard
            title="Avg. Processing"
            value={mockStats.avgProcessingTime}
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
                <ProjectCard key={project.id} project={project} />
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
