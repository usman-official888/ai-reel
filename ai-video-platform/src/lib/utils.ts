import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return formatDate(dateString)
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
    case 'published':
      return 'success'
    case 'processing':
    case 'running':
    case 'publishing':
      return 'info'
    case 'draft':
    case 'queued':
    case 'scheduled':
      return 'muted'
    case 'failed':
      return 'error'
    default:
      return 'muted'
  }
}

export function getPlatformColor(platform: string): string {
  switch (platform) {
    case 'youtube':
      return '#FF0000'
    case 'tiktok':
      return '#000000'
    case 'instagram':
      return '#E1306C'
    case 'twitter':
      return '#000000'
    default:
      return '#666666'
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}
