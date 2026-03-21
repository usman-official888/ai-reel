'use client'

import { useState } from 'react'
import { CreditCard, Zap, Check, Clock, Download, ArrowUpRight, Loader2 } from 'lucide-react'
import { Header } from '@/components/layout'
import { Button, Card, Badge, Progress } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useUser, useCredits } from '@/lib/hooks'

const plans = [
  { 
    id: 'free',
    name: 'Free', 
    price: 0, 
    credits: 3,
    features: ['3 videos/month', '720p export', 'Basic voices', 'VideoForge watermark']
  },
  { 
    id: 'starter',
    name: 'Starter', 
    price: 19, 
    credits: 30,
    features: ['30 videos/month', '1080p export', 'All voices', 'No watermark', 'Email support']
  },
  { 
    id: 'pro',
    name: 'Pro', 
    price: 49, 
    credits: 100,
    features: ['100 videos/month', '4K export', 'All voices', 'Priority processing', 'API access', 'Priority support'],
    popular: true
  },
  { 
    id: 'business',
    name: 'Business', 
    price: 149, 
    credits: 500,
    features: ['500 videos/month', '4K export', 'Custom voices', 'Team accounts', 'Dedicated support', 'SLA guarantee']
  },
]

const creditPacks = [
  { credits: 10, price: 9, perCredit: 0.90 },
  { credits: 25, price: 19, perCredit: 0.76 },
  { credits: 50, price: 35, perCredit: 0.70 },
  { credits: 100, price: 59, perCredit: 0.59, popular: true },
]

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<'subscription' | 'credits' | 'history'>('subscription')
  
  // Fetch real user and credits data
  const { data: userData, loading: userLoading, error: userError } = useUser()
  const { data: creditsData, loading: creditsLoading } = useCredits()

  const currentPlan = plans.find(p => p.id === (userData?.subscription_tier || 'free')) || plans[0]
  const creditsBalance = creditsData?.balance ?? userData?.credits_balance ?? 0
  const creditsUsed = creditsData?.usedThisMonth ?? userData?.credits_used_this_month ?? 0
  const monthlyLimit = creditsData?.monthlyLimit ?? currentPlan.credits

  // Calculate renewal date (approximate - would come from subscription data in production)
  const renewalDate = userData?.subscription_expires_at 
    ? new Date(userData.subscription_expires_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Not applicable'

  // Loading state
  if (userLoading && !userData) {
    return (
      <>
        <Header
          title="Billing"
          subtitle="Manage your subscription and credits"
        />
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted">Loading billing info...</p>
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
          title="Billing"
          subtitle="Manage your subscription and credits"
        />
        <div className="p-6">
          <div className="bg-error/10 border border-error/20 rounded-xl p-6 text-center">
            <p className="text-error mb-4">Failed to load billing info: {userError}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header
        title="Billing"
        subtitle="Manage your subscription and credits"
      />

      <div className="p-6 max-w-5xl mx-auto">
        {/* Current Plan Overview */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 via-accent-pink/10 to-accent-orange/10 border-primary/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="info">Current Plan</Badge>
                <span className="text-2xl font-bold text-foreground">{currentPlan.name}</span>
              </div>
              <p className="text-muted">
                ${currentPlan.price}/month 
                {currentPlan.price > 0 && ` • Renews on ${renewalDate}`}
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">
                  {creditsLoading ? '...' : creditsBalance}
                </div>
                <div className="text-sm text-muted">Credits remaining</div>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">{monthlyLimit}</div>
                <div className="text-sm text-muted">Monthly allowance</div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted">Credits used this month</span>
              <span className="text-foreground">{creditsUsed} of {monthlyLimit}</span>
            </div>
            <Progress value={monthlyLimit > 0 ? (creditsUsed / monthlyLimit) * 100 : 0} />
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border">
          {[
            { id: 'subscription', label: 'Subscription Plans' },
            { id: 'credits', label: 'Buy Credits' },
            { id: 'history', label: 'Billing History' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === tab.id
                  ? 'text-foreground border-primary'
                  : 'text-muted border-transparent hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Subscription Plans */}
        {activeTab === 'subscription' && (
          <div className="grid md:grid-cols-4 gap-4">
            {plans.map((plan) => {
              const isCurrent = plan.id === (userData?.subscription_tier || 'free')
              
              return (
                <Card 
                  key={plan.id}
                  className={cn(
                    'relative',
                    plan.popular && 'ring-2 ring-primary',
                    isCurrent && 'bg-primary/5'
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                      POPULAR
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-foreground">${plan.price}</span>
                      <span className="text-muted">/mo</span>
                    </div>
                    <p className="text-sm text-muted mt-1">{plan.credits} credits/month</p>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted">
                        <Check className="w-4 h-4 text-success flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <Button variant="secondary" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button 
                      variant={plan.popular ? 'primary' : 'secondary'} 
                      className="w-full"
                      onClick={() => alert('Stripe checkout would open here. Integration pending.')}
                    >
                      {plan.price > currentPlan.price ? 'Upgrade' : plan.price === 0 ? 'Downgrade' : 'Switch'}
                    </Button>
                  )}
                </Card>
              )
            })}
          </div>
        )}

        {/* Buy Credits */}
        {activeTab === 'credits' && (
          <div>
            <p className="text-muted mb-6">
              Need more credits? Purchase additional credit packs that never expire.
            </p>
            
            <div className="grid md:grid-cols-4 gap-4">
              {creditPacks.map((pack) => (
                <Card 
                  key={pack.credits}
                  className={cn(
                    'relative cursor-pointer hover:border-primary transition-colors',
                    pack.popular && 'ring-2 ring-primary'
                  )}
                >
                  {pack.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                      BEST VALUE
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-3xl font-bold text-foreground">{pack.credits}</p>
                    <p className="text-sm text-muted mb-4">credits</p>
                    <p className="text-2xl font-bold text-foreground">${pack.price}</p>
                    <p className="text-xs text-muted mb-4">${pack.perCredit.toFixed(2)}/credit</p>
                    <Button 
                      variant={pack.popular ? 'primary' : 'secondary'} 
                      className="w-full"
                      onClick={() => alert('Stripe checkout would open here. Integration pending.')}
                    >
                      Buy Now
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Billing History */}
        {activeTab === 'history' && (
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Transaction History</h3>
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>

            <div className="text-center py-12 text-muted">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No billing history yet</p>
              <p className="text-sm mt-2">Your transactions will appear here once you make a purchase.</p>
            </div>
          </Card>
        )}

        {/* Payment Methods */}
        <Card className="mt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-card-hover flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-muted" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Payment Method</h3>
                <p className="text-sm text-muted">No payment method on file</p>
              </div>
            </div>
            <Button 
              variant="secondary"
              onClick={() => alert('Stripe customer portal would open here. Integration pending.')}
            >
              Add Payment Method
            </Button>
          </div>
        </Card>
      </div>
    </>
  )
}
