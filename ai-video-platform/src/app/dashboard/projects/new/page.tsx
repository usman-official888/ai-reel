'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Wand2, 
  FileText, 
  Image, 
  Video, 
  Mic, 
  Check,
  Loader2,
  Play,
  RefreshCw
} from 'lucide-react'
import { Header } from '@/components/layout'
import { Button, Input, Textarea, Card, Progress } from '@/components/ui'
import { cn } from '@/lib/utils'

type Step = 'topic' | 'style' | 'preview' | 'generate'

interface VideoSettings {
  topic: string
  style: 'documentary' | 'tutorial' | 'story' | 'review' | 'explainer'
  duration: '30s' | '60s' | '90s' | '120s'
  voice: 'professional' | 'casual' | 'energetic' | 'calm'
  aspectRatio: '16:9' | '9:16' | '1:1'
}

const styles = [
  { id: 'documentary', label: 'Documentary', description: 'Informative narration with cinematic visuals', icon: '🎬' },
  { id: 'tutorial', label: 'Tutorial', description: 'Step-by-step educational content', icon: '📚' },
  { id: 'story', label: 'Story', description: 'Narrative-driven engaging content', icon: '📖' },
  { id: 'review', label: 'Review', description: 'Analysis and opinion-based format', icon: '⭐' },
  { id: 'explainer', label: 'Explainer', description: 'Simple explanations of complex topics', icon: '💡' },
]

const durations = [
  { id: '30s', label: '30 seconds', scenes: '3 scenes' },
  { id: '60s', label: '1 minute', scenes: '6 scenes' },
  { id: '90s', label: '1.5 minutes', scenes: '9 scenes' },
  { id: '120s', label: '2 minutes', scenes: '12 scenes' },
]

const voices = [
  { id: 'professional', label: 'Professional', description: 'Clear, authoritative tone' },
  { id: 'casual', label: 'Casual', description: 'Friendly, conversational style' },
  { id: 'energetic', label: 'Energetic', description: 'Upbeat, enthusiastic delivery' },
  { id: 'calm', label: 'Calm', description: 'Soothing, relaxed narration' },
]

const aspectRatios = [
  { id: '16:9', label: 'Landscape', description: 'YouTube, Desktop', icon: '🖥️' },
  { id: '9:16', label: 'Portrait', description: 'TikTok, Reels, Shorts', icon: '📱' },
  { id: '1:1', label: 'Square', description: 'Instagram, Facebook', icon: '⬛' },
]

export default function NewProjectPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>('topic')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationStatus, setGenerationStatus] = useState('')
  
  const [settings, setSettings] = useState<VideoSettings>({
    topic: '',
    style: 'documentary',
    duration: '60s',
    voice: 'professional',
    aspectRatio: '16:9',
  })

  const [generatedScript, setGeneratedScript] = useState<{
    title: string
    scenes: { narration: string; imagePrompt: string }[]
  } | null>(null)

  const steps = [
    { id: 'topic', label: 'Topic', icon: Wand2 },
    { id: 'style', label: 'Style', icon: FileText },
    { id: 'preview', label: 'Preview', icon: Image },
    { id: 'generate', label: 'Generate', icon: Video },
  ]

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)

  const handleNext = () => {
    if (currentStep === 'topic' && !settings.topic.trim()) return
    
    if (currentStep === 'topic') setCurrentStep('style')
    else if (currentStep === 'style') {
      // Simulate script generation
      simulateScriptGeneration()
    }
    else if (currentStep === 'preview') {
      // Start video generation
      startVideoGeneration()
    }
  }

  const handleBack = () => {
    if (currentStep === 'style') setCurrentStep('topic')
    else if (currentStep === 'preview') setCurrentStep('style')
  }

  const simulateScriptGeneration = () => {
    setIsGenerating(true)
    setGenerationStatus('Generating script with AI...')
    
    setTimeout(() => {
      setGeneratedScript({
        title: settings.topic.slice(0, 50) + (settings.topic.length > 50 ? '...' : ''),
        scenes: [
          { narration: 'Welcome to our exploration of this fascinating topic. Today, we\'ll dive deep into the subject matter.', imagePrompt: 'Cinematic opening shot, dramatic lighting, establishing scene' },
          { narration: 'Let\'s start by understanding the fundamental concepts that form the foundation of our discussion.', imagePrompt: 'Educational visualization, clear graphics, professional presentation' },
          { narration: 'As we progress, you\'ll discover the key insights that make this topic so compelling.', imagePrompt: 'Dynamic visual representation, engaging imagery, modern style' },
          { narration: 'Here\'s where things get really interesting. The implications are far-reaching and significant.', imagePrompt: 'Dramatic reveal moment, impactful visuals, cinematic composition' },
          { narration: 'Now let\'s examine the practical applications and real-world examples of these concepts.', imagePrompt: 'Real-world scenarios, practical demonstrations, relatable imagery' },
          { narration: 'In conclusion, we\'ve covered the essential aspects of this important topic. Thank you for watching!', imagePrompt: 'Closing scene, call to action, professional outro' },
        ],
      })
      setIsGenerating(false)
      setCurrentStep('preview')
    }, 2000)
  }

  const startVideoGeneration = () => {
    setCurrentStep('generate')
    setIsGenerating(true)
    
    const stages = [
      { progress: 10, status: 'Generating images for scenes...' },
      { progress: 30, status: 'Creating video clips from images...' },
      { progress: 50, status: 'Generating voiceover narration...' },
      { progress: 70, status: 'Synchronizing audio and video...' },
      { progress: 85, status: 'Adding captions and effects...' },
      { progress: 95, status: 'Finalizing video...' },
      { progress: 100, status: 'Complete!' },
    ]

    let i = 0
    const interval = setInterval(() => {
      if (i < stages.length) {
        setGenerationProgress(stages[i].progress)
        setGenerationStatus(stages[i].status)
        i++
      } else {
        clearInterval(interval)
        setIsGenerating(false)
      }
    }, 1500)
  }

  return (
    <>
      <Header
        title="Create New Video"
        subtitle="Transform your idea into a fully produced video"
        actions={
          <Link href="/dashboard/projects">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4" />
              Cancel
            </Button>
          </Link>
        }
      />

      <div className="p-6 max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
            <div 
              className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500"
              style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            />
            
            {steps.map((step, index) => {
              const Icon = step.icon
              const isCompleted = index < currentStepIndex
              const isCurrent = index === currentStepIndex

              return (
                <div key={step.id} className="relative flex flex-col items-center z-10">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                      isCompleted && 'bg-primary text-white',
                      isCurrent && 'bg-primary text-white ring-4 ring-primary/20',
                      !isCompleted && !isCurrent && 'bg-card border-2 border-border text-muted'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={cn(
                    'mt-2 text-sm font-medium',
                    isCurrent ? 'text-foreground' : 'text-muted'
                  )}>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {/* Step 1: Topic */}
          {currentStep === 'topic' && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent-pink mx-auto mb-4 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">What's your video about?</h2>
                <p className="text-muted">Describe your topic and our AI will handle the rest</p>
              </div>

              <div className="max-w-2xl mx-auto">
                <Textarea
                  placeholder="e.g., Create a documentary-style video about the history and construction of the Egyptian pyramids, covering the mysteries and theories about how they were built..."
                  value={settings.topic}
                  onChange={(e) => setSettings({ ...settings, topic: e.target.value })}
                  className="min-h-[160px] text-lg"
                />
                <p className="text-sm text-muted mt-2">
                  Tip: Be specific about the style, tone, and key points you want to cover
                </p>

                {/* Example Topics */}
                <div className="mt-6">
                  <p className="text-sm font-medium text-foreground mb-3">Or try an example:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'History of Ancient Rome',
                      'How AI is Changing Healthcare',
                      'Top 10 Travel Destinations',
                      'Beginner\'s Guide to Investing',
                    ].map((example) => (
                      <button
                        key={example}
                        onClick={() => setSettings({ ...settings, topic: example })}
                        className="px-3 py-1.5 rounded-lg bg-card border border-border text-sm text-muted hover:text-foreground hover:border-border-light transition-colors"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Style */}
          {currentStep === 'style' && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">Customize your video</h2>
                <p className="text-muted">Choose the style, duration, and voice for your video</p>
              </div>

              <div className="space-y-8 max-w-3xl mx-auto">
                {/* Video Style */}
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3">Video Style</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {styles.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSettings({ ...settings, style: style.id as VideoSettings['style'] })}
                        className={cn(
                          'p-4 rounded-xl border text-center transition-all',
                          settings.style === style.id
                            ? 'border-primary bg-primary/10 ring-1 ring-primary'
                            : 'border-border bg-card hover:border-border-light'
                        )}
                      >
                        <span className="text-2xl mb-2 block">{style.icon}</span>
                        <span className="text-sm font-medium text-foreground block">{style.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3">Duration</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {durations.map((duration) => (
                      <button
                        key={duration.id}
                        onClick={() => setSettings({ ...settings, duration: duration.id as VideoSettings['duration'] })}
                        className={cn(
                          'p-4 rounded-xl border text-left transition-all',
                          settings.duration === duration.id
                            ? 'border-primary bg-primary/10 ring-1 ring-primary'
                            : 'border-border bg-card hover:border-border-light'
                        )}
                      >
                        <span className="text-lg font-semibold text-foreground block">{duration.label}</span>
                        <span className="text-xs text-muted">{duration.scenes}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Voice & Aspect Ratio */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-3">Voice Style</h3>
                    <div className="space-y-2">
                      {voices.map((voice) => (
                        <button
                          key={voice.id}
                          onClick={() => setSettings({ ...settings, voice: voice.id as VideoSettings['voice'] })}
                          className={cn(
                            'w-full p-3 rounded-xl border text-left transition-all flex items-center gap-3',
                            settings.voice === voice.id
                              ? 'border-primary bg-primary/10 ring-1 ring-primary'
                              : 'border-border bg-card hover:border-border-light'
                          )}
                        >
                          <Mic className={cn('w-5 h-5', settings.voice === voice.id ? 'text-primary' : 'text-muted')} />
                          <div>
                            <span className="text-sm font-medium text-foreground block">{voice.label}</span>
                            <span className="text-xs text-muted">{voice.description}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-3">Aspect Ratio</h3>
                    <div className="space-y-2">
                      {aspectRatios.map((ratio) => (
                        <button
                          key={ratio.id}
                          onClick={() => setSettings({ ...settings, aspectRatio: ratio.id as VideoSettings['aspectRatio'] })}
                          className={cn(
                            'w-full p-3 rounded-xl border text-left transition-all flex items-center gap-3',
                            settings.aspectRatio === ratio.id
                              ? 'border-primary bg-primary/10 ring-1 ring-primary'
                              : 'border-border bg-card hover:border-border-light'
                          )}
                        >
                          <span className="text-xl">{ratio.icon}</span>
                          <div>
                            <span className="text-sm font-medium text-foreground block">{ratio.label}</span>
                            <span className="text-xs text-muted">{ratio.description}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Preview */}
          {currentStep === 'preview' && generatedScript && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">Review your script</h2>
                <p className="text-muted">AI has generated a script based on your topic</p>
              </div>

              <div className="max-w-3xl mx-auto">
                <Card className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">{generatedScript.title}</h3>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep('style')}>
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Regenerate
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {generatedScript.scenes.map((scene, index) => (
                      <div key={index} className="p-4 bg-background rounded-lg border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-medium flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium text-foreground">Scene {index + 1}</span>
                        </div>
                        <p className="text-sm text-foreground mb-2">{scene.narration}</p>
                        <p className="text-xs text-muted">
                          <span className="text-accent-cyan">Visual:</span> {scene.imagePrompt}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Cost Estimate */}
                <Card className="bg-gradient-to-r from-primary/10 to-accent-pink/10 border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Estimated Cost</h4>
                      <p className="text-sm text-muted">Based on {generatedScript.scenes.length} scenes</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-foreground">1</span>
                      <span className="text-muted ml-1">credit</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Step 4: Generate */}
          {currentStep === 'generate' && (
            <div className="animate-fade-in text-center">
              <div className="max-w-md mx-auto">
                {isGenerating ? (
                  <>
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent-pink mx-auto mb-6 flex items-center justify-center">
                      <Loader2 className="w-10 h-10 text-white animate-spin" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Creating your video</h2>
                    <p className="text-muted mb-8">{generationStatus}</p>
                    <Progress value={generationProgress} showLabel className="mb-4" />
                    <p className="text-sm text-muted">This usually takes about 2 minutes</p>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-success to-accent-cyan mx-auto mb-6 flex items-center justify-center">
                      <Check className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Your video is ready!</h2>
                    <p className="text-muted mb-8">You can now preview, download, or publish your video</p>
                    
                    <div className="flex justify-center gap-3">
                      <Button variant="secondary" onClick={() => router.push('/dashboard/projects')}>
                        View All Videos
                      </Button>
                      <Button onClick={() => router.push('/dashboard/projects/proj-1')}>
                        <Play className="w-4 h-4" />
                        Watch Video
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        {currentStep !== 'generate' && (
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 'topic'}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={(currentStep === 'topic' && !settings.topic.trim()) || isGenerating}
              isLoading={isGenerating}
            >
              {currentStep === 'preview' ? (
                <>
                  Generate Video
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
