/**
 * Fish.audio Integration
 * Used for AI voice generation / Text-to-Speech
 * 
 * API Docs: https://docs.fish.audio/
 * Cost: ~$0.015 per 1M characters
 */

const FISH_API_URL = 'https://api.fish.audio/v1'

export interface VoiceOptions {
  text: string
  voiceId?: string
  speed?: number        // 0.5 to 2.0
  pitch?: number        // -20 to 20
  volume?: number       // 0 to 100
  format?: 'mp3' | 'wav' | 'ogg'
}

export interface VoiceGenerationResult {
  audioUrl: string
  duration: number      // in seconds
  format: string
  sizeBytes: number
}

export interface Voice {
  id: string
  name: string
  language: string
  gender: 'male' | 'female'
  style: string
  previewUrl?: string
}

// Preset voice configurations
export const VOICE_PRESETS: Record<string, Partial<VoiceOptions>> = {
  professional: {
    speed: 1.0,
    pitch: 0,
    volume: 80,
  },
  casual: {
    speed: 1.1,
    pitch: 2,
    volume: 75,
  },
  energetic: {
    speed: 1.2,
    pitch: 5,
    volume: 90,
  },
  calm: {
    speed: 0.9,
    pitch: -3,
    volume: 70,
  },
}

// Default voices by style (these are example IDs - replace with actual Fish.audio voice IDs)
export const DEFAULT_VOICES: Record<string, string> = {
  'professional-male': 'voice_professional_male_1',
  'professional-female': 'voice_professional_female_1',
  'casual-male': 'voice_casual_male_1',
  'casual-female': 'voice_casual_female_1',
  'energetic-male': 'voice_energetic_male_1',
  'energetic-female': 'voice_energetic_female_1',
  'calm-male': 'voice_calm_male_1',
  'calm-female': 'voice_calm_female_1',
}

/**
 * Generate speech from text
 */
export async function generateSpeech(
  options: VoiceOptions
): Promise<VoiceGenerationResult> {
  const apiKey = process.env.FISH_AUDIO_API_KEY
  
  if (!apiKey) {
    throw new Error('FISH_AUDIO_API_KEY is not configured')
  }

  const response = await fetch(`${FISH_API_URL}/tts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: options.text,
      reference_id: options.voiceId || DEFAULT_VOICES['professional-male'],
      speed: options.speed || 1.0,
      pitch: options.pitch || 0,
      volume: options.volume || 80,
      format: options.format || 'mp3',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Fish.audio API error: ${error}`)
  }

  // The API returns audio data directly
  const audioBlob = await response.blob()
  
  // In a real implementation, you'd upload this to S3 or similar
  // For now, we'll return a placeholder
  return {
    audioUrl: '', // This would be the S3 URL after upload
    duration: estimateDuration(options.text, options.speed || 1.0),
    format: options.format || 'mp3',
    sizeBytes: audioBlob.size,
  }
}

/**
 * Generate speech and return as a stream (for real-time playback)
 */
export async function generateSpeechStream(
  options: VoiceOptions
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.FISH_AUDIO_API_KEY
  
  if (!apiKey) {
    throw new Error('FISH_AUDIO_API_KEY is not configured')
  }

  const response = await fetch(`${FISH_API_URL}/tts/stream`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: options.text,
      reference_id: options.voiceId || DEFAULT_VOICES['professional-male'],
      speed: options.speed || 1.0,
      format: 'mp3',
    }),
  })

  if (!response.ok || !response.body) {
    const error = await response.text()
    throw new Error(`Fish.audio stream error: ${error}`)
  }

  return response.body
}

/**
 * List available voices
 */
export async function listVoices(): Promise<Voice[]> {
  const apiKey = process.env.FISH_AUDIO_API_KEY
  
  if (!apiKey) {
    throw new Error('FISH_AUDIO_API_KEY is not configured')
  }

  const response = await fetch(`${FISH_API_URL}/voices`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Fish.audio voices error: ${error}`)
  }

  const data = await response.json()
  return data.voices
}

/**
 * Estimate speech duration based on text length and speed
 * Average speaking rate is about 150 words per minute
 */
export function estimateDuration(text: string, speed: number = 1.0): number {
  const wordCount = text.split(/\s+/).length
  const wordsPerSecond = (150 / 60) * speed
  return Math.ceil(wordCount / wordsPerSecond)
}

/**
 * Calculate cost based on character count
 */
export function calculateCost(text: string): number {
  const charCount = text.length
  // $0.015 per 1M characters
  return (charCount / 1_000_000) * 0.015
}

/**
 * Prepare text for TTS (clean up formatting)
 */
export function prepareTextForTTS(text: string): string {
  return text
    // Remove markdown formatting
    .replace(/[*_~`]/g, '')
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    // Add pauses for punctuation
    .replace(/\.\s/g, '. ... ')
    .replace(/!\s/g, '! ... ')
    .replace(/\?\s/g, '? ... ')
    // Clean up
    .trim()
}

/**
 * Split long text into chunks for processing
 * Fish.audio has a character limit per request
 */
export function splitTextIntoChunks(
  text: string,
  maxChars: number = 5000
): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  const chunks: string[] = []
  let currentChunk = ''

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChars) {
      if (currentChunk) chunks.push(currentChunk.trim())
      currentChunk = sentence
    } else {
      currentChunk += sentence
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim())
  return chunks
}
