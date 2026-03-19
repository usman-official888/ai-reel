'use client'

import Link from 'next/link'
import { Play, Clock, MoreVertical, Trash2, Download, Share, Eye } from 'lucide-react'
import { Badge, Progress } from '@/components/ui'
import { Project } from '@/types'
import { formatRelativeTime, formatDuration, getStatusColor } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const statusColor = getStatusColor(project.status) as 'success' | 'warning' | 'error' | 'info' | 'muted'

  const statusLabels: Record<string, string> = {
    draft: 'Draft',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
  }

  return (
    <div className="group bg-card rounded-xl border border-border overflow-hidden hover:border-border-light transition-all duration-300">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-card-hover overflow-hidden">
        {project.thumbnailUrl ? (
          <img
            src={project.thumbnailUrl}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent-pink/20">
            <Play className="w-12 h-12 text-muted" />
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          {project.status === 'completed' && (
            <>
              <Link
                href={`/dashboard/projects/${project.id}`}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <Eye className="w-5 h-5" />
              </Link>
              <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                <Download className="w-5 h-5" />
              </button>
              <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                <Share className="w-5 h-5" />
              </button>
            </>
          )}
          {project.status === 'processing' && (
            <div className="text-white text-sm font-medium">
              Processing... {project.progress}%
            </div>
          )}
        </div>

        {/* Duration badge */}
        {project.durationSeconds && (
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/80 text-white text-xs font-medium">
            {formatDuration(project.durationSeconds)}
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <Badge variant={statusColor} dot={project.status === 'processing'}>
            {statusLabels[project.status]}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/dashboard/projects/${project.id}`} className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate hover:text-primary transition-colors">
              {project.title}
            </h3>
            <p className="text-sm text-muted mt-1 line-clamp-2">{project.topic}</p>
          </Link>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-card-hover transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-lg shadow-lg py-1 z-10 animate-scale-in">
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-card-hover transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </Link>
                {project.status === 'completed' && (
                  <>
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-card-hover transition-colors">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-card-hover transition-colors">
                      <Share className="w-4 h-4" />
                      Publish
                    </button>
                  </>
                )}
                <div className="border-t border-border my-1" />
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/10 transition-colors">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar for processing */}
        {project.status === 'processing' && (
          <div className="mt-3">
            <Progress value={project.progress} size="sm" />
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatRelativeTime(project.createdAt)}</span>
          </div>
          {project.costCredits > 0 && (
            <span>{project.costCredits} credit{project.costCredits > 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
    </div>
  )
}
