'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, Grid, List, Video } from 'lucide-react'
import { Header } from '@/components/layout'
import { Button, Input, Badge } from '@/components/ui'
import { ProjectCard } from '@/components/dashboard'
import { mockProjects } from '@/data/mock'
import { cn } from '@/lib/utils'
import { ProjectStatus } from '@/types'

type ViewMode = 'grid' | 'list'
type FilterStatus = 'all' | ProjectStatus

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const statusFilters: { value: FilterStatus; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: mockProjects.length },
    { value: 'completed', label: 'Completed', count: mockProjects.filter(p => p.status === 'completed').length },
    { value: 'processing', label: 'Processing', count: mockProjects.filter(p => p.status === 'processing').length },
    { value: 'draft', label: 'Drafts', count: mockProjects.filter(p => p.status === 'draft').length },
    { value: 'failed', label: 'Failed', count: mockProjects.filter(p => p.status === 'failed').length },
  ]

  const filteredProjects = mockProjects
    .filter(project => {
      if (filterStatus !== 'all' && project.status !== filterStatus) return false
      if (searchQuery && !project.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !project.topic.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  return (
    <>
      <Header
        title="My Videos"
        subtitle={`${mockProjects.length} videos created`}
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
                <ProjectCard key={project.id} project={project} />
              ) : (
                <ProjectListItem key={project.id} project={project} />
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
import { Project } from '@/types'
import { formatRelativeTime, formatDuration, getStatusColor } from '@/lib/utils'
import { Clock, MoreVertical, Play } from 'lucide-react'

function ProjectListItem({ project }: { project: Project }) {
  const statusColor = getStatusColor(project.status) as 'success' | 'warning' | 'error' | 'info' | 'muted'
  
  const statusLabels: Record<string, string> = {
    draft: 'Draft',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4 hover:border-border-light transition-all flex items-center gap-4">
      {/* Thumbnail */}
      <div className="w-32 h-20 rounded-lg bg-card-hover overflow-hidden flex-shrink-0">
        {project.thumbnailUrl ? (
          <img
            src={project.thumbnailUrl}
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
            {formatRelativeTime(project.createdAt)}
          </span>
          {project.durationSeconds && (
            <span>{formatDuration(project.durationSeconds)}</span>
          )}
        </div>
      </div>

      {/* Status */}
      <Badge variant={statusColor} dot={project.status === 'processing'}>
        {statusLabels[project.status]}
      </Badge>

      {/* Actions */}
      <button className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-card-hover transition-colors">
        <MoreVertical className="w-5 h-5" />
      </button>
    </div>
  )
}
