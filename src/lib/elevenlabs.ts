import type { RelayAudioSummary } from "@/types/relay"

import { formatDurationLabelFromScript } from "@/lib/relay"

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID
const DEFAULT_MODEL_ID = process.env.ELEVENLABS_MODEL_ID ?? "eleven_turbo_v2_5"

export const isElevenLabsConfigured = Boolean(
  ELEVENLABS_API_KEY && DEFAULT_VOICE_ID
)

type ElevenLabsRequest = {
  relayId: string
  script: string
  voiceId?: string
}

export async function generateRelayAudioSummary({
  relayId,
  script,
  voiceId = DEFAULT_VOICE_ID,
}: ElevenLabsRequest): Promise<RelayAudioSummary> {
  const durationLabel = formatDurationLabelFromScript(script)

  if (!ELEVENLABS_API_KEY || !voiceId) {
    return {
      status: "failed",
      script,
      provider: "fallback",
      durationLabel,
      lastGeneratedAt: new Date().toISOString(),
      errorMessage: "ElevenLabs is not configured for this runtime.",
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
          text: script,
          model_id: DEFAULT_MODEL_ID,
          output_format: "mp3_44100_128",
        }),
        cache: "no-store",
      }
    )

    if (!response.ok) {
      throw new Error(
        `ElevenLabs request failed for ${relayId} with ${response.status}`
      )
    }

    const audioBuffer = await response.arrayBuffer()
    const base64Audio = Buffer.from(audioBuffer).toString("base64")

    return {
      status: "ready",
      audioUrl: `data:audio/mpeg;base64,${base64Audio}`,
      script,
      provider: "elevenlabs",
      voiceName: "Clinical Night Voice",
      durationLabel,
      lastGeneratedAt: new Date().toISOString(),
    }
  } catch (error) {
    return {
      status: "failed",
      script,
      provider: "fallback",
      voiceName: "Clinical Night Voice",
      durationLabel,
      lastGeneratedAt: new Date().toISOString(),
      errorMessage:
        error instanceof Error ? error.message : "ElevenLabs generation failed.",
    }
  }
}
