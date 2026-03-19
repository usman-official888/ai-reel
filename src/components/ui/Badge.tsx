import { cn } from '@/lib/utils'

interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'muted'
  children: React.ReactNode
  className?: string
  dot?: boolean
}

export function Badge({ variant = 'muted', children, className, dot }: BadgeProps) {
  const variants = {
    success: 'bg-success/20 text-success',
    warning: 'bg-warning/20 text-warning',
    error: 'bg-error/20 text-error',
    info: 'bg-info/20 text-info',
    muted: 'bg-border text-muted',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {dot && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full',
          variant === 'success' && 'bg-success',
          variant === 'warning' && 'bg-warning',
          variant === 'error' && 'bg-error',
          variant === 'info' && 'bg-info animate-pulse',
          variant === 'muted' && 'bg-muted',
        )} />
      )}
      {children}
    </span>
  )
}
