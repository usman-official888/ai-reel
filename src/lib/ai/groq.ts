/**
 * Groq AI Integration
 * Used for script generation using Llama 3.1 70B
 * 
 * API Docs: https://console.groq.com/docs
 * Model: llama-3.1-70b-versatile
 * Cost: ~$0.59 per 1M tokens
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.1-70b-versatile'

export interface Scene {
  sceneNumber: number
  narration: string
  visualDescription: string
  durationSeconds: number
}

export interface GeneratedScript {
  title: string
  description: string
  scenes: Scene[]
  totalDuration: number
  tags: string[]
}

export interface ScriptGenerationOptions {
  topic: string
  style: 'documentary' | 'tutorial' | 'story' | 'review' | 'explainer'
  targetDuration: number // in seconds
  voice: 'professional' | 'casual' | 'energetic' | 'calm'
  additionalInstructions?: string
}

const STYLE_PROMPTS: Record<string, string> = {
  documentary: 'Create a documentary-style script with informative narration, historical context, and educational insights.',
  tutorial: 'Create a tutorial-style script with step-by-step instructions, clear explanations, and practical tips.',
  story: 'Create a narrative-driven script with engaging storytelling, emotional hooks, and a compelling arc.',
  review: 'Create a review-style script with balanced analysis, pros and cons, and clear recommendations.',
  explainer: 'Create an explainer-style script that breaks down complex topics into simple, digestible segments.',
}

const VOICE_PROMPTS: Record<string, string> = {
  professional: 'Use a professional, authoritative tone suitable for business or educational content.',
  casual: 'Use a friendly, conversational tone as if talking to a friend.',
  energetic: 'Use an upbeat, enthusiastic tone with high energy and excitement.',
  calm: 'Use a soothing, relaxed tone that is gentle and reassuring.',
}

export async function generateScript(
  options: ScriptGenerationOptions
): Promise<GeneratedScript> {
  const apiKey = process.env.GROQ_API_KEY
  
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured')
  }

  const sceneCount = Math.ceil(options.targetDuration / 15) // ~15 seconds per scene
  const avgSceneDuration = Math.floor(options.targetDuration / sceneCount)

  const systemPrompt = `You are an expert video scriptwriter. Your task is to create engaging, well-structured video scripts.

${STYLE_PROMPTS[options.style]}
${VOICE_PROMPTS[options.voice]}

IMPORTANT RULES:
1. Each scene should be approximately ${avgSceneDuration} seconds when narrated
2. Visual descriptions should be detailed enough for AI image generation
3. Narration should be natural and engaging
4. Include hooks at the beginning to capture attention
5. End with a clear conclusion or call-to-action

Respond ONLY with valid JSON in this exact format:
{
  "title": "Video title",
  "description": "Brief video description for social media",
  "tags": ["tag1", "tag2", "tag3"],
  "scenes": [
    {
      "sceneNumber": 1,
      "narration": "The narration text to be spoken",
      "visualDescription": "Detailed description of what should be shown visually",
      "durationSeconds": ${avgSceneDuration}
    }
  ]
}`

  const userPrompt = `Create a ${options.targetDuration}-second video script about: "${options.topic}"

Number of scenes: ${sceneCount}
${options.additionalInstructions ? `Additional instructions: ${options.additionalInstructions}` : ''}

Generate the complete script now.`

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Groq API error: ${error}`)
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content

  if (!content) {
    throw new Error('No content in Groq response')
  }

  const script = JSON.parse(content) as GeneratedScript
  
  // Calculate total duration
  script.totalDuration = script.scenes.reduce(
    (total, scene) => total + scene.durationSeconds,
    0
  )

  return script
}

// Estimate token count for cost calculation
export function estimateTokens(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4)
}

// Calculate cost in USD
export function calculateCost(inputTokens: number, outputTokens: number): number {
  // Groq Llama 3.1 70B pricing
  const inputCostPer1M = 0.59
  const outputCostPer1M = 0.79
  
  return (inputTokens * inputCostPer1M + outputTokens * outputCostPer1M) / 1_000_000
}
