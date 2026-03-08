import type { AudioSummary } from "@/types/relay"

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID

export const isElevenLabsConfigured = Boolean(ELEVENLABS_API_KEY)

type ElevenLabsRequest = {
  text: string
  voiceId?: string
}

export async function generateElevenLabsSummary({
  text,
  voiceId = DEFAULT_VOICE_ID,
}: ElevenLabsRequest): Promise<AudioSummary> {
  if (!ELEVENLABS_API_KEY || !voiceId) {
    return {
      id: "mock-elevenlabs-summary",
      voiceName: "Clinical Night Voice",
      durationLabel: "0:30",
      transcript: text,
      status: "mock",
      provider: "mock",
      audioUrl: null,
      lastGeneratedAt: new Date().toISOString(),
    }
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2_5",
          output_format: "mp3_44100_128",
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`ElevenLabs request failed with ${response.status}`)
    }

    const audioBuffer = await response.arrayBuffer()
    const base64Audio = Buffer.from(audioBuffer).toString("base64")

    return {
      id: "elevenlabs-summary",
      voiceName: "Clinical Night Voice",
      durationLabel: "0:30",
      transcript: text,
      status: "ready",
      provider: "elevenlabs",
      audioUrl: `data:audio/mpeg;base64,${base64Audio}`,
      lastGeneratedAt: new Date().toISOString(),
    }
  } catch {
    return {
      id: "mock-elevenlabs-summary-fallback",
      voiceName: "Clinical Night Voice",
      durationLabel: "0:30",
      transcript: text,
      status: "mock",
      provider: "mock",
      audioUrl: null,
      lastGeneratedAt: new Date().toISOString(),
    }
  }
}
