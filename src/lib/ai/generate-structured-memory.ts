import type { RelayDraftInput } from "@/types/relay"

import { generateStructuredMemoryWithBackboard, isBackboardConfigured } from "@/lib/backboard"

import { generateStructuredMemoryFallback } from "./fallback-structured-memory"
import { buildRelaySystemPrompt, buildRelayUserPrompt } from "./relay-instructions"
import { normalizeStructuredMemory, parseStructuredMemoryPayload } from "./relay-schema"

export async function generateStructuredMemory(input: RelayDraftInput) {
  const transcript = input.transcript.trim()

  if (!transcript) {
    return generateStructuredMemoryFallback({ transcript })
  }

  if (isBackboardConfigured) {
    try {
      const payload = await generateStructuredMemoryWithBackboard({
        systemPrompt: buildRelaySystemPrompt(),
        userPrompt: buildRelayUserPrompt(transcript),
      })

      const structuredMemory = normalizeStructuredMemory(
        parseStructuredMemoryPayload(payload)
      )

      return structuredMemory.oneLineSummary || structuredMemory.patientName
        ? structuredMemory
        : generateStructuredMemoryFallback({ transcript })
    } catch {
      return generateStructuredMemoryFallback({ transcript })
    }
  }

  return generateStructuredMemoryFallback({ transcript })
}
