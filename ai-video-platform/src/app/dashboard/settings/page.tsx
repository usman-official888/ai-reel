'use client'

import { useState } from 'react'
import { User, Bell, Shield, Palette, Globe, CreditCard, Key, Trash2, Save } from 'lucide-react'
import { Header } from '@/components/layout'
import { Button, Input, Card } from '@/components/ui'
import { cn } from '@/lib/utils'
import { mockUser } from '@/data/mock'

type SettingsTab = 'profile' | 'notifications' | 'security' | 'api'

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'api', label: 'API Keys', icon: Key },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [isSaving, setIsSaving] = useState(false)
  
  const [profile, setProfile] = useState({
    fullName: mockUser.fullName,
    email: mockUser.email,
  })

  const [notifications, setNotifications] = useState({
    emailOnComplete: true,
    emailOnFailed: true,
    emailOnPublish: false,
    emailNewsletter: false,
    pushNotifications: true,
  })

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => setIsSaving(false), 1000)
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
                        {profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
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
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      />
                    </div>
                  </Card>

                  <Card>
                    <h3 className="text-lg font-semibold text-foreground mb-6">Subscription</h3>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-accent-pink/10 rounded-xl border border-primary/20">
                      <div>
                        <p className="font-semibold text-foreground">Pro Plan</p>
                        <p className="text-sm text-muted">100 credits/month • $49/mo</p>
                      </div>
                      <Button variant="secondary">
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

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-card-hover rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">Production Key</p>
                          <p className="text-sm text-muted font-mono">vf_live_****************************abcd</p>
                          <p className="text-xs text-muted mt-1">Created Mar 1, 2024 • Last used 2 hours ago</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">Copy</Button>
                          <Button variant="ghost" size="sm" className="text-error">Revoke</Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-card-hover rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">Development Key</p>
                          <p className="text-sm text-muted font-mono">vf_test_****************************efgh</p>
                          <p className="text-xs text-muted mt-1">Created Feb 15, 2024 • Never used</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">Copy</Button>
                          <Button variant="ghost" size="sm" className="text-error">Revoke</Button>
                        </div>
                      </div>
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
