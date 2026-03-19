'use client'

import { useState } from 'react'
import { Youtube, Instagram, Twitter, Plus, CheckCircle, XCircle, ExternalLink, Trash2 } from 'lucide-react'
import { Header } from '@/components/layout'
import { Button, Card, Badge } from '@/components/ui'
import { mockSocialAccounts } from '@/data/mock'
import { cn } from '@/lib/utils'
import { SocialPlatform } from '@/types'

const platforms = [
  { 
    id: 'youtube' as SocialPlatform, 
    name: 'YouTube', 
    icon: Youtube, 
    color: '#FF0000',
    description: 'Upload videos directly to your channel'
  },
  { 
    id: 'tiktok' as SocialPlatform, 
    name: 'TikTok', 
    icon: ({ className }: { className?: string }) => (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
      </svg>
    ),
    color: '#000000',
    description: 'Share short-form videos'
  },
  { 
    id: 'instagram' as SocialPlatform, 
    name: 'Instagram', 
    icon: Instagram, 
    color: '#E1306C',
    description: 'Post Reels and feed videos'
  },
  { 
    id: 'twitter' as SocialPlatform, 
    name: 'X / Twitter', 
    icon: Twitter, 
    color: '#000000',
    description: 'Share video clips to your timeline'
  },
]

export default function SocialAccountsPage() {
  const [accounts, setAccounts] = useState(mockSocialAccounts)

  const connectedPlatforms = accounts.map(a => a.platform)

  const handleConnect = (platformId: SocialPlatform) => {
    // Simulate OAuth flow
    console.log('Connecting to', platformId)
  }

  const handleDisconnect = (accountId: string) => {
    setAccounts(accounts.filter(a => a.id !== accountId))
  }

  return (
    <>
      <Header
        title="Social Accounts"
        subtitle="Connect your social media accounts to publish videos directly"
      />

      <div className="p-6 max-w-4xl mx-auto">
        {/* Connected Accounts */}
        {accounts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Connected Accounts</h2>
            <div className="space-y-3">
              {accounts.map((account) => {
                const platform = platforms.find(p => p.id === account.platform)
                if (!platform) return null
                const Icon = platform.icon

                return (
                  <Card key={account.id} className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${platform.color}20` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: platform.color }} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{platform.name}</span>
                        <Badge variant={account.isActive ? 'success' : 'muted'} dot>
                          {account.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted">{account.accountHandle}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDisconnect(account.id)}
                        className="text-error hover:text-error"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Available Platforms */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {accounts.length > 0 ? 'Add More Accounts' : 'Connect Your Accounts'}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {platforms.map((platform) => {
              const isConnected = connectedPlatforms.includes(platform.id)
              const Icon = platform.icon

              return (
                <Card 
                  key={platform.id}
                  className={cn(
                    'flex items-center gap-4',
                    isConnected && 'opacity-50'
                  )}
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${platform.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: platform.color }} />
                  </div>
                  
                  <div className="flex-1">
                    <span className="font-medium text-foreground">{platform.name}</span>
                    <p className="text-sm text-muted">{platform.description}</p>
                  </div>

                  {isConnected ? (
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Connected</span>
                    </div>
                  ) : (
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleConnect(platform.id)}
                    >
                      <Plus className="w-4 h-4" />
                      Connect
                    </Button>
                  )}
                </Card>
              )
            })}
          </div>
        </div>

        {/* Info Card */}
        <Card className="mt-8 bg-info/10 border-info/20">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-info/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Secure Authentication</h3>
              <p className="text-sm text-muted">
                We use OAuth 2.0 to securely connect to your social accounts. We never store your passwords 
                and you can revoke access at any time from your account settings on each platform.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}
