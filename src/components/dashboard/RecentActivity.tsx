import { Video, Share2, CreditCard, Link as LinkIcon, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Activity {
  id: number
  type: string
  message: string
  time: string
}

interface RecentActivityProps {
  activities: Activity[]
}

const activityIcons: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  video_completed: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
  video_published: { icon: Share2, color: 'text-info', bg: 'bg-info/10' },
  credits_added: { icon: CreditCard, color: 'text-primary', bg: 'bg-primary/10' },
  account_connected: { icon: LinkIcon, color: 'text-accent-cyan', bg: 'bg-accent-cyan/10' },
  video_failed: { icon: AlertCircle, color: 'text-error', bg: 'bg-error/10' },
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
      
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const config = activityIcons[activity.type] || activityIcons.video_completed
          const Icon = config.icon

          return (
            <div
              key={activity.id}
              className={cn(
                'flex items-start gap-3 pb-4',
                index < activities.length - 1 && 'border-b border-border'
              )}
            >
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', config.bg)}>
                <Icon className={cn('w-4 h-4', config.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{activity.message}</p>
                <p className="text-xs text-muted mt-1">{activity.time}</p>
              </div>
            </div>
          )
        })}
      </div>

      {activities.length === 0 && (
        <p className="text-sm text-muted text-center py-8">No recent activity</p>
      )}
    </div>
  )
}
