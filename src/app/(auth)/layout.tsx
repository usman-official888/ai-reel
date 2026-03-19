import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-accent-pink/10 to-background p-12 flex-col justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent-pink flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold gradient-text">VideoForge</span>
        </Link>

        <div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Transform Ideas Into
            <span className="block gradient-text">Stunning Videos</span>
          </h1>
          <p className="text-lg text-muted max-w-md">
            AI-powered video generation that turns any topic into professional,
            YouTube-ready content in minutes.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold text-foreground">10K+</div>
              <div className="text-sm text-muted">Videos Created</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">5K+</div>
              <div className="text-sm text-muted">Happy Creators</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">4.9★</div>
              <div className="text-sm text-muted">User Rating</div>
            </div>
          </div>
        </div>

        <div className="text-sm text-muted">
          © 2024 VideoForge AI. All rights reserved.
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent-pink flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">VideoForge</span>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
