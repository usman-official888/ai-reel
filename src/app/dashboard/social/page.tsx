'use client'

import { useState } from 'react'
import { Youtube, Instagram, Twitter, Plus, CheckCircle, ExternalLink, Trash2, Loader2 } from 'lucide-react'
import { Header } from '@/components/layout'
import { Button, Card, Badge } from '@/components/ui'
import { useSocialAccounts } from '@/lib/hooks'
import { socialApi } from '@/lib/api-client'
import { cn } from '@/lib/utils'

const platforms = [
  { 
    id: 'youtube', 
    name: 'YouTube', 
    icon: Youtube, 
    color: '#FF0000',
    description: 'Upload videos directly to your channel'
  },
  { 
    id: 'tiktok', 
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
    id: 'instagram', 
    name: 'Instagram', 
    icon: Instagram, 
    color: '#E1306C',
    description: 'Post Reels and feed videos'
  },
  { 
    id: 'twitter', 
    name: 'X / Twitter', 
    icon: Twitter, 
    color: '#000000',
    description: 'Share video clips to your timeline'
  },
]

export default function SocialAccountsPage() {
  const { data: socialData, loading, error, refetch } = useSocialAccounts()
  const [disconnecting, setDisconnecting] = useState<string | null>(null)
  const [connecting, setConnecting] = useState<string | null>(null)

  const accounts = socialData?.accounts || []
  const connectedPlatforms = accounts.map(a => a.platform)

  const handleConnect = async (platformId: string) => {
    setConnecting(platformId)
    // In a real implementation, this would open OAuth flow
    // For now, we'll show a message
    alert(`OAuth flow for ${platformId} would open here. This requires setting up OAuth credentials for each platform.`)
    setConnecting(null)
  }

  const handleDisconnect = async (platform: string) => {
    if (!confirm(`Are you sure you want to disconnect your ${platform} account?`)) return
    
    setDisconnecting(platform)
    const result = await socialApi.disconnect(platform)
    if (result.success) {
      refetch()
    } else {
      alert(`Failed to disconnect: ${result.error}`)
    }
    setDisconnecting(null)
  }

  // Loading state
  if (loading && !socialData) {
    return (
      <>
        <Header
          title="Social Accounts"
          subtitle="Connect your social media accounts to publish videos directly"
        />
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted">Loading accounts...</p>
          </div>
        </div>
      </>
    )
  }

  // Error state
  if (error) {
    return (
      <>
        <Header
          title="Social Accounts"
          subtitle="Connect your social media accounts to publish videos directly"
        />
        <div className="p-6">
          <div className="bg-error/10 border border-error/20 rounded-xl p-6 text-center">
            <p className="text-error mb-4">Failed to load accounts: {error}</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        </div>
      </>
    )
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
                        <Badge variant={account.is_active ? 'success' : 'muted'} dot>
                          {account.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted">
                        {account.account_name || account.account_handle}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDisconnect(account.platform)}
                        disabled={disconnecting === account.platform}
                        className="text-error hover:text-error"
                      >
                        {disconnecting === account.platform ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
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
                      disabled={connecting === platform.id}
                    >
                      {connecting === platform.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
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
