'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Search, Grid, List, Video, Loader2, Clock, MoreVertical, Play, Trash2 } from 'lucide-react'
import { Header } from '@/components/layout'
import { Button, Input, Badge } from '@/components/ui'
import { ProjectCard } from '@/components/dashboard'
import { useProjects, useDeleteProject } from '@/lib/hooks'
import { cn, formatRelativeTime } from '@/lib/utils'
import type { Project } from '@/lib/api-client'

type ViewMode = 'grid' | 'list'
type FilterStatus = 'all' | 'draft' | 'processing' | 'completed' | 'failed' | 'published'

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Fetch projects from API
  const { data: projectsData, loading, error, refetch } = useProjects({ limit: 50 })
  const { mutate: deleteProject, loading: deleting } = useDeleteProject()

  const projects = projectsData?.projects || []

  // Calculate filter counts
  const statusFilters = useMemo(() => [
    { value: 'all' as FilterStatus, label: 'All', count: projects.length },
    { value: 'completed' as FilterStatus, label: 'Completed', count: projects.filter(p => p.status === 'completed').length },
    { value: 'processing' as FilterStatus, label: 'Processing', count: projects.filter(p => p.status === 'processing').length },
    { value: 'draft' as FilterStatus, label: 'Drafts', count: projects.filter(p => p.status === 'draft').length },
    { value: 'failed' as FilterStatus, label: 'Failed', count: projects.filter(p => p.status === 'failed').length },
  ], [projects])

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter(project => {
        if (filterStatus !== 'all' && project.status !== filterStatus) return false
        if (searchQuery && !project.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !project.topic.toLowerCase().includes(searchQuery.toLowerCase())) return false
        return true
      })
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  }, [projects, filterStatus, searchQuery])

  // Handle delete
  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    
    const result = await deleteProject(projectId)
    if (result.success) {
      refetch()
    }
  }

  // Loading state
  if (loading && !projectsData) {
    return (
      <>
        <Header
          title="My Videos"
          subtitle="Loading..."
        />
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted">Loading projects...</p>
          </div>
        </div>
      </>
    )
  }

  // Error state
  if (error) {
    return (
      <>
        <Header
          title="My Videos"
          subtitle="Error loading projects"
        />
        <div className="p-6">
          <div className="bg-error/10 border border-error/20 rounded-xl p-6 text-center">
            <p className="text-error mb-4">Failed to load projects: {error}</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header
        title="My Videos"
        subtitle={`${projects.length} video${projects.length !== 1 ? 's' : ''} created`}
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
        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  filterStatus === filter.value
                    ? 'bg-primary text-white'
                    : 'bg-card border border-border text-muted hover:text-foreground hover:border-border-light'
                )}
              >
                {filter.label}
                <span className={cn(
                  'ml-1.5 px-1.5 py-0.5 rounded text-xs',
                  filterStatus === filter.value ? 'bg-white/20' : 'bg-border'
                )}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded transition-colors',
                viewMode === 'grid' ? 'bg-primary text-white' : 'text-muted hover:text-foreground'
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded transition-colors',
                viewMode === 'list' ? 'bg-primary text-white' : 'text-muted hover:text-foreground'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Projects Grid/List */}
        {filteredProjects.length > 0 ? (
          <div className={cn(
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-3'
          )}>
            {filteredProjects.map((project) => (
              viewMode === 'grid' ? (
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
              ) : (
                <ProjectListItem 
                  key={project.id} 
                  project={project} 
                  onDelete={handleDelete}
                  deleting={deleting}
                />
              )
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-card-hover mx-auto mb-4 flex items-center justify-center">
              <Video className="w-8 h-8 text-muted" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery ? 'No videos found' : 'No videos yet'}
            </h3>
            <p className="text-muted mb-6">
              {searchQuery 
                ? 'Try adjusting your search or filters'
                : 'Create your first AI-generated video in minutes'
              }
            </p>
            {!searchQuery && (
              <Link href="/dashboard/projects/new">
                <Button>
                  <Plus className="w-4 h-4" />
                  Create Your First Video
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  )
}

// List view item component
function ProjectListItem({ 
  project, 
  onDelete,
  deleting 
}: { 
  project: Project
  onDelete: (id: string) => void
  deleting: boolean
}) {
  const [showMenu, setShowMenu] = useState(false)
  
  const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'muted'> = {
    draft: 'muted',
    processing: 'info',
    completed: 'success',
    failed: 'error',
    published: 'success',
  }
  
  const statusLabels: Record<string, string> = {
    draft: 'Draft',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
    published: 'Published',
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4 hover:border-border-light transition-all flex items-center gap-4">
      {/* Thumbnail */}
      <div className="w-32 h-20 rounded-lg bg-card-hover overflow-hidden flex-shrink-0">
        {project.thumbnail_url ? (
          <img
            src={project.thumbnail_url}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent-pink/20">
            <Play className="w-6 h-6 text-muted" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <Link href={`/dashboard/projects/${project.id}`}>
          <h3 className="font-semibold text-foreground truncate hover:text-primary transition-colors">
            {project.title}
          </h3>
        </Link>
        <p className="text-sm text-muted truncate mt-1">{project.topic}</p>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatRelativeTime(project.created_at)}
          </span>
          {project.duration_target && (
            <span>{project.duration_target}s</span>
          )}
        </div>
      </div>

      {/* Status */}
      <Badge 
        variant={statusColors[project.status] || 'muted'} 
        dot={project.status === 'processing'}
      >
        {statusLabels[project.status] || project.status}
      </Badge>

      {/* Actions */}
      <div className="relative">
        <button 
          className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-card-hover transition-colors"
          onClick={() => setShowMenu(!showMenu)}
        >
          <MoreVertical className="w-5 h-5" />
        </button>
        
        {showMenu && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-20 py-1 min-w-[120px]">
              <Link
                href={`/dashboard/projects/${project.id}`}
                className="block px-4 py-2 text-sm text-foreground hover:bg-card-hover"
              >
                View Details
              </Link>
              <button
                onClick={() => {
                  setShowMenu(false)
                  onDelete(project.id)
                }}
                disabled={deleting}
                className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/10 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
