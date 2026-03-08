import { NextResponse } from "next/server"

import {
  generateRelayAudioSummary,
  getConfiguredElevenLabsVoiceId,
} from "@/lib/elevenlabs"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    relayId?: string
    relaySlug?: string
    script?: string
  }

  const script = payload.script?.trim() ?? ""

  if (!script) {
    return NextResponse.json(
      {
        error: "Audio summary script is required.",
      },
      { status: 400 }
    )
  }

  const audioSummary = await generateRelayAudioSummary({
    relayId: payload.relaySlug ?? payload.relayId ?? "relay-audio",
    script,
    voiceId: getConfiguredElevenLabsVoiceId(),
  })

  return NextResponse.json({
    audioSummary,
  })
}
