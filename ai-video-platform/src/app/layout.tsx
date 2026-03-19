import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VideoForge AI - Automated Video Generation Platform',
  description: 'Transform any topic into YouTube-ready videos with AI. Automated script writing, image generation, video synthesis, and voiceover.',
  keywords: ['AI video', 'video automation', 'content creation', 'YouTube automation', 'AI content'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
