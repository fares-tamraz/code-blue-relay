import type { RelayDraftInput, StructuredMemory } from "@/types/relay"

import { deriveMemoryContinuitySignal } from "@/lib/relay"

import {
  createEmptyStructuredMemory,
  normalizeStructuredMemory,
} from "./relay-schema"

const HONORIFIC_ONLY_PATTERN = /^(mr|mrs|ms|miss|dr)\.?$/i
const PLACEHOLDER_PATTERN = /^(n\/a|none|unknown|not provided|not stated)$/i
const PENDING_PATTERN =
  /\b(pending|awaiting|waiting|callback|call back|called back|not called back|no response|response pending|physician|provider|doctor|respiratory therapy|rt)\b/i
const FOLLOW_UP_PATTERN =
  /\b(monitor|reassess|recheck|repeat|track|document|follow up|follow-up|assess|observe|watch|keep an eye|verify|confirm|preserve)\b/i
const ESCALATION_PATTERN =
  /\b(if .*?(?:escalate|notify|call)|escalate immediately|call .*? immediately|notify .*? immediately)\b/i
const CARRY_FORWARD_PATTERN =
  /\b(previous shift|prior shift|last shift|carried forward|carried over|still pending from|continuing from|from day shift|from earlier shift|from handoff)\b/i
const FINDING_PATTERN =
  /\b(new|more|less|worse|worsen|worsening|increase|increased|decrease|decreased|short of breath|breathing|work of breathing|oxygen|saturation|cough|wheez|fever|pain|pressure|intake|confusion|swallow|edema|nausea|urine|temperature)\b/i

function cleanWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim()
}

function truncateWords(value: string, limit: number) {
  const words = cleanWhitespace(value).split(" ").filter(Boolean)

  if (words.length <= limit) {
    return words.join(" ")
  }

  return `${words.slice(0, limit).join(" ")}.`
}

function sanitizeText(value: string) {
  return cleanWhitespace(
    value
      .replace(/^[\s\-*>\d.)]+/, "")
      .replace(/^[`"']+|[`"']+$/g, "")
      .replace(/\s+([,.;:!?])/g, "$1")
      .replace(/[,:;]+$/, "")
  )
}

function normalizeForComparison(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "")
}

function splitSentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sanitizeText(sentence))
    .filter(Boolean)
}

function dedupe(items: string[]) {
  const seen = new Set<string>()

  return items.filter((item) => {
    const normalized = normalizeForComparison(item)

    if (!normalized || seen.has(normalized)) {
      return false
    }

    seen.add(normalized)
    return true
  })
}

function detectPatientName(transcript: string) {
  const leadingMatch = transcript.match(
    /^\s*((?:Mrs\.?|Mr\.?|Ms\.?|Miss|Dr\.?)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}|[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})(?=\s+(?:is|was|remains|looks|has))/m
  )

  if (leadingMatch?.[1]) {
    return sanitizeText(leadingMatch[1])
  }

  const patientMatch = transcript.match(
    /\bpatient(?: name)?\s*(?:is|:)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/i
  )

  if (patientMatch?.[1]) {
    return sanitizeText(patientMatch[1])
  }

  return ""
}

function isMeaningfulItem(item: string, patientName: string) {
  const sanitized = sanitizeText(item)

  if (!sanitized || PLACEHOLDER_PATTERN.test(sanitized)) {
    return false
  }

  if (HONORIFIC_ONLY_PATTERN.test(sanitized)) {
    return false
  }

  if (
    patientName &&
    normalizeForComparison(sanitized) === normalizeForComparison(patientName)
  ) {
    return false
  }

  return /[a-z0-9]/i.test(sanitized)
}

function sanitizeItems(items: string[], patientName: string) {
  return dedupe(
    items
      .map((item) => sanitizeText(item))
      .filter((item) => isMeaningfulItem(item, patientName))
  )
}

function extractMatchingSentences(sentences: string[], pattern: RegExp) {
  return dedupe(sentences.filter((sentence) => pattern.test(sentence)))
}

function buildFallbackSummary(
  transcript: string,
  patientName: string,
  newFindings: string[],
  unresolvedItems: string[]
) {
  const firstSentence = splitSentences(transcript)[0] ?? ""

  if (firstSentence) {
    return truncateWords(firstSentence, 28)
  }

  return truncateWords(
    [patientName, newFindings[0] ?? "", unresolvedItems[0] ?? ""]
      .filter(Boolean)
      .join(" "),
    28
  )
}

function repairSummary(
  summary: string,
  transcript: string,
  patientName: string,
  newFindings: string[],
  unresolvedItems: string[]
) {
  const summarySentences = splitSentences(summary).filter((sentence, index) => {
    if (!patientName || index !== 0) {
      return true
    }

    return (
      normalizeForComparison(sentence) !== normalizeForComparison(patientName)
    )
  })

  const cleanedSummary = truncateWords(summarySentences.join(" "), 28)

  if (
    !cleanedSummary ||
    /^(mr|mrs|ms|miss|dr)\.\s+(is|has|was|remains|looks)\b/i.test(
      cleanedSummary
    ) ||
    HONORIFIC_ONLY_PATTERN.test(cleanedSummary) ||
    (patientName &&
      normalizeForComparison(cleanedSummary) ===
        normalizeForComparison(patientName))
  ) {
    return buildFallbackSummary(
      transcript,
      patientName,
      newFindings,
      unresolvedItems
    )
  }

  return cleanedSummary
}

function deriveFollowUpFromTriggers(triggers: string[]) {
  return triggers
    .map((trigger) => {
      const conditionMatch = trigger.match(
        /^if\s+(.+?)(?:,\s*|\s+)(?:escalate|notify|call)\b/i
      )

      if (!conditionMatch?.[1]) {
        return ""
      }

      return sanitizeText(`Monitor for ${conditionMatch[1]}.`)
    })
    .filter(Boolean)
}

function repairStatus(
  currentStatus: StructuredMemory["currentStatus"],
  transcript: string,
  unresolvedItems: string[],
  escalationTriggers: string[]
): StructuredMemory["currentStatus"] {
  if (
    currentStatus === "Escalate" ||
    /\b(is escalating|already in escalation|currently escalating|rapid response|code blue)\b/i.test(
      transcript
    )
  ) {
    return "Escalate"
  }

  if (
    escalationTriggers.length ||
    unresolvedItems.length ||
    /\b(pending|watch|monitor|possible|callback|follow up|follow-up|waiting)\b/i.test(
      transcript
    )
  ) {
    return "Watch"
  }

  return "Stable"
}

function buildAudioSummaryScript(memory: StructuredMemory) {
  return truncateWords(
    [
      memory.patientName ? `${memory.patientName}.` : "",
      memory.oneLineSummary,
      memory.newFindings[0] ?? "",
      memory.unresolvedItems[0] ?? "",
      memory.escalationTriggers[0] ?? "",
    ]
      .filter(Boolean)
      .join(" "),
    58
  )
}

function repairAudioSummaryScript(
  candidateScript: string,
  transcript: string,
  memory: StructuredMemory
) {
  if (!sanitizeText(candidateScript)) {
    return buildAudioSummaryScript(memory)
  }

  const cleanedScript = repairSummary(
    candidateScript,
    transcript,
    memory.patientName,
    memory.newFindings,
    memory.unresolvedItems
  )

  if (
    cleanedScript &&
    !HONORIFIC_ONLY_PATTERN.test(cleanedScript) &&
    cleanedScript.split(/\s+/).filter(Boolean).length >= 6
  ) {
    return truncateWords(cleanedScript, 58)
  }

  return buildAudioSummaryScript(memory)
}

export function repairStructuredMemory(
  memory: StructuredMemory | unknown,
  input: RelayDraftInput
) {
  const transcript = cleanWhitespace(input.transcript)

  if (!transcript) {
    return createEmptyStructuredMemory()
  }

  const normalized = normalizeStructuredMemory(memory)
  const transcriptSentences = splitSentences(transcript)
  const patientName = sanitizeText(
    normalized.patientName || detectPatientName(transcript)
  )
  const explicitCarriedForward = extractMatchingSentences(
    transcriptSentences,
    CARRY_FORWARD_PATTERN
  )
  const escalationTriggers = sanitizeItems(
    [
      ...normalized.escalationTriggers,
      ...extractMatchingSentences(transcriptSentences, ESCALATION_PATTERN),
    ],
    patientName
  )
  const unresolvedItems = sanitizeItems(
    [
      ...normalized.unresolvedItems,
      ...extractMatchingSentences(transcriptSentences, PENDING_PATTERN),
    ],
    patientName
  )
  const followUpNeeded = sanitizeItems(
    [
      ...normalized.followUpNeeded,
      ...extractMatchingSentences(transcriptSentences, FOLLOW_UP_PATTERN),
      ...deriveFollowUpFromTriggers(escalationTriggers),
    ],
    patientName
  )
  const newFindings = sanitizeItems(
    [
      ...normalized.newFindings,
      ...extractMatchingSentences(transcriptSentences, FINDING_PATTERN),
    ],
    patientName
  ).filter(
    (item) =>
      !escalationTriggers.some(
        (trigger) =>
          normalizeForComparison(trigger) === normalizeForComparison(item)
      )
  )
  const carriedForward = explicitCarriedForward.length
    ? sanitizeItems(
        [
          ...normalized.carriedForward.filter((item) =>
            CARRY_FORWARD_PATTERN.test(item)
          ),
          ...explicitCarriedForward,
        ],
        patientName
      )
    : []
  const oneLineSummary = repairSummary(
    normalized.oneLineSummary,
    transcript,
    patientName,
    newFindings,
    unresolvedItems
  )

  const repairedMemoryBase = normalizeStructuredMemory({
    patientName,
    oneLineSummary,
    currentStatus: repairStatus(
      normalized.currentStatus,
      transcript,
      unresolvedItems,
      escalationTriggers
    ),
    newFindings,
    carriedForward,
    unresolvedItems,
    escalationTriggers,
    followUpNeeded,
    audioSummaryScript: sanitizeText(normalized.audioSummaryScript),
    visualSignals: {
      voiceSignal: sanitizeText(
        normalized.visualSignals.voiceSignal || newFindings[0] || oneLineSummary
      ),
      memoryContinuity: sanitizeText(normalized.visualSignals.memoryContinuity),
      escalationLogic: sanitizeText(
        normalized.visualSignals.escalationLogic || escalationTriggers[0] || ""
      ),
      clinicalMemoryResolvesInRealTime: sanitizeText(
        normalized.visualSignals.clinicalMemoryResolvesInRealTime ||
          oneLineSummary
      ),
    },
  })
  const repairedMemory = {
    ...repairedMemoryBase,
    visualSignals: {
      ...repairedMemoryBase.visualSignals,
      memoryContinuity: deriveMemoryContinuitySignal({
        transcript,
        structuredMemory: repairedMemoryBase,
      }),
    },
  }

  return {
    ...repairedMemory,
    audioSummaryScript: repairAudioSummaryScript(
      repairedMemory.audioSummaryScript,
      transcript,
      repairedMemory
    ),
  }
}
