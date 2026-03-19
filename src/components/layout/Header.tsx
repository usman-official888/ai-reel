'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell, Search, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const [showSearch, setShowSearch] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const notifications = [
    { id: 1, title: 'Video completed', message: 'Your video "History of Pyramids" is ready', time: '2 min ago', unread: true },
    { id: 2, title: 'Published to YouTube', message: 'Video successfully published', time: '1 hour ago', unread: true },
    { id: 3, title: 'Credits running low', message: 'You have 13 credits remaining', time: '2 hours ago', unread: false },
  ]

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {title && (
            <div>
              <h1 className="text-xl font-semibold text-foreground">{title}</h1>
              {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={cn(
                'p-2.5 rounded-lg transition-colors',
                showSearch ? 'bg-card text-foreground' : 'text-muted hover:text-foreground hover:bg-card'
              )}
            >
              <Search className="w-5 h-5" />
            </button>
            
            {showSearch && (
              <div className="absolute right-0 top-full mt-2 w-80 animate-slide-down">
                <div className="bg-card border border-border rounded-xl shadow-lg p-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="text"
                      placeholder="Search videos, topics..."
                      className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary"
                      autoFocus
                    />
                  </div>
                  <div className="mt-2 px-3 py-2 text-xs text-muted">
                    Press <kbd className="px-1.5 py-0.5 bg-border rounded text-foreground">⌘K</kbd> to search anytime
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={cn(
                'p-2.5 rounded-lg transition-colors relative',
                showNotifications ? 'bg-card text-foreground' : 'text-muted hover:text-foreground hover:bg-card'
              )}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 animate-slide-down">
                <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <span className="font-medium text-foreground">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-xs text-primary">{unreadCount} new</span>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          'px-4 py-3 border-b border-border last:border-0 hover:bg-card-hover cursor-pointer transition-colors',
                          notification.unread && 'bg-primary/5'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {notification.unread && (
                            <span className="w-2 h-2 mt-1.5 rounded-full bg-primary flex-shrink-0" />
                          )}
                          <div className={cn(!notification.unread && 'ml-5')}>
                            <p className="text-sm font-medium text-foreground">{notification.title}</p>
                            <p className="text-xs text-muted mt-0.5">{notification.message}</p>
                            <p className="text-xs text-muted mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-border">
                    <Link href="/dashboard/notifications" className="text-xs text-primary hover:underline">
                      View all notifications
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          {actions && (
            <div className="flex items-center gap-2 ml-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
