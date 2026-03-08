import type { RelayAudioSummary } from "@/types/relay"

import { formatDurationLabelFromScript } from "@/lib/relay"

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID
const DEFAULT_MODEL_ID = process.env.ELEVENLABS_MODEL_ID ?? "eleven_turbo_v2_5"
const DEFAULT_VOICE_NAME = "Configured ElevenLabs voice"
const FALLBACK_VOICE_NAME = "Relay-specific fallback voice"

export const isElevenLabsConfigured = Boolean(
  ELEVENLABS_API_KEY && DEFAULT_VOICE_ID
)

export function getConfiguredElevenLabsVoiceId() {
  return DEFAULT_VOICE_ID
}

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
  const requestedVoiceId = voiceId?.trim() || DEFAULT_VOICE_ID || undefined

  if (!ELEVENLABS_API_KEY || !requestedVoiceId) {
    console.warn("[elevenlabs] falling back to relay-specific audio summary", {
      relayId,
      requestedVoiceId: requestedVoiceId ?? null,
      reason: "missing_api_key_or_voice_id",
    })

    return {
      status: "failed",
      script,
      provider: "fallback",
      voiceName: FALLBACK_VOICE_NAME,
      requestedVoiceId,
      durationLabel,
      lastGeneratedAt: new Date().toISOString(),
      errorMessage: "ElevenLabs is not configured for this runtime.",
      fallbackReason: "missing_api_key_or_voice_id",
    }
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${requestedVoiceId}`,
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
      voiceName: DEFAULT_VOICE_NAME,
      requestedVoiceId,
      usedVoiceId: requestedVoiceId,
      durationLabel,
      lastGeneratedAt: new Date().toISOString(),
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "ElevenLabs generation failed."

    console.warn("[elevenlabs] configured voice failed, using relay fallback", {
      relayId,
      requestedVoiceId,
      reason: errorMessage,
    })

    return {
      status: "failed",
      script,
      provider: "fallback",
      voiceName: FALLBACK_VOICE_NAME,
      requestedVoiceId,
      durationLabel,
      lastGeneratedAt: new Date().toISOString(),
      errorMessage: errorMessage,
      fallbackReason: "configured_voice_request_failed",
    }
  }
}
