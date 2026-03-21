'use client'

import { useState, useEffect } from 'react'
import { User, Bell, Shield, Key, Trash2, Save, Loader2 } from 'lucide-react'
import { Header } from '@/components/layout'
import { Button, Input, Card } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useUser, useCredits } from '@/lib/hooks'
import { userApi } from '@/lib/api-client'

type SettingsTab = 'profile' | 'notifications' | 'security' | 'api'

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'api', label: 'API Keys', icon: Key },
]

const TIER_LABELS: Record<string, { label: string; price: string; credits: string }> = {
  free: { label: 'Free Plan', price: '$0/mo', credits: '3 credits' },
  starter: { label: 'Starter Plan', price: '$19/mo', credits: '30 credits' },
  pro: { label: 'Pro Plan', price: '$49/mo', credits: '100 credits' },
  business: { label: 'Business Plan', price: '$149/mo', credits: '500 credits' },
  enterprise: { label: 'Enterprise Plan', price: 'Custom', credits: 'Unlimited' },
}

export default function SettingsPage() {
  const { data: userData, loading: userLoading, error: userError, refetch: refetchUser } = useUser()
  const { data: creditsData } = useCredits()
  
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [isSaving, setIsSaving] = useState(false)
  
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
  })

  const [notifications, setNotifications] = useState({
    emailOnComplete: true,
    emailOnFailed: true,
    emailOnPublish: false,
    emailNewsletter: false,
    pushNotifications: true,
  })

  // Update profile when user data loads
  useEffect(() => {
    if (userData) {
      setProfile({
        fullName: userData.full_name || '',
        email: userData.email || '',
      })
    }
  }, [userData])

  const handleSave = async () => {
    setIsSaving(true)
    const result = await userApi.update({ full_name: profile.fullName })
    if (result.success) {
      refetchUser()
    } else {
      alert(`Failed to save: ${result.error}`)
    }
    setIsSaving(false)
  }

  const tierInfo = TIER_LABELS[userData?.subscription_tier || 'free']

  // Loading state
  if (userLoading && !userData) {
    return (
      <>
        <Header
          title="Settings"
          subtitle="Manage your account preferences"
        />
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted">Loading settings...</p>
          </div>
        </div>
      </>
    )
  }

  // Error state
  if (userError) {
    return (
      <>
        <Header
          title="Settings"
          subtitle="Manage your account preferences"
        />
        <div className="p-6">
          <div className="bg-error/10 border border-error/20 rounded-xl p-6 text-center">
            <p className="text-error mb-4">Failed to load settings: {userError}</p>
            <Button onClick={() => refetchUser()}>Retry</Button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header
        title="Settings"
        subtitle="Manage your account preferences"
      />

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-6">
            {/* Sidebar Navigation */}
            <nav className="w-48 flex-shrink-0">
              <div className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as SettingsTab)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                        activeTab === tab.id
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted hover:text-foreground hover:bg-card'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </nav>

            {/* Content */}
            <div className="flex-1">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <Card>
                    <h3 className="text-lg font-semibold text-foreground mb-6">Profile Information</h3>
                    
                    <div className="flex items-center gap-6 mb-6">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent-pink flex items-center justify-center text-white text-2xl font-bold">
                        {profile.fullName ? profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : userData?.email?.[0].toUpperCase() || '?'}
                      </div>
                      <div>
                        <Button variant="secondary" size="sm">
                          Upload Photo
                        </Button>
                        <p className="text-xs text-muted mt-2">JPG, PNG or GIF. Max 2MB.</p>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <Input
                        label="Full Name"
                        value={profile.fullName}
                        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      />
                      <Input
                        label="Email Address"
                        type="email"
                        value={profile.email}
                        disabled
                        className="opacity-60"
                      />
                      <p className="text-xs text-muted -mt-2">Email cannot be changed</p>
                    </div>
                  </Card>

                  <Card>
                    <h3 className="text-lg font-semibold text-foreground mb-6">Subscription</h3>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-accent-pink/10 rounded-xl border border-primary/20">
                      <div>
                        <p className="font-semibold text-foreground">{tierInfo.label}</p>
                        <p className="text-sm text-muted">{tierInfo.credits}/month • {tierInfo.price}</p>
                        {creditsData && (
                          <p className="text-xs text-muted mt-1">
                            {creditsData.balance} credits remaining • {creditsData.usedThisMonth} used this month
                          </p>
                        )}
                      </div>
                      <Button variant="secondary" onClick={() => window.location.href = '/dashboard/billing'}>
                        Manage Plan
                      </Button>
                    </div>
                  </Card>

                  <div className="flex justify-end gap-3">
                    <Button variant="secondary">Cancel</Button>
                    <Button onClick={handleSave} isLoading={isSaving}>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <Card>
                    <h3 className="text-lg font-semibold text-foreground mb-6">Email Notifications</h3>
                    
                    <div className="space-y-4">
                      <ToggleSetting
                        label="Video completed"
                        description="Get notified when your video finishes processing"
                        checked={notifications.emailOnComplete}
                        onChange={(checked) => setNotifications({ ...notifications, emailOnComplete: checked })}
                      />
                      <ToggleSetting
                        label="Processing failed"
                        description="Get notified if video generation encounters an error"
                        checked={notifications.emailOnFailed}
                        onChange={(checked) => setNotifications({ ...notifications, emailOnFailed: checked })}
                      />
                      <ToggleSetting
                        label="Published to social"
                        description="Get notified when videos are published to platforms"
                        checked={notifications.emailOnPublish}
                        onChange={(checked) => setNotifications({ ...notifications, emailOnPublish: checked })}
                      />
                      <ToggleSetting
                        label="Product updates"
                        description="Receive news about new features and improvements"
                        checked={notifications.emailNewsletter}
                        onChange={(checked) => setNotifications({ ...notifications, emailNewsletter: checked })}
                      />
                    </div>
                  </Card>

                  <Card>
                    <h3 className="text-lg font-semibold text-foreground mb-6">Push Notifications</h3>
                    <ToggleSetting
                      label="Browser notifications"
                      description="Receive push notifications in your browser"
                      checked={notifications.pushNotifications}
                      onChange={(checked) => setNotifications({ ...notifications, pushNotifications: checked })}
                    />
                  </Card>

                  <div className="flex justify-end gap-3">
                    <Button variant="secondary">Cancel</Button>
                    <Button onClick={handleSave} isLoading={isSaving}>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <Card>
                    <h3 className="text-lg font-semibold text-foreground mb-6">Change Password</h3>
                    <div className="grid gap-4 max-w-md">
                      <Input
                        label="Current Password"
                        type="password"
                        placeholder="Enter current password"
                      />
                      <Input
                        label="New Password"
                        type="password"
                        placeholder="Enter new password"
                      />
                      <Input
                        label="Confirm New Password"
                        type="password"
                        placeholder="Confirm new password"
                      />
                      <Button className="w-fit">
                        Update Password
                      </Button>
                    </div>
                  </Card>

                  <Card>
                    <h3 className="text-lg font-semibold text-foreground mb-6">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-foreground">2FA is currently disabled</p>
                        <p className="text-sm text-muted">Add an extra layer of security to your account</p>
                      </div>
                      <Button variant="secondary">
                        Enable 2FA
                      </Button>
                    </div>
                  </Card>

                  <Card className="border-error/20">
                    <h3 className="text-lg font-semibold text-error mb-4">Danger Zone</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-foreground">Delete Account</p>
                        <p className="text-sm text-muted">Permanently delete your account and all data</p>
                      </div>
                      <Button variant="danger">
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                      </Button>
                    </div>
                  </Card>
                </div>
              )}

              {/* API Keys Tab */}
              {activeTab === 'api' && (
                <div className="space-y-6">
                  <Card>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">API Keys</h3>
                        <p className="text-sm text-muted">Manage your API keys for programmatic access</p>
                      </div>
                      <Button>
                        Generate New Key
                      </Button>
                    </div>

                    <div className="text-center py-8 text-muted">
                      <p>No API keys created yet.</p>
                      <p className="text-sm mt-2">Generate a key to integrate with the VideoForge API.</p>
                    </div>
                  </Card>

                  <Card>
                    <h3 className="text-lg font-semibold text-foreground mb-4">API Documentation</h3>
                    <p className="text-muted mb-4">
                      Learn how to integrate VideoForge AI into your applications with our comprehensive API documentation.
                    </p>
                    <Button variant="secondary">
                      View Documentation →
                    </Button>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function ToggleSetting({ 
  label, 
  description, 
  checked, 
  onChange 
}: { 
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div>
        <p className="text-foreground">{label}</p>
        <p className="text-sm text-muted">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors',
          checked ? 'bg-primary' : 'bg-border'
        )}
      >
        <span
          className={cn(
            'absolute top-1 w-4 h-4 bg-white rounded-full transition-all',
            checked ? 'left-6' : 'left-1'
          )}
        />
      </button>
    </div>
  )
}
