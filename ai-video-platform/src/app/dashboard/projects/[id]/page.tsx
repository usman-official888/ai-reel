'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Download, 
  Share2, 
  MoreVertical,
  Clock,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2,
  Youtube,
  Instagram,
  Twitter,
  Copy,
  ExternalLink,
  RefreshCw,
  Trash2
} from 'lucide-react'
import { Header } from '@/components/layout'
import { Button, Badge, Progress, Card } from '@/components/ui'
import { mockProjects } from '@/data/mock'
import { cn } from '@/lib/utils'
import { formatDate, formatDuration, getStatusColor } from '@/lib/utils'
import { JobType, JobStatus } from '@/types'

// Mock scenes data
const mockScenes = [
  { id: 1, narration: 'Welcome to our exploration of the ancient Egyptian pyramids...', imageUrl: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=200&h=112&fit=crop', duration: 8 },
  { id: 2, narration: 'The Great Pyramid of Giza stands as a testament to human ingenuity...', imageUrl: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=200&h=112&fit=crop', duration: 10 },
  { id: 3, narration: 'Theories about the construction methods continue to fascinate historians...', imageUrl: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=200&h=112&fit=crop', duration: 12 },
  { id: 4, narration: 'The precision of the structures remains remarkable even today...', imageUrl: 'https://images.unsplash.com/photo-1553913861-c66fea7f3184?w=200&h=112&fit=crop', duration: 10 },
  { id: 5, narration: 'Inside the pyramids, intricate passages and chambers await discovery...', imageUrl: 'https://images.unsplash.com/photo-1562679299-266ab7fd9101?w=200&h=112&fit=crop', duration: 8 },
  { id: 6, narration: 'Thank you for joining us on this journey through history!', imageUrl: 'https://images.unsplash.com/photo-1604873175903-e1e607dc5c00?w=200&h=112&fit=crop', duration: 6 },
]

const jobTypeLabels: Record<JobType, string> = {
  script: 'Script Generation',
  image: 'Image Generation',
  video: 'Video Synthesis',
  voice: 'Voice Generation',
  assembly: 'Final Assembly',
}

const jobTypeIcons: Record<JobType, string> = {
  script: '📝',
  image: '🖼️',
  video: '🎬',
  voice: '🎤',
  assembly: '🎞️',
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [activeTab, setActiveTab] = useState<'scenes' | 'jobs'>('scenes')
  
  // Find project by ID
  const project = mockProjects.find(p => p.id === params.id) || mockProjects[0]
  const statusColor = getStatusColor(project.status) as 'success' | 'warning' | 'error' | 'info' | 'muted'

  const statusLabels: Record<string, string> = {
    draft: 'Draft',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
  }

  return (
    <>
      <Header
        title=""
        actions={
          <div className="flex items-center gap-2">
            {project.status === 'completed' && (
              <>
                <Button variant="secondary" onClick={() => setShowShareMenu(!showShareMenu)}>
                  <Share2 className="w-4 h-4" />
                  Publish
                </Button>
                <Button variant="secondary">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </>
            )}
            {project.status === 'failed' && (
              <Button>
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
            )}
          </div>
        }
      />

      <div className="p-6">
        {/* Back Link */}
        <Link 
          href="/dashboard/projects" 
          className="inline-flex items-center gap-2 text-muted hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Videos
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Preview */}
            <div className="rounded-xl overflow-hidden bg-card border border-border">
              <div className="aspect-video bg-black relative">
                {project.thumbnailUrl ? (
                  <img
                    src={project.thumbnailUrl}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent-pink/20">
                    <Play className="w-16 h-16 text-muted" />
                  </div>
                )}

                {/* Play Button Overlay */}
                {project.status === 'completed' && (
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group"
                  >
                    <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {isPlaying ? (
                        <Pause className="w-8 h-8 text-black ml-0" />
                      ) : (
                        <Play className="w-8 h-8 text-black ml-1" />
                      )}
                    </div>
                  </button>
                )}

                {/* Processing Overlay */}
                {project.status === 'processing' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                    <Loader2 className="w-12 h-12 text-white animate-spin mb-4" />
                    <p className="text-white font-medium">Processing video...</p>
                    <p className="text-white/60 text-sm">{project.progress}% complete</p>
                  </div>
                )}

                {/* Duration Badge */}
                {project.durationSeconds && (
                  <div className="absolute bottom-4 right-4 px-2 py-1 rounded bg-black/80 text-white text-sm font-medium">
                    {formatDuration(project.durationSeconds)}
                  </div>
                )}
              </div>

              {/* Progress Bar for Processing */}
              {project.status === 'processing' && (
                <div className="p-4 border-t border-border">
                  <Progress value={project.progress} showLabel />
                </div>
              )}
            </div>

            {/* Title & Description */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="text-2xl font-bold text-foreground">{project.title}</h1>
                <Badge variant={statusColor} dot={project.status === 'processing'}>
                  {statusLabels[project.status]}
                </Badge>
              </div>
              <p className="text-muted">{project.topic}</p>
            </div>

            {/* Tabs */}
            <div className="border-b border-border">
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab('scenes')}
                  className={cn(
                    'pb-3 text-sm font-medium transition-colors border-b-2 -mb-px',
                    activeTab === 'scenes'
                      ? 'text-foreground border-primary'
                      : 'text-muted border-transparent hover:text-foreground'
                  )}
                >
                  Scenes ({mockScenes.length})
                </button>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className={cn(
                    'pb-3 text-sm font-medium transition-colors border-b-2 -mb-px',
                    activeTab === 'jobs'
                      ? 'text-foreground border-primary'
                      : 'text-muted border-transparent hover:text-foreground'
                  )}
                >
                  Processing Jobs
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'scenes' && (
              <div className="space-y-3">
                {mockScenes.map((scene, index) => (
                  <div
                    key={scene.id}
                    className="flex gap-4 p-4 bg-card rounded-xl border border-border hover:border-border-light transition-colors"
                  >
                    <div className="w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-card-hover">
                      <img
                        src={scene.imageUrl}
                        alt={`Scene ${scene.id}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-medium flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-foreground">Scene {scene.id}</span>
                        <span className="text-xs text-muted">{scene.duration}s</span>
                      </div>
                      <p className="text-sm text-muted line-clamp-2">{scene.narration}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'jobs' && project.jobs && (
              <div className="space-y-3">
                {project.jobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border"
                  >
                    <div className="w-10 h-10 rounded-lg bg-card-hover flex items-center justify-center text-xl">
                      {jobTypeIcons[job.type]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {jobTypeLabels[job.type]}
                        </span>
                        <JobStatusBadge status={job.status} />
                      </div>
                      {job.status === 'running' && (
                        <Progress value={job.progress} size="sm" className="mt-2" />
                      )}
                      {job.error && (
                        <p className="text-sm text-error mt-1">{job.error}</p>
                      )}
                    </div>
                    {job.status === 'completed' && (
                      <CheckCircle className="w-5 h-5 text-success" />
                    )}
                    {job.status === 'running' && (
                      <Loader2 className="w-5 h-5 text-info animate-spin" />
                    )}
                    {job.status === 'failed' && (
                      <AlertCircle className="w-5 h-5 text-error" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'jobs' && !project.jobs && (
              <div className="text-center py-12 text-muted">
                No job data available
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info Card */}
            <Card>
              <h3 className="text-sm font-medium text-foreground mb-4">Video Details</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Created</span>
                  <span className="text-foreground">{formatDate(project.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Duration</span>
                  <span className="text-foreground">
                    {project.durationSeconds ? formatDuration(project.durationSeconds) : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Scenes</span>
                  <span className="text-foreground">{mockScenes.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Credits used</span>
                  <span className="text-foreground flex items-center gap-1">
                    <Zap className="w-4 h-4 text-primary" />
                    {project.costCredits}
                  </span>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            {project.status === 'completed' && (
              <Card>
                <h3 className="text-sm font-medium text-foreground mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-card-hover transition-colors text-left">
                    <div className="w-10 h-10 rounded-lg bg-[#FF0000]/10 flex items-center justify-center">
                      <Youtube className="w-5 h-5 text-[#FF0000]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Publish to YouTube</p>
                      <p className="text-xs text-muted">Upload directly to your channel</p>
                    </div>
                  </button>
                  
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-card-hover transition-colors text-left">
                    <div className="w-10 h-10 rounded-lg bg-[#E1306C]/10 flex items-center justify-center">
                      <Instagram className="w-5 h-5 text-[#E1306C]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Share to Instagram</p>
                      <p className="text-xs text-muted">Post as a Reel</p>
                    </div>
                  </button>

                  <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-card-hover transition-colors text-left">
                    <div className="w-10 h-10 rounded-lg bg-card-hover flex items-center justify-center">
                      <Copy className="w-5 h-5 text-muted" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Copy share link</p>
                      <p className="text-xs text-muted">Get a public preview link</p>
                    </div>
                  </button>
                </div>
              </Card>
            )}

            {/* Danger Zone */}
            <Card className="border-error/20">
              <h3 className="text-sm font-medium text-error mb-4">Danger Zone</h3>
              <Button variant="danger" className="w-full">
                <Trash2 className="w-4 h-4" />
                Delete Video
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}

function JobStatusBadge({ status }: { status: JobStatus }) {
  const config: Record<JobStatus, { label: string; variant: 'success' | 'info' | 'muted' | 'error' }> = {
    completed: { label: 'Completed', variant: 'success' },
    running: { label: 'Running', variant: 'info' },
    queued: { label: 'Queued', variant: 'muted' },
    failed: { label: 'Failed', variant: 'error' },
  }

  return (
    <Badge variant={config[status].variant} dot={status === 'running'}>
      {config[status].label}
    </Badge>
  )
}
