# VideoForge AI - Frontend Dashboard

A modern, production-ready Next.js 14 frontend for an AI-powered video generation platform. This dashboard provides a complete UI for creating, managing, and publishing AI-generated videos.

![VideoForge AI](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)

## 🚀 Features

### Dashboard
- **Overview Dashboard** - Stats, recent projects, activity feed, quick actions
- **Projects List** - Grid/list view, filters, search, status badges
- **Project Detail** - Video preview, scenes breakdown, job tracking
- **Create Video Wizard** - 4-step flow (topic → style → preview → generate)
- **Analytics** - Views, engagement, platform breakdown, top videos
- **Billing** - Plans, credit packs, transaction history
- **Settings** - Profile, notifications, security, API keys
- **Social Accounts** - Connect YouTube, TikTok, Instagram, X

### UI Components
- Button, Input, Textarea, Card, Badge, Progress, Avatar, EmptyState
- Dark theme with purple accent gradients
- Glass morphism effects
- Smooth animations and transitions

## 📁 Project Structure

```
ai-video-platform/
├── src/
│   ├── app/
│   │   ├── globals.css          # Global styles
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Landing page
│   │   └── dashboard/
│   │       ├── layout.tsx       # Dashboard layout with sidebar
│   │       ├── page.tsx         # Dashboard home
│   │       ├── projects/
│   │       │   ├── page.tsx     # Projects list
│   │       │   ├── new/page.tsx # Create wizard
│   │       │   └── [id]/page.tsx # Project detail
│   │       ├── analytics/page.tsx
│   │       ├── billing/page.tsx
│   │       ├── settings/page.tsx
│   │       └── social/page.tsx
│   ├── components/
│   │   ├── ui/                  # Reusable UI components
│   │   ├── layout/              # Sidebar, Header
│   │   └── dashboard/           # Dashboard-specific components
│   ├── lib/
│   │   └── utils.ts             # Utility functions
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   └── data/
│       └── mock.ts              # Mock data for development
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

## 🛠️ Getting Started

### Prerequisites
- Node.js 18.x or later
- npm or yarn

### Installation

1. **Extract the project** (if zipped):
   ```bash
   unzip ai-video-platform.zip
   cd ai-video-platform
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 🎨 Design System

### Colors
| Name | Value | Usage |
|------|-------|-------|
| Background | `#09090b` | Page background |
| Card | `#18181b` | Card backgrounds |
| Primary | `#8b5cf6` | Primary actions, accents |
| Accent Cyan | `#06b6d4` | Secondary accent |
| Accent Pink | `#ec4899` | Gradient accent |
| Accent Orange | `#f97316` | Warning, gradient |

### Typography
- **Font**: Space Grotesk (display), JetBrains Mono (code)
- **Weights**: 400, 500, 600, 700

### Components
All components follow a consistent API:
```tsx
<Button variant="primary" size="md" isLoading={false}>
  Click me
</Button>

<Badge variant="success" dot>
  Active
</Badge>

<Card hover gradient>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

## 🔌 API Integration Points

The frontend is designed to connect to backend APIs. Key integration points:

### Authentication
```typescript
// src/lib/auth.ts (to be implemented)
export async function signIn(email: string, password: string)
export async function signOut()
export async function getSession()
```

### Projects API
```typescript
// Expected endpoints:
GET    /api/projects           // List projects
POST   /api/projects           // Create project
GET    /api/projects/:id       // Get project
DELETE /api/projects/:id       // Delete project
POST   /api/projects/:id/generate  // Start generation
```

### Video Generation
```typescript
// WebSocket for real-time progress
ws://api/projects/:id/progress

// Events:
{ type: 'job_started', job: 'script' }
{ type: 'job_progress', job: 'image', progress: 45 }
{ type: 'job_completed', job: 'video' }
{ type: 'generation_complete', outputUrl: '...' }
```

## 📝 Environment Variables

Create a `.env.local` file:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Supabase (Authentication & Database)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AI Providers (server-side only)
GROQ_API_KEY=your-groq-key
FAL_API_KEY=your-fal-key
FISH_AUDIO_API_KEY=your-fish-audio-key

# Payments (server-side only)
STRIPE_SECRET_KEY=your-stripe-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret

# Social OAuth
YOUTUBE_CLIENT_ID=your-youtube-client-id
YOUTUBE_CLIENT_SECRET=your-youtube-secret
TIKTOK_CLIENT_KEY=your-tiktok-key
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📋 Next Steps

To complete the platform, you'll need to:

1. **Backend API** - Implement the REST API endpoints
2. **Database** - Set up Supabase tables (users, projects, jobs, etc.)
3. **Authentication** - Integrate Supabase Auth
4. **AI Pipeline** - Connect Groq, Fal.ai, Fish.audio APIs
5. **Video Processing** - Set up FFmpeg server
6. **Storage** - Configure AWS S3 for video storage
7. **Payments** - Integrate Stripe checkout
8. **Social OAuth** - Implement platform connections

## 📄 License

MIT License - feel free to use for personal or commercial projects.

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
