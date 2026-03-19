import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: string
    positive: boolean
  }
  icon: LucideIcon
  iconColor?: string
  className?: string
}

export function StatsCard({ title, value, change, icon: Icon, iconColor = 'text-primary', className }: StatsCardProps) {
  return (
    <div className={cn('bg-card rounded-xl border border-border p-6 hover:border-border-light transition-all duration-300', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {change && (
            <p className={cn(
              'text-sm mt-2 flex items-center gap-1',
              change.positive ? 'text-success' : 'text-error'
            )}>
              <span>{change.positive ? '↑' : '↓'}</span>
              <span>{change.value}</span>
              <span className="text-muted">vs last month</span>
            </p>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-xl bg-card-hover flex items-center justify-center', iconColor)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}
