import type { RelayDraftInput } from "@/types/relay"

import { generateStructuredMemoryWithBackboard, isBackboardConfigured } from "@/lib/backboard"
import { finalizeRelayStatus } from "@/lib/relay"

import { generateStructuredMemoryFallback } from "./fallback-structured-memory"
import { repairStructuredMemory } from "./repair-structured-memory"
import { buildRelaySystemPrompt, buildRelayUserPrompt } from "./relay-instructions"
import { parseStructuredMemoryPayload } from "./relay-schema"

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

      const structuredMemory = repairStructuredMemory(
        parseStructuredMemoryPayload(payload),
        { transcript }
      )

      const finalizedMemory =
        structuredMemory.oneLineSummary || structuredMemory.patientName
          ? structuredMemory
          : repairStructuredMemory(generateStructuredMemoryFallback({ transcript }), {
              transcript,
            })

      return {
        ...finalizedMemory,
        currentStatus: finalizeRelayStatus({
          transcript,
          structuredMemory: finalizedMemory,
        }),
      }
    } catch {
      const fallbackMemory = repairStructuredMemory(
        generateStructuredMemoryFallback({ transcript }),
        {
          transcript,
        }
      )

      return {
        ...fallbackMemory,
        currentStatus: finalizeRelayStatus({
          transcript,
          structuredMemory: fallbackMemory,
        }),
      }
    }
  }

  const fallbackMemory = repairStructuredMemory(
    generateStructuredMemoryFallback({ transcript }),
    {
      transcript,
    }
  )

  return {
    ...fallbackMemory,
    currentStatus: finalizeRelayStatus({
      transcript,
      structuredMemory: fallbackMemory,
    }),
  }
}
