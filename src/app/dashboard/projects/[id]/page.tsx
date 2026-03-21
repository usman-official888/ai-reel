'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Download, 
  Share2, 
  Clock,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2,
  Youtube,
  Instagram,
  Twitter,
  Copy,
  RefreshCw,
  Trash2
} from 'lucide-react'
import { Header } from '@/components/layout'
import { Button, Badge, Progress, Card } from '@/components/ui'
import { cn, formatDate, formatDuration, getStatusColor } from '@/lib/utils'
import { useProject, useProjectGeneration, useDeleteProject, useStartGeneration } from '@/lib/hooks'
import { projectsApi } from '@/lib/api-client'

type JobType = 'script' | 'image' | 'video' | 'voice' | 'assembly'
type JobStatus = 'pending' | 'queued' | 'running' | 'completed' | 'failed'

const jobTypeLabels: Record<string, string> = {
  script: 'Script Generation',
  image: 'Image Generation',
  video: 'Video Synthesis',
  voice: 'Voice Generation',
  assembly: 'Final Assembly',
}

const jobTypeIcons: Record<string, string> = {
  script: '📝',
  image: '🖼️',
  video: '🎬',
  voice: '🎤',
  assembly: '🎞️',
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isPlaying, setIsPlaying] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [activeTab, setActiveTab] = useState<'scenes' | 'jobs'>('scenes')
  const [publishing, setPublishing] = useState(false)
  
  // Fetch project data
  const { data: project, loading, error, refetch } = useProject(params.id)
  const { data: generationStatus, isPolling } = useProjectGeneration(
    project?.status === 'processing' ? params.id : null,
    3000 // Poll every 3 seconds
  )
  
  const { mutate: deleteProject, loading: deleting } = useDeleteProject()
  const { mutate: startGeneration, loading: retrying } = useStartGeneration()

  // Handle delete
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this video? This cannot be undone.')) return
    
    const result = await deleteProject(params.id)
    if (result.success) {
      router.push('/dashboard/projects')
    } else {
      alert(`Failed to delete: ${result.error}`)
    }
  }

  // Handle retry
  const handleRetry = async () => {
    const result = await startGeneration(params.id)
    if (result.success) {
      refetch()
    } else {
      alert(`Failed to retry: ${result.error}`)
    }
  }

  // Handle publish
  const handlePublish = async (platform: string) => {
    setPublishing(true)
    const result = await projectsApi.publish(params.id, {
      platforms: [platform],
      caption: project?.title || '',
      hashtags: ['AI', 'VideoForge'],
    })
    
    if (result.success) {
      alert(`Successfully scheduled for publishing to ${platform}!`)
      refetch()
    } else {
      alert(`Failed to publish: ${result.error}`)
    }
    setPublishing(false)
    setShowShareMenu(false)
  }

  // Loading state
  if (loading && !project) {
    return (
      <>
        <Header title="" />
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted">Loading project...</p>
          </div>
        </div>
      </>
    )
  }

  // Error state
  if (error || !project) {
    return (
      <>
        <Header title="" />
        <div className="p-6">
          <Link 
            href="/dashboard/projects" 
            className="inline-flex items-center gap-2 text-muted hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Videos
          </Link>
          <div className="bg-error/10 border border-error/20 rounded-xl p-6 text-center">
            <p className="text-error mb-4">{error || 'Project not found'}</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        </div>
      </>
    )
  }

  const statusColor = getStatusColor(project.status) as 'success' | 'warning' | 'error' | 'info' | 'muted'

  const statusLabels: Record<string, string> = {
    draft: 'Draft',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
    published: 'Published',
  }

  // Parse script data for scenes
  const scriptData = project.script_data as { scenes?: Array<{ narration: string; imagePrompt: string; imageUrl?: string; duration?: number }> } | null
  const scenes = scriptData?.scenes || []

  // Get jobs from generation status if available
  const jobs = generationStatus?.jobs || []

  return (
    <>
      <Header
        title=""
        actions={
          <div className="flex items-center gap-2">
            {(project.status === 'completed' || project.status === 'published') && (
              <>
                <div className="relative">
                  <Button variant="secondary" onClick={() => setShowShareMenu(!showShareMenu)}>
                    <Share2 className="w-4 h-4" />
                    Publish
                  </Button>
                  
                  {showShareMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowShareMenu(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-lg shadow-lg z-20 py-2 min-w-[200px]">
                        <button
                          onClick={() => handlePublish('youtube')}
                          disabled={publishing}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-card-hover"
                        >
                          <Youtube className="w-4 h-4 text-[#FF0000]" />
                          YouTube
                        </button>
                        <button
                          onClick={() => handlePublish('tiktok')}
                          disabled={publishing}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-card-hover"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                          </svg>
                          TikTok
                        </button>
                        <button
                          onClick={() => handlePublish('instagram')}
                          disabled={publishing}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-card-hover"
                        >
                          <Instagram className="w-4 h-4 text-[#E1306C]" />
                          Instagram Reels
                        </button>
                      </div>
                    </>
                  )}
                </div>
                {project.video_url && (
                  <a 
                    href={project.video_url} 
                    download 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-foreground hover:bg-card-hover transition-colors text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                )}
              </>
            )}
            {project.status === 'failed' && (
              <Button onClick={handleRetry} isLoading={retrying}>
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
                {project.thumbnail_url ? (
                  <img
                    src={project.thumbnail_url}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : project.video_url ? (
                  <video
                    src={project.video_url}
                    poster={project.thumbnail_url || undefined}
                    controls={isPlaying}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent-pink/20">
                    <Play className="w-16 h-16 text-muted" />
                  </div>
                )}

                {/* Play Button Overlay */}
                {(project.status === 'completed' || project.status === 'published') && project.video_url && !isPlaying && (
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group"
                  >
                    <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-black ml-1" />
                    </div>
                  </button>
                )}

                {/* Processing Overlay */}
                {project.status === 'processing' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                    <Loader2 className="w-12 h-12 text-white animate-spin mb-4" />
                    <p className="text-white font-medium">Processing video...</p>
                    <p className="text-white/60 text-sm">
                      {generationStatus?.currentStep || `${project.progress}% complete`}
                    </p>
                  </div>
                )}

                {/* Duration Badge */}
                {project.duration_target && (
                  <div className="absolute bottom-4 right-4 px-2 py-1 rounded bg-black/80 text-white text-sm font-medium">
                    {formatDuration(project.duration_target)}
                  </div>
                )}
              </div>

              {/* Progress Bar for Processing */}
              {project.status === 'processing' && (
                <div className="p-4 border-t border-border">
                  <Progress value={generationStatus?.progress || project.progress} showLabel />
                </div>
              )}
            </div>

            {/* Title & Description */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="text-2xl font-bold text-foreground">{project.title}</h1>
                <Badge variant={statusColor} dot={project.status === 'processing'}>
                  {statusLabels[project.status] || project.status}
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
                  Scenes ({scenes.length})
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
                  Processing Jobs {isPolling && <Loader2 className="w-3 h-3 inline animate-spin ml-1" />}
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'scenes' && (
              <div className="space-y-3">
                {scenes.length > 0 ? (
                  scenes.map((scene, index) => (
                    <div
                      key={index}
                      className="flex gap-4 p-4 bg-card rounded-xl border border-border hover:border-border-light transition-colors"
                    >
                      <div className="w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-card-hover">
                        {scene.imageUrl ? (
                          <img
                            src={scene.imageUrl}
                            alt={`Scene ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted">
                            <Play className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-medium flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium text-foreground">Scene {index + 1}</span>
                          {scene.duration && (
                            <span className="text-xs text-muted">{scene.duration}s</span>
                          )}
                        </div>
                        <p className="text-sm text-muted line-clamp-2">{scene.narration}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted">
                    No scenes generated yet
                  </div>
                )}
              </div>
            )}

            {activeTab === 'jobs' && (
              <div className="space-y-3">
                {jobs.length > 0 ? (
                  jobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border"
                    >
                      <div className="w-10 h-10 rounded-lg bg-card-hover flex items-center justify-center text-xl">
                        {jobTypeIcons[job.job_type] || '📦'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {jobTypeLabels[job.job_type] || job.job_type}
                          </span>
                          <JobStatusBadge status={job.status as JobStatus} />
                        </div>
                        {job.status === 'running' && (
                          <Progress value={job.progress} size="sm" className="mt-2" />
                        )}
                        {job.error_message && (
                          <p className="text-sm text-error mt-1">{job.error_message}</p>
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
                  ))
                ) : (
                  <div className="text-center py-12 text-muted">
                    {project.status === 'draft' ? 'Generation not started' : 'No job data available'}
                  </div>
                )}
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
                  <span className="text-foreground">{formatDate(project.created_at)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Duration</span>
                  <span className="text-foreground">
                    {project.duration_target ? formatDuration(project.duration_target) : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Style</span>
                  <span className="text-foreground capitalize">{project.style || '—'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Aspect Ratio</span>
                  <span className="text-foreground">{project.aspect_ratio || '16:9'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Scenes</span>
                  <span className="text-foreground">{scenes.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Credits used</span>
                  <span className="text-foreground flex items-center gap-1">
                    <Zap className="w-4 h-4 text-primary" />
                    {project.cost_credits}
                  </span>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            {(project.status === 'completed' || project.status === 'published') && (
              <Card>
                <h3 className="text-sm font-medium text-foreground mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => handlePublish('youtube')}
                    disabled={publishing}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-card-hover transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#FF0000]/10 flex items-center justify-center">
                      <Youtube className="w-5 h-5 text-[#FF0000]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Publish to YouTube</p>
                      <p className="text-xs text-muted">Upload directly to your channel</p>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => handlePublish('instagram')}
                    disabled={publishing}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-card-hover transition-colors text-left"
                  >
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
              <Button 
                variant="danger" 
                className="w-full"
                onClick={handleDelete}
                isLoading={deleting}
              >
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
  const config: Record<JobStatus, { label: string; variant: 'success' | 'info' | 'muted' | 'error' | 'warning' }> = {
    completed: { label: 'Completed', variant: 'success' },
    running: { label: 'Running', variant: 'info' },
    queued: { label: 'Queued', variant: 'muted' },
    pending: { label: 'Pending', variant: 'muted' },
    failed: { label: 'Failed', variant: 'error' },
  }

  const cfg = config[status] || { label: status, variant: 'muted' as const }

  return (
    <Badge variant={cfg.variant} dot={status === 'running'}>
      {cfg.label}
    </Badge>
  )
}
