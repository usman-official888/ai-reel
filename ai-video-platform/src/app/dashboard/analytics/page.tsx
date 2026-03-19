'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Eye, Heart, MessageCircle, Share2, Play, Clock } from 'lucide-react'
import { Header } from '@/components/layout'
import { Card, Badge, Progress } from '@/components/ui'
import { cn } from '@/lib/utils'

// Mock analytics data
const overviewStats = [
  { label: 'Total Views', value: '45.2K', change: '+28%', positive: true, icon: Eye },
  { label: 'Watch Time', value: '1,234h', change: '+15%', positive: true, icon: Clock },
  { label: 'Engagement Rate', value: '4.8%', change: '+0.3%', positive: true, icon: Heart },
  { label: 'Videos Published', value: '23', change: '+5', positive: true, icon: Play },
]

const topVideos = [
  { title: 'The History of Ancient Pyramids', views: 12400, likes: 890, comments: 156, platform: 'youtube' },
  { title: 'How Bitcoin Mining Works', views: 8900, likes: 654, comments: 89, platform: 'youtube' },
  { title: 'Top 10 AI Tools in 2024', views: 6500, likes: 445, comments: 67, platform: 'tiktok' },
  { title: 'Morning Yoga Routine', views: 4200, likes: 312, comments: 45, platform: 'instagram' },
  { title: 'Space Exploration Documentary', views: 3100, likes: 234, comments: 34, platform: 'youtube' },
]

const platformBreakdown = [
  { platform: 'YouTube', views: 28500, percentage: 63, color: '#FF0000' },
  { platform: 'TikTok', views: 10200, percentage: 23, color: '#000000' },
  { platform: 'Instagram', views: 4500, percentage: 10, color: '#E1306C' },
  { platform: 'X / Twitter', views: 2000, percentage: 4, color: '#000000' },
]

const weeklyData = [
  { day: 'Mon', views: 4200 },
  { day: 'Tue', views: 3800 },
  { day: 'Wed', views: 5100 },
  { day: 'Thu', views: 4600 },
  { day: 'Fri', views: 6200 },
  { day: 'Sat', views: 7800 },
  { day: 'Sun', views: 5400 },
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const maxViews = Math.max(...weeklyData.map(d => d.views))

  return (
    <>
      <Header
        title="Analytics"
        subtitle="Track your video performance across all platforms"
      />

      <div className="p-6">
        {/* Time Range Selector */}
        <div className="flex justify-end mb-6">
          <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
            {[
              { id: '7d', label: '7 days' },
              { id: '30d', label: '30 days' },
              { id: '90d', label: '90 days' },
            ].map((range) => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id as typeof timeRange)}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  timeRange === range.id
                    ? 'bg-primary text-white'
                    : 'text-muted hover:text-foreground'
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {overviewStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <div className={cn(
                      'flex items-center gap-1 mt-2 text-sm',
                      stat.positive ? 'text-success' : 'text-error'
                    )}>
                      {stat.positive ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span>{stat.change}</span>
                      <span className="text-muted">vs last period</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Views Chart */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Views Over Time</h3>
                <Badge variant="info">Last 7 days</Badge>
              </div>

              {/* Simple Bar Chart */}
              <div className="flex items-end justify-between h-48 gap-2">
                {weeklyData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full relative">
                      <div 
                        className="w-full bg-gradient-to-t from-primary to-accent-pink rounded-t-lg transition-all duration-500 hover:opacity-80"
                        style={{ height: `${(data.views / maxViews) * 160}px` }}
                      />
                    </div>
                    <span className="text-xs text-muted">{data.day}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-sm">
                <span className="text-muted">Total views this week</span>
                <span className="font-semibold text-foreground">
                  {weeklyData.reduce((acc, d) => acc + d.views, 0).toLocaleString()}
                </span>
              </div>
            </Card>
          </div>

          {/* Platform Breakdown */}
          <div>
            <Card>
              <h3 className="text-lg font-semibold text-foreground mb-6">Platform Breakdown</h3>
              
              <div className="space-y-4">
                {platformBreakdown.map((platform, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{platform.platform}</span>
                      <span className="text-sm text-muted">{platform.views.toLocaleString()} views</span>
                    </div>
                    <div className="h-2 bg-border rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${platform.percentage}%`,
                          backgroundColor: platform.color 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Top Videos */}
        <Card className="mt-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Top Performing Videos</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted">Video</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted">Views</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted">Likes</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted">Comments</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted">Platform</th>
                </tr>
              </thead>
              <tbody>
                {topVideos.map((video, index) => (
                  <tr key={index} className="border-b border-border last:border-0 hover:bg-card-hover transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                          {index + 1}
                        </div>
                        <span className="font-medium text-foreground">{video.title}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Eye className="w-4 h-4 text-muted" />
                        <span className="text-foreground">{video.views.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Heart className="w-4 h-4 text-muted" />
                        <span className="text-foreground">{video.likes.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <MessageCircle className="w-4 h-4 text-muted" />
                        <span className="text-foreground">{video.comments}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Badge variant="muted" className="capitalize">
                        {video.platform}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  )
}
