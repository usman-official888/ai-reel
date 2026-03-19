/**
 * Video Generation Pipeline Service
 * Orchestrates the complete video generation process:
 * 1. Script Generation (Groq)
 * 2. Image Generation (Fal.ai Flux)
 * 3. Video Generation (Fal.ai LTX)
 * 4. Voice Generation (Fish.audio)
 * 5. Final Assembly (FFmpeg)
 */

import {
  generateScript,
  ScriptGenerationOptions,
  GeneratedScript,
  Scene,
} from '../ai/groq'
import {
  generateImage,
  generateVideo,
  queueVideoGeneration,
  checkQueueStatus,
  enhanceImagePrompt,
  ASPECT_RATIOS,
} from '../ai/fal'
import {
  generateSpeech,
  prepareTextForTTS,
  VOICE_PRESETS,
  DEFAULT_VOICES,
} from '../ai/fish-audio'
import { generateId } from '../api-utils'

// Pipeline state types
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface PipelineJob {
  id: string
  projectId: string
  type: 'script' | 'image' | 'video' | 'voice' | 'assembly'
  status: JobStatus
  progress: number
  result?: unknown
  error?: string
  startedAt?: Date
  completedAt?: Date
}

export interface PipelineState {
  projectId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  currentStage: string
  progress: number
  jobs: PipelineJob[]
  script?: GeneratedScript
  scenes?: ProcessedScene[]
  outputUrl?: string
  error?: string
}

export interface ProcessedScene extends Scene {
  imageUrl?: string
  videoUrl?: string
  audioUrl?: string
  audioDuration?: number
}

export interface PipelineOptions {
  topic: string
  style: 'documentary' | 'tutorial' | 'story' | 'review' | 'explainer'
  duration: number
  voice: 'professional' | 'casual' | 'energetic' | 'calm'
  voiceGender?: 'male' | 'female'
  aspectRatio: '16:9' | '9:16' | '1:1'
  additionalInstructions?: string
}

// Callback for progress updates
export type ProgressCallback = (state: PipelineState) => void

/**
 * Main pipeline orchestrator
 */
export class VideoGenerationPipeline {
  private state: PipelineState
  private onProgress?: ProgressCallback

  constructor(projectId: string, onProgress?: ProgressCallback) {
    this.state = {
      projectId,
      status: 'pending',
      currentStage: 'initializing',
      progress: 0,
      jobs: [],
    }
    this.onProgress = onProgress
  }

  private updateProgress(updates: Partial<PipelineState>): void {
    this.state = { ...this.state, ...updates }
    this.onProgress?.(this.state)
  }

  private addJob(type: PipelineJob['type']): PipelineJob {
    const job: PipelineJob = {
      id: generateId('job'),
      projectId: this.state.projectId,
      type,
      status: 'pending',
      progress: 0,
    }
    this.state.jobs.push(job)
    return job
  }

  private updateJob(jobId: string, updates: Partial<PipelineJob>): void {
    const job = this.state.jobs.find((j) => j.id === jobId)
    if (job) {
      Object.assign(job, updates)
      this.onProgress?.(this.state)
    }
  }

  /**
   * Execute the full pipeline
   */
  async execute(options: PipelineOptions): Promise<PipelineState> {
    try {
      this.updateProgress({ status: 'running', currentStage: 'script' })

      // Stage 1: Generate Script
      const script = await this.generateScript(options)
      
      // Stage 2: Generate Images (parallel)
      const scenes = await this.generateImages(script.scenes, options.aspectRatio)
      
      // Stage 3: Generate Videos (parallel)
      const scenesWithVideo = await this.generateVideos(scenes)
      
      // Stage 4: Generate Voice (parallel per scene)
      const scenesWithVoice = await this.generateVoiceovers(scenesWithVideo, options)
      
      // Stage 5: Assembly (would use FFmpeg)
      const outputUrl = await this.assembleVideo(scenesWithVoice, options)

      this.updateProgress({
        status: 'completed',
        currentStage: 'complete',
        progress: 100,
        scenes: scenesWithVoice,
        outputUrl,
      })

      return this.state
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.updateProgress({
        status: 'failed',
        error: errorMessage,
      })
      throw error
    }
  }

  /**
   * Stage 1: Script Generation
   */
  private async generateScript(options: PipelineOptions): Promise<GeneratedScript> {
    const job = this.addJob('script')
    this.updateJob(job.id, { status: 'running', startedAt: new Date() })
    this.updateProgress({ currentStage: 'script', progress: 5 })

    try {
      const script = await generateScript({
        topic: options.topic,
        style: options.style,
        targetDuration: options.duration,
        voice: options.voice,
        additionalInstructions: options.additionalInstructions,
      })

      this.updateJob(job.id, {
        status: 'completed',
        progress: 100,
        result: script,
        completedAt: new Date(),
      })
      
      this.state.script = script
      this.updateProgress({ progress: 15 })

      return script
    } catch (error) {
      this.updateJob(job.id, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Script generation failed',
      })
      throw error
    }
  }

  /**
   * Stage 2: Image Generation (parallel)
   */
  private async generateImages(
    scenes: Scene[],
    aspectRatio: '16:9' | '9:16' | '1:1'
  ): Promise<ProcessedScene[]> {
    const job = this.addJob('image')
    this.updateJob(job.id, { status: 'running', startedAt: new Date() })
    this.updateProgress({ currentStage: 'image', progress: 20 })

    const { width, height } = ASPECT_RATIOS[aspectRatio]
    
    try {
      const processedScenes: ProcessedScene[] = await Promise.all(
        scenes.map(async (scene, index) => {
          const enhancedPrompt = enhanceImagePrompt(scene.visualDescription, 'cinematic')
          
          const result = await generateImage({
            prompt: enhancedPrompt,
            width,
            height,
            numImages: 1,
          })

          // Update progress
          const sceneProgress = ((index + 1) / scenes.length) * 100
          this.updateJob(job.id, { progress: sceneProgress })
          this.updateProgress({ progress: 20 + (sceneProgress * 0.25) })

          return {
            ...scene,
            imageUrl: result.images[0]?.url,
          }
        })
      )

      this.updateJob(job.id, {
        status: 'completed',
        progress: 100,
        completedAt: new Date(),
      })
      
      this.updateProgress({ progress: 45 })
      return processedScenes
    } catch (error) {
      this.updateJob(job.id, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Image generation failed',
      })
      throw error
    }
  }

  /**
   * Stage 3: Video Generation (parallel)
   */
  private async generateVideos(scenes: ProcessedScene[]): Promise<ProcessedScene[]> {
    const job = this.addJob('video')
    this.updateJob(job.id, { status: 'running', startedAt: new Date() })
    this.updateProgress({ currentStage: 'video', progress: 50 })

    try {
      const processedScenes: ProcessedScene[] = await Promise.all(
        scenes.map(async (scene, index) => {
          if (!scene.imageUrl) {
            throw new Error(`Scene ${scene.sceneNumber} has no image`)
          }

          const result = await generateVideo({
            imageUrl: scene.imageUrl,
            prompt: 'smooth subtle motion, cinematic, high quality',
            duration: Math.min(scene.durationSeconds, 10), // LTX max is 10s
          })

          // Update progress
          const sceneProgress = ((index + 1) / scenes.length) * 100
          this.updateJob(job.id, { progress: sceneProgress })
          this.updateProgress({ progress: 50 + (sceneProgress * 0.2) })

          return {
            ...scene,
            videoUrl: result.video.url,
          }
        })
      )

      this.updateJob(job.id, {
        status: 'completed',
        progress: 100,
        completedAt: new Date(),
      })
      
      this.updateProgress({ progress: 70 })
      return processedScenes
    } catch (error) {
      this.updateJob(job.id, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Video generation failed',
      })
      throw error
    }
  }

  /**
   * Stage 4: Voice Generation (parallel)
   */
  private async generateVoiceovers(
    scenes: ProcessedScene[],
    options: PipelineOptions
  ): Promise<ProcessedScene[]> {
    const job = this.addJob('voice')
    this.updateJob(job.id, { status: 'running', startedAt: new Date() })
    this.updateProgress({ currentStage: 'voice', progress: 75 })

    const voicePreset = VOICE_PRESETS[options.voice]
    const voiceId = DEFAULT_VOICES[`${options.voice}-${options.voiceGender || 'male'}`]

    try {
      const processedScenes: ProcessedScene[] = await Promise.all(
        scenes.map(async (scene, index) => {
          const preparedText = prepareTextForTTS(scene.narration)
          
          const result = await generateSpeech({
            text: preparedText,
            voiceId,
            ...voicePreset,
          })

          // Update progress
          const sceneProgress = ((index + 1) / scenes.length) * 100
          this.updateJob(job.id, { progress: sceneProgress })
          this.updateProgress({ progress: 75 + (sceneProgress * 0.15) })

          return {
            ...scene,
            audioUrl: result.audioUrl,
            audioDuration: result.duration,
          }
        })
      )

      this.updateJob(job.id, {
        status: 'completed',
        progress: 100,
        completedAt: new Date(),
      })
      
      this.updateProgress({ progress: 90 })
      return processedScenes
    } catch (error) {
      this.updateJob(job.id, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Voice generation failed',
      })
      throw error
    }
  }

  /**
   * Stage 5: Final Assembly (FFmpeg)
   */
  private async assembleVideo(
    scenes: ProcessedScene[],
    options: PipelineOptions
  ): Promise<string> {
    const job = this.addJob('assembly')
    this.updateJob(job.id, { status: 'running', startedAt: new Date() })
    this.updateProgress({ currentStage: 'assembly', progress: 92 })

    try {
      // In a real implementation, this would:
      // 1. Download all video clips and audio files
      // 2. Use FFmpeg to:
      //    - Concatenate video clips
      //    - Overlay audio tracks
      //    - Add captions/subtitles
      //    - Apply transitions
      //    - Export final video
      // 3. Upload to S3
      // 4. Return the S3 URL

      // For now, we'll simulate this
      await new Promise((resolve) => setTimeout(resolve, 2000))
      
      const outputUrl = `https://storage.example.com/videos/${this.state.projectId}/final.mp4`

      this.updateJob(job.id, {
        status: 'completed',
        progress: 100,
        result: { outputUrl },
        completedAt: new Date(),
      })
      
      this.updateProgress({ progress: 100 })
      return outputUrl
    } catch (error) {
      this.updateJob(job.id, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Assembly failed',
      })
      throw error
    }
  }
}

/**
 * Create and start a new pipeline
 */
export async function startPipeline(
  projectId: string,
  options: PipelineOptions,
  onProgress?: ProgressCallback
): Promise<PipelineState> {
  const pipeline = new VideoGenerationPipeline(projectId, onProgress)
  return pipeline.execute(options)
}

/**
 * Estimate total cost for a video
 */
export function estimatePipelineCost(
  durationSeconds: number,
  sceneCount: number
): {
  scriptCost: number
  imageCost: number
  videoCost: number
  voiceCost: number
  totalCost: number
} {
  // Rough estimates based on typical usage
  const avgNarrationLength = 50 // words per scene
  const totalWords = sceneCount * avgNarrationLength
  const totalChars = totalWords * 5 // average 5 chars per word

  const scriptCost = 0.01 // ~10K tokens at $0.59/1M
  const imageCost = sceneCount * 0.003
  const videoCost = sceneCount * 0.02
  const voiceCost = (totalChars / 1_000_000) * 0.015

  return {
    scriptCost,
    imageCost,
    videoCost,
    voiceCost,
    totalCost: scriptCost + imageCost + videoCost + voiceCost,
  }
}
