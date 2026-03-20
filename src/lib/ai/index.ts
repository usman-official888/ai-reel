// AI Provider Integrations

// Groq - Script generation
export {
  generateScript,
  estimateTokens,
  calculateCost as calculateGroqCost,
} from './groq'

// Fal.ai - Image and video generation
export {
  generateImage,
  generateVideo,
  queueVideoGeneration,
  checkQueueStatus,
  enhanceImagePrompt,
  calculateImageCost,
  calculateVideoCost,
  ASPECT_RATIOS,
} from './fal'

// Fish Audio - Text to speech
export {
  generateSpeech,
  generateSpeechStream,
  listVoices,
  estimateDuration,
  calculateCost as calculateVoiceCost,
  prepareTextForTTS,
  splitTextIntoChunks,
  VOICE_PRESETS,
  DEFAULT_VOICES,
} from './fish-audio'

// Re-export common types
export type { GeneratedScript, Scene, ScriptGenerationOptions } from './groq'
export type { ImageGenerationResult, VideoGenerationResult, ImageGenerationOptions, VideoGenerationOptions } from './fal'
export type { VoiceGenerationResult, Voice, VoiceOptions } from './fish-audio'
