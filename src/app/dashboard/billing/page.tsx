'use client'

import { useState } from 'react'
import { CreditCard, Zap, Check, Clock, Download, ArrowUpRight } from 'lucide-react'
import { Header } from '@/components/layout'
import { Button, Card, Badge, Progress } from '@/components/ui'
import { mockUser } from '@/data/mock'
import { cn } from '@/lib/utils'

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

const billingHistory = [
  { id: 1, date: 'Mar 1, 2024', description: 'Pro Plan - Monthly', amount: 49.00, status: 'paid' },
  { id: 2, date: 'Feb 1, 2024', description: 'Pro Plan - Monthly', amount: 49.00, status: 'paid' },
  { id: 3, date: 'Jan 15, 2024', description: '50 Credit Pack', amount: 35.00, status: 'paid' },
  { id: 4, date: 'Jan 1, 2024', description: 'Pro Plan - Monthly', amount: 49.00, status: 'paid' },
]

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<'subscription' | 'credits' | 'history'>('subscription')
  const currentPlan = plans.find(p => p.id === mockUser.subscriptionTier) || plans[2]

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
                ${currentPlan.price}/month • Renews on April 1, 2024
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">{mockUser.creditsBalance}</div>
                <div className="text-sm text-muted">Credits remaining</div>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">{currentPlan.credits}</div>
                <div className="text-sm text-muted">Monthly allowance</div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted">Credits used this month</span>
              <span className="text-foreground">{currentPlan.credits - mockUser.creditsBalance} of {currentPlan.credits}</span>
            </div>
            <Progress value={((currentPlan.credits - mockUser.creditsBalance) / currentPlan.credits) * 100} />
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
              const isCurrent = plan.id === mockUser.subscriptionTier
              
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
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-success flex-shrink-0" />
                        <span className="text-muted">{feature}</span>
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
                    >
                      {plan.price > currentPlan.price ? 'Upgrade' : 'Downgrade'}
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
              Need more credits? Purchase additional credit packs to use anytime.
            </p>
            
            <div className="grid md:grid-cols-4 gap-4">
              {creditPacks.map((pack, index) => (
                <Card 
                  key={index}
                  className={cn(
                    'text-center',
                    pack.popular && 'ring-2 ring-primary'
                  )}
                >
                  {pack.popular && (
                    <Badge variant="info" className="mb-3">Best Value</Badge>
                  )}
                  
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {pack.credits}
                  </div>
                  <div className="text-sm text-muted mb-4">credits</div>
                  
                  <div className="text-2xl font-semibold text-foreground mb-1">
                    ${pack.price}
                  </div>
                  <div className="text-xs text-muted mb-6">
                    ${pack.perCredit.toFixed(2)} per credit
                  </div>
                  
                  <Button variant={pack.popular ? 'primary' : 'secondary'} className="w-full">
                    Purchase
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Billing History */}
        {activeTab === 'history' && (
          <div>
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Transaction History</h3>
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
              
              <div className="space-y-4">
                {billingHistory.map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-card-hover flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-muted" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.description}</p>
                        <p className="text-sm text-muted">{item.date}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Badge variant="success">Paid</Badge>
                      <span className="font-semibold text-foreground">${item.amount.toFixed(2)}</span>
                      <Button variant="ghost" size="sm">
                        <ArrowUpRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Payment Method */}
            <Card className="mt-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Payment Method</h3>
              <div className="flex items-center justify-between p-4 bg-card-hover rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 rounded bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center text-white text-xs font-bold">
                    VISA
                  </div>
                  <div>
                    <p className="font-medium text-foreground">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted">Expires 12/2025</p>
                  </div>
                </div>
                <Button variant="secondary" size="sm">
                  Update
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </>
  )
}
