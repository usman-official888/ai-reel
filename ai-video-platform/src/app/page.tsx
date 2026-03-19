import Link from 'next/link'
import { 
  Sparkles, 
  Play, 
  Zap, 
  Clock, 
  Share2, 
  CheckCircle,
  ArrowRight,
  Video,
  Mic,
  Image,
  FileText,
  Youtube,
  Instagram,
  Twitter,
  Star
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent-pink flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">VideoForge</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-muted hover:text-foreground transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm text-muted hover:text-foreground transition-colors">How it Works</Link>
            <Link href="#pricing" className="text-sm text-muted hover:text-foreground transition-colors">Pricing</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-muted hover:text-foreground transition-colors">
              Log in
            </Link>
            <Link 
              href="/dashboard" 
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              AI-Powered Video Generation
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Turn Any Topic Into
              <span className="block gradient-text">Stunning Videos</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-muted mb-10 max-w-2xl mx-auto">
              From idea to YouTube-ready video in minutes. Our AI writes scripts, generates visuals, 
              creates voiceovers, and publishes to social media automatically.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link 
                href="/dashboard/projects/new"
                className="px-8 py-4 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover shadow-glow hover:shadow-glow-lg transition-all flex items-center gap-2"
              >
                Start Creating Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="px-8 py-4 rounded-xl bg-card border border-border text-foreground font-semibold hover:bg-card-hover hover:border-border-light transition-all flex items-center gap-2">
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-8 text-sm text-muted">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent-pink border-2 border-background" />
                  ))}
                </div>
                <span>10,000+ creators</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                ))}
                <span className="ml-1">4.9/5 rating</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Video Preview */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="rounded-2xl overflow-hidden border border-border shadow-2xl shadow-primary/10">
              <div className="aspect-video bg-gradient-to-br from-card to-card-hover flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-4 cursor-pointer hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                  <p className="text-muted">See VideoForge in action</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Everything You Need</h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              A complete AI video production pipeline that handles every step from ideation to publication
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: FileText, title: 'AI Script Writing', description: 'Generate engaging scripts from any topic using advanced language models', color: 'text-primary' },
              { icon: Image, title: 'Image Generation', description: 'Create stunning visuals for each scene with state-of-the-art AI', color: 'text-accent-cyan' },
              { icon: Video, title: 'Video Synthesis', description: 'Transform static images into dynamic video clips with smooth motion', color: 'text-accent-pink' },
              { icon: Mic, title: 'AI Voiceover', description: 'Professional narration in multiple voices and languages', color: 'text-accent-orange' },
              { icon: Zap, title: 'Auto Captions', description: 'Accurate subtitles generated and synced automatically', color: 'text-success' },
              { icon: Share2, title: 'Multi-Platform Publish', description: 'One-click publishing to YouTube, TikTok, Instagram & X', color: 'text-info' },
            ].map((feature, index) => (
              <div 
                key={index}
                className="p-6 rounded-2xl bg-card border border-border hover:border-border-light transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl bg-card-hover flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Create professional videos in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Enter Your Topic', description: 'Describe what you want your video about. Be as detailed or simple as you like.' },
              { step: '02', title: 'Customize Style', description: 'Choose video style, duration, voice, and aspect ratio for your target platform.' },
              { step: '03', title: 'Generate & Publish', description: 'AI creates your video in minutes. Review, edit if needed, and publish anywhere.' },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-8xl font-bold text-border absolute -top-4 -left-2 select-none">
                  {item.step}
                </div>
                <div className="relative pt-16 pl-4">
                  <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Simple Pricing</h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { name: 'Free', price: '$0', period: 'forever', videos: '3 videos/month', features: ['720p export', 'Basic voices', 'VideoForge watermark'] },
              { name: 'Starter', price: '$19', period: '/month', videos: '30 videos/month', features: ['1080p export', 'All voices', 'No watermark', 'Email support'], popular: false },
              { name: 'Pro', price: '$49', period: '/month', videos: '100 videos/month', features: ['4K export', 'All voices', 'Priority processing', 'API access', 'Priority support'], popular: true },
              { name: 'Business', price: '$149', period: '/month', videos: '500 videos/month', features: ['4K export', 'Custom voices', 'Team accounts', 'Dedicated support', 'SLA guarantee'] },
            ].map((plan, index) => (
              <div 
                key={index}
                className={`p-6 rounded-2xl border transition-all ${
                  plan.popular 
                    ? 'bg-gradient-to-b from-primary/10 to-card border-primary ring-1 ring-primary scale-105' 
                    : 'bg-card border-border hover:border-border-light'
                }`}
              >
                {plan.popular && (
                  <div className="text-xs font-semibold text-primary mb-4">MOST POPULAR</div>
                )}
                <h3 className="text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted">{plan.period}</span>
                </div>
                <p className="text-sm text-muted mb-6">{plan.videos}</p>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/dashboard"
                  className={`block text-center py-3 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? 'bg-primary text-white hover:bg-primary-hover'
                      : 'bg-card-hover text-foreground hover:bg-border'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Platforms */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-8">Publish to All Major Platforms</h2>
          <div className="flex items-center justify-center gap-12 flex-wrap">
            <div className="flex items-center gap-3 text-muted">
              <Youtube className="w-10 h-10" />
              <span className="text-lg font-medium">YouTube</span>
            </div>
            <div className="flex items-center gap-3 text-muted">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
              </svg>
              <span className="text-lg font-medium">TikTok</span>
            </div>
            <div className="flex items-center gap-3 text-muted">
              <Instagram className="w-10 h-10" />
              <span className="text-lg font-medium">Instagram</span>
            </div>
            <div className="flex items-center gap-3 text-muted">
              <Twitter className="w-10 h-10" />
              <span className="text-lg font-medium">X / Twitter</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-r from-primary via-accent-pink to-accent-orange p-px">
            <div className="rounded-3xl bg-background p-12 text-center">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Ready to Create Amazing Videos?
              </h2>
              <p className="text-muted text-lg mb-8 max-w-xl mx-auto">
                Join thousands of creators using VideoForge AI to produce professional content in minutes.
              </p>
              <Link 
                href="/dashboard/projects/new"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover shadow-glow hover:shadow-glow-lg transition-all"
              >
                Start Creating Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-sm text-muted mt-4">No credit card required • 3 free videos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent-pink flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground">VideoForge AI</span>
            </div>

            <div className="flex items-center gap-8 text-sm text-muted">
              <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
              <Link href="#" className="hover:text-foreground transition-colors">API Docs</Link>
            </div>

            <p className="text-sm text-muted">© 2024 VideoForge AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
