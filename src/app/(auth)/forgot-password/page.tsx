'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui'
import { createBrowserSupabaseClient } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const supabase = createBrowserSupabaseClient()
      
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (resetError) {
        throw resetError
      }

      setSuccess(true)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Check your email</h2>
        <p className="text-muted mb-6">
          We've sent password reset instructions to <strong className="text-foreground">{email}</strong>
        </p>
        <p className="text-sm text-muted mb-8">
          If you don't see the email, check your spam folder.
        </p>
        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open('https://gmail.com', '_blank')}
          >
            Open Gmail
          </Button>
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary-light transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to sign in
      </Link>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground">Forgot password?</h2>
        <p className="text-muted mt-2">
          No worries, we'll send you reset instructions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-3 text-foreground placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : (
            'Reset password'
          )}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Remember your password?{' '}
        <Link
          href="/login"
          className="text-primary hover:text-primary-light font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
