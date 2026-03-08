import type { RelayDraftInput, StructuredMemory } from "@/types/relay"

import { createEmptyStructuredMemory, normalizeStructuredMemory } from "./relay-schema"

function cleanWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim()
}

function splitSentences(transcript: string) {
  return transcript
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => cleanWhitespace(sentence))
    .filter(Boolean)
}

function unique(items: string[]) {
  return Array.from(new Set(items.map((item) => cleanWhitespace(item)).filter(Boolean)))
}

function truncateWords(value: string, limit: number) {
  const words = cleanWhitespace(value).split(" ").filter(Boolean)

  if (words.length <= limit) {
    return words.join(" ")
  }

  return `${words.slice(0, limit).join(" ")}.`
}

function detectPatientName(transcript: string) {
  const leadingMatch = transcript.match(
    /^\s*((?:Mrs\.?|Mr\.?|Ms\.?|Miss)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}|[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})(?=\s+(?:is|was|remains|looks|has))/m
  )

  if (leadingMatch?.[1]) {
    return cleanWhitespace(leadingMatch[1].replace(/\s+/g, " "))
  }

  const patientMatch = transcript.match(
    /\bpatient(?: name)?\s*(?:is|:)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/i
  )

  if (patientMatch?.[1]) {
    return cleanWhitespace(patientMatch[1])
  }

  return ""
}

function detectStatus(transcript: string, escalationTriggers: string[]) {
  if (
    escalationTriggers.length ||
    /\b(escalate immediately|rapid response|code blue|urgent|unstable)\b/i.test(
      transcript
    )
  ) {
    return "Escalate" as const
  }

  if (
    /\b(watch|monitor|pending|possible|concern|worsen|worsening|callback|follow up)\b/i.test(
      transcript
    )
  ) {
    return "Watch" as const
  }

  return "Stable" as const
}

function pickSentences(sentences: string[], pattern: RegExp) {
  return unique(sentences.filter((sentence) => pattern.test(sentence)))
}

function buildOneLineSummary(sentences: string[]) {
  if (!sentences.length) {
    return ""
  }

  return truncateWords(sentences[0], 22)
}

function buildAudioSummaryScript(memory: StructuredMemory) {
  const scriptParts = [
    memory.patientName ? `${memory.patientName}.` : "",
    memory.oneLineSummary,
    memory.newFindings[0] ?? "",
    memory.unresolvedItems[0] ?? "",
    memory.escalationTriggers[0] ?? "",
  ].filter(Boolean)

  return truncateWords(scriptParts.join(" "), 60)
}

export function generateStructuredMemoryFallback({
  transcript,
}: RelayDraftInput): StructuredMemory {
  const normalizedTranscript = cleanWhitespace(transcript)

  if (!normalizedTranscript) {
    return createEmptyStructuredMemory()
  }

  const sentences = splitSentences(normalizedTranscript)
  const carriedForward = pickSentences(
    sentences,
    /\b(previous shift|prior shift|last shift|carried forward|still pending from|continuing from)\b/i
  )
  const escalationTriggers = pickSentences(
    sentences,
    /\b(if .*?(?:escalate|notify|call)|escalate immediately|call .*? immediately|notify .*? immediately)\b/i
  )
  const unresolvedItems = pickSentences(
    sentences,
    /\b(pending|waiting|still need|need to|follow up|callback|outstanding|remains unresolved|recheck|repeat)\b/i
  ).filter((sentence) => !escalationTriggers.includes(sentence))
  const followUpNeeded = pickSentences(
    sentences,
    /\b(reassess|recheck|repeat|document|track|monitor|follow up|assess|clarify|notify)\b/i
  )
  const newFindings = pickSentences(
    sentences,
    /\b(new|more|less|worse|worsen|worsening|increase|increased|decrease|decreased|confusion|cough|fever|pain|pressure|intake|breathing|oxygen|edema|nausea|urine|temperature)\b/i
  )

  const structuredMemory = normalizeStructuredMemory({
    patientName: detectPatientName(normalizedTranscript),
    oneLineSummary: buildOneLineSummary(sentences),
    currentStatus: detectStatus(normalizedTranscript, escalationTriggers),
    newFindings,
    carriedForward,
    unresolvedItems,
    escalationTriggers,
    followUpNeeded,
    audioSummaryScript: "",
    visualSignals: {
      voiceSignal: newFindings[0] ?? "",
      memoryContinuity: carriedForward[0] ?? "",
      escalationLogic: escalationTriggers[0] ?? "",
      clinicalMemoryResolvesInRealTime: buildOneLineSummary(sentences),
    },
  })

  return {
    ...structuredMemory,
    audioSummaryScript: buildAudioSummaryScript(structuredMemory),
  }
}
