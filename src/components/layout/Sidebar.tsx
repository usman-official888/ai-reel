'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Video, 
  PlusCircle, 
  Settings, 
  CreditCard,
  Share2,
  BarChart3,
  Sparkles,
  HelpCircle,
  LogOut
} from 'lucide-react'

const mainNavItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Videos', href: '/dashboard/projects', icon: Video },
  { label: 'Create New', href: '/dashboard/projects/new', icon: PlusCircle },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Social Accounts', href: '/dashboard/social', icon: Share2 },
]

const bottomNavItems = [
  { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  { label: 'Help', href: '/dashboard/help', icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent-pink flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold gradient-text">VideoForge</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted hover:text-foreground hover:bg-card-hover'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive && 'text-primary')} />
                {item.label}
                {item.href === '/dashboard/projects/new' && (
                  <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
                    New
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Credits Card */}
        <div className="mt-6 mx-1 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent-pink/10 border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Credits</span>
            <span className="text-xs text-muted">Pro Plan</span>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">87</div>
          <div className="text-xs text-muted mb-3">of 100 remaining</div>
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent-pink rounded-full"
              style={{ width: '87%' }}
            />
          </div>
          <Link 
            href="/dashboard/billing"
            className="mt-3 block text-center text-xs text-primary hover:text-primary-light transition-colors"
          >
            Upgrade for more →
          </Link>
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-4 border-t border-border">
        <div className="space-y-1">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted hover:text-foreground hover:bg-card-hover'
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* User Section */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-cyan to-accent-green flex items-center justify-center text-white font-semibold text-sm">
              DU
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">Demo User</div>
              <div className="text-xs text-muted truncate">demo@videoforge.ai</div>
            </div>
            <button className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-card-hover transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
