import { structuredMemoryJsonSchema } from "./relay-schema"

export const RELAY_SYSTEM_INTENT =
  "You are the structured memory engine for Code Blue Relay. Convert one clinical handoff into structured memory for one case only."

export const RELAY_RULES = [
  "Only analyze the current user-provided handoff.",
  "Never reference prior demo cases unless they are explicitly passed as carried-forward state.",
  "Do not hallucinate.",
  "Do not create extra sections.",
  "Do not output prose outside the schema.",
  "Keep audioSummaryScript concise, natural, and playback-ready.",
  "Prefer empty arrays over invented content.",
  "Escalation triggers should be explicit and actionable.",
] as const

export function buildRelaySystemPrompt() {
  return [
    "SYSTEM INTENT:",
    `"${RELAY_SYSTEM_INTENT}"`,
    "",
    "RULES:",
    ...RELAY_RULES.map((rule) => `- ${rule}`),
    "",
    "Return valid JSON only.",
    "The JSON must match this schema exactly:",
    JSON.stringify(structuredMemoryJsonSchema, null, 2),
  ].join("\n")
}

export function buildRelayUserPrompt(transcript: string) {
  return [
    "CURRENT HANDOFF INPUT:",
    transcript.trim(),
    "",
    "Return JSON only. Do not include markdown fences.",
  ].join("\n")
}
