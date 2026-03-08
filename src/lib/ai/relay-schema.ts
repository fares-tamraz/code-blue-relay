import type { StructuredMemory } from "@/types/relay"

const emptyVisualSignals: StructuredMemory["visualSignals"] = {
  voiceSignal: "",
  memoryContinuity: "",
  escalationLogic: "",
  clinicalMemoryResolvesInRealTime: "",
}

export const structuredMemoryJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "patientName",
    "oneLineSummary",
    "currentStatus",
    "newFindings",
    "carriedForward",
    "unresolvedItems",
    "escalationTriggers",
    "followUpNeeded",
    "audioSummaryScript",
    "visualSignals",
  ],
  properties: {
    patientName: { type: "string" },
    oneLineSummary: { type: "string" },
    currentStatus: {
      type: "string",
      enum: ["Stable", "Watch", "Escalate"],
    },
    newFindings: {
      type: "array",
      items: { type: "string" },
    },
    carriedForward: {
      type: "array",
      items: { type: "string" },
    },
    unresolvedItems: {
      type: "array",
      items: { type: "string" },
    },
    escalationTriggers: {
      type: "array",
      items: { type: "string" },
    },
    followUpNeeded: {
      type: "array",
      items: { type: "string" },
    },
    audioSummaryScript: { type: "string" },
    visualSignals: {
      type: "object",
      additionalProperties: false,
      required: [
        "voiceSignal",
        "memoryContinuity",
        "escalationLogic",
        "clinicalMemoryResolvesInRealTime",
      ],
      properties: {
        voiceSignal: { type: "string" },
        memoryContinuity: { type: "string" },
        escalationLogic: { type: "string" },
        clinicalMemoryResolvesInRealTime: { type: "string" },
      },
    },
  },
} as const

export function createEmptyStructuredMemory(): StructuredMemory {
  return {
    patientName: "",
    oneLineSummary: "",
    currentStatus: "Stable",
    newFindings: [],
    carriedForward: [],
    unresolvedItems: [],
    escalationTriggers: [],
    followUpNeeded: [],
    audioSummaryScript: "",
    visualSignals: { ...emptyVisualSignals },
  }
}

function normalizeString(value: unknown) {
  if (typeof value !== "string") {
    return ""
  }

  return value.trim()
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => normalizeString(item))
    .filter(Boolean)
}

function normalizeStatus(value: unknown): StructuredMemory["currentStatus"] {
  if (value === "Watch" || value === "Escalate" || value === "Stable") {
    return value
  }

  return "Stable"
}

export function normalizeStructuredMemory(
  value: Partial<StructuredMemory> | unknown
): StructuredMemory {
  const candidate =
    value && typeof value === "object"
      ? (value as Partial<StructuredMemory>)
      : createEmptyStructuredMemory()

  const visualSignalsCandidate =
    candidate.visualSignals && typeof candidate.visualSignals === "object"
      ? candidate.visualSignals
      : emptyVisualSignals

  return {
    patientName: normalizeString(candidate.patientName),
    oneLineSummary: normalizeString(candidate.oneLineSummary),
    currentStatus: normalizeStatus(candidate.currentStatus),
    newFindings: normalizeStringArray(candidate.newFindings),
    carriedForward: normalizeStringArray(candidate.carriedForward),
    unresolvedItems: normalizeStringArray(candidate.unresolvedItems),
    escalationTriggers: normalizeStringArray(candidate.escalationTriggers),
    followUpNeeded: normalizeStringArray(candidate.followUpNeeded),
    audioSummaryScript: normalizeString(candidate.audioSummaryScript),
    visualSignals: {
      voiceSignal: normalizeString(visualSignalsCandidate.voiceSignal),
      memoryContinuity: normalizeString(
        visualSignalsCandidate.memoryContinuity
      ),
      escalationLogic: normalizeString(visualSignalsCandidate.escalationLogic),
      clinicalMemoryResolvesInRealTime: normalizeString(
        visualSignalsCandidate.clinicalMemoryResolvesInRealTime
      ),
    },
  }
}

function extractJSONObject(payload: string) {
  const trimmedPayload = payload.trim()

  if (!trimmedPayload) {
    return null
  }

  const fencedMatch = trimmedPayload.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fencedMatch?.[1]?.trim() ?? trimmedPayload
  const firstBraceIndex = candidate.indexOf("{")
  const lastBraceIndex = candidate.lastIndexOf("}")

  if (firstBraceIndex === -1 || lastBraceIndex === -1) {
    return null
  }

  return candidate.slice(firstBraceIndex, lastBraceIndex + 1)
}

export function parseStructuredMemoryPayload(payload: string | unknown) {
  if (typeof payload !== "string") {
    return normalizeStructuredMemory(payload)
  }

  const jsonObject = extractJSONObject(payload)

  if (!jsonObject) {
    return createEmptyStructuredMemory()
  }

  try {
    return normalizeStructuredMemory(JSON.parse(jsonObject))
  } catch {
    return createEmptyStructuredMemory()
  }
}
