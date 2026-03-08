import { normalizeStructuredMemory } from "@/lib/ai/relay-schema"
import type {
  Case,
  CaseSignal,
  CaseStatus,
  DashboardMetrics,
  RelayDraftInput,
  RelayRecord,
  RelayStatus,
  SignalTone,
  StructuredMemory,
  TimelineEvent,
} from "@/types/relay"

type StatusMeta = {
  label: CaseStatus
  chipClassName: string
  surfaceClassName: string
}

type CreateRelayOptions = {
  transcript: string
  structuredMemory: StructuredMemory
  source?: RelayRecord["source"]
  createdAt?: string
  id?: string
  slug?: string
  handoffMode?: RelayRecord["handoffMode"]
  handoffLabel?: string
  clinicianLabel?: string
  unit?: string
  room?: string
  age?: number
  diagnosis?: string
  story?: string
  timeline?: TimelineEvent[]
  audioSummary?: RelayRecord["audioSummary"]
  escalationActionText?: string
}

export const statusMeta: Record<CaseStatus, StatusMeta> = {
  Stable: {
    label: "Stable",
    chipClassName:
      "border border-[color:rgba(45,211,191,0.26)] bg-[rgba(27,95,92,0.28)] text-[rgba(164,252,238,0.98)]",
    surfaceClassName:
      "border-[rgba(45,211,191,0.2)] bg-[linear-gradient(180deg,rgba(20,39,52,0.96),rgba(9,19,32,0.94))]",
  },
  Watch: {
    label: "Watch",
    chipClassName:
      "border border-[color:rgba(245,158,11,0.28)] bg-[rgba(97,61,13,0.34)] text-[rgba(252,211,125,0.98)]",
    surfaceClassName:
      "border-[rgba(245,158,11,0.22)] bg-[linear-gradient(180deg,rgba(38,31,20,0.95),rgba(11,17,29,0.96))]",
  },
  Escalate: {
    label: "Escalate",
    chipClassName:
      "border border-[color:rgba(251,113,133,0.28)] bg-[rgba(115,26,46,0.34)] text-[rgba(255,195,203,0.98)]",
    surfaceClassName:
      "border-[rgba(251,113,133,0.24)] bg-[linear-gradient(180deg,rgba(46,19,29,0.96),rgba(13,17,31,0.97))]",
  },
}

export const toneClassMap: Record<SignalTone, string> = {
  teal: "text-[rgba(144,247,235,0.95)] bg-[rgba(28,77,78,0.28)] border-[rgba(45,211,191,0.18)]",
  amber:
    "text-[rgba(252,211,125,0.95)] bg-[rgba(85,57,18,0.28)] border-[rgba(245,158,11,0.18)]",
  coral:
    "text-[rgba(255,189,202,0.96)] bg-[rgba(101,34,48,0.32)] border-[rgba(251,113,133,0.22)]",
  violet:
    "text-[rgba(214,203,255,0.95)] bg-[rgba(70,52,109,0.28)] border-[rgba(167,139,250,0.18)]",
}

const ACTIVE_ESCALATION_PATTERN =
  /\b(is escalating|already in escalation|escalation active|rapid response|code blue|urgent transfer|urgent review|immediate clinician review|status has now escalated)\b/i
const IMMEDIATE_ACTION_PATTERN =
  /\b(escalate immediately|notify .* immediately|call .* immediately|urgent change|immediate escalation)\b/i
const WORSENING_PATTERN =
  /\b(worse|worsening|more .* than baseline|below .*usual|still lower than .*usual|short of breath|increased work of breathing|wet cough|new cough|confusion above baseline|softer than at handoff|poor intake|faint wheezing|fever|rising oxygen demand)\b/i
const PENDING_CALLBACK_PATTERN =
  /\b(pending|awaiting|waiting|callback|call back|called back|physician|provider|doctor|respiratory therapy|rt)\b/i
const ROUTINE_STABLE_PATTERN =
  /\b(routine recovery|low overnight risk|overall stable|much more comfortable|improving post-op)\b/i
const CONTINUITY_CUE_PATTERN =
  /\b(still|again|continue|continuing|carry forward|carried forward|day shift|prior shift|previous shift|last shift|earlier shift|shift change|pending|awaiting|waiting|remains?)\b/i
const CALLBACK_CONTINUITY_PATTERN =
  /\b(callback|call back|called back|response pending|no response)\b/i
const LEADING_CONTINUITY_PATTERN =
  /^(?:continue|continuing|carry forward|carried forward|carry over|carried over|preserve|keep)\s+/i
const TRAILING_SHIFT_CONTEXT_PATTERN =
  /\s+\b(?:from|on|during|before)\s+(?:the\s+)?(?:prior|previous|last|earlier)\s+shift(?:\s+change)?\b.*$/i
const TRAILING_DAY_SHIFT_CONTEXT_PATTERN =
  /\s+\bfrom\s+day\s+shift\b.*$/i
const TRAILING_HANDOFF_CONTEXT_PATTERN =
  /\s+\b(?:from|at)\s+handoff\b.*$/i
const TRAILING_MORNING_CONTEXT_PATTERN =
  /\s+\b(?:into|for)\s+the\s+morning(?:\s+relay|\s+team|\s+rounds)?\b.*$/i
const TRAILING_STATE_PATTERN =
  /\s+\b(?:remains?|remain|is|are|was|were)\b.*$/i
const TRAILING_EVENT_PATTERN =
  /\s+\b(?:launched|started|initiated|requested|needed|tracked|marked|flagged)\b.*$/i
const MEMORY_CONTINUITY_STOP_WORDS = new Set([
  "and",
  "are",
  "carried",
  "concern",
  "forward",
  "from",
  "into",
  "prior",
  "shift",
  "the",
])

function isConditionalEscalationReason(reason: string) {
  return /^\s*if\b/i.test(reason)
}

function cleanSignalText(value: string) {
  return value.replace(/\s+/g, " ").replace(/\s+([,.;:!?])/g, "$1").trim()
}

function capitalizeText(value: string) {
  if (!value) {
    return ""
  }

  return value.charAt(0).toUpperCase() + value.slice(1)
}

function buildContinuityShiftSource(
  structuredMemory: StructuredMemory,
  transcript: string
) {
  const continuityContext = [transcript, ...structuredMemory.carriedForward]
    .filter(Boolean)
    .join(" ")

  if (/\bday shift\b/i.test(continuityContext)) {
    return "from day shift"
  }

  return "from the prior shift"
}

function extractContinuitySubject(item: string) {
  let subject = cleanSignalText(item)

  if (!subject) {
    return ""
  }

  subject = subject.replace(LEADING_CONTINUITY_PATTERN, "")
  subject = subject.replace(TRAILING_DAY_SHIFT_CONTEXT_PATTERN, "")
  subject = subject.replace(TRAILING_SHIFT_CONTEXT_PATTERN, "")
  subject = subject.replace(TRAILING_HANDOFF_CONTEXT_PATTERN, "")
  subject = subject.replace(TRAILING_MORNING_CONTEXT_PATTERN, "")
  subject = subject.replace(TRAILING_STATE_PATTERN, "")
  subject = subject.replace(TRAILING_EVENT_PATTERN, "")
  subject = subject.replace(/\b(?:the key continuity item|continuity item)\b/gi, "")
  subject = cleanSignalText(subject.replace(/[.?!,:;]+$/g, ""))

  return capitalizeText(subject)
}

function getMemoryContinuityTokens(value: string) {
  return Array.from(
    new Set(
      cleanSignalText(value)
        .toLowerCase()
        .match(/[a-z0-9]+/g) ?? []
    )
  ).filter(
    (token) => token.length > 2 && !MEMORY_CONTINUITY_STOP_WORDS.has(token)
  )
}

function isGroundedMemoryContinuityCandidate(
  candidate: string,
  structuredMemory: StructuredMemory,
  transcript: string
) {
  const candidateTokens = getMemoryContinuityTokens(candidate)

  if (!candidateTokens.length) {
    return false
  }

  const contextTokens = new Set(
    getMemoryContinuityTokens(
      [
        transcript,
        structuredMemory.oneLineSummary,
        ...structuredMemory.newFindings,
        ...structuredMemory.carriedForward,
        ...structuredMemory.unresolvedItems,
        ...structuredMemory.followUpNeeded,
      ]
        .filter(Boolean)
        .join(" ")
    )
  )

  const overlapCount = candidateTokens.filter((token) =>
    contextTokens.has(token)
  ).length

  return overlapCount >= Math.min(2, candidateTokens.length)
}

function inferContinuityTopics(
  structuredMemory: StructuredMemory,
  transcript: string
) {
  const combinedText = cleanSignalText(
    [
      transcript,
      structuredMemory.oneLineSummary,
      ...structuredMemory.newFindings,
      ...structuredMemory.unresolvedItems,
      ...structuredMemory.followUpNeeded,
    ]
      .filter(Boolean)
      .join(" ")
  )

  if (!CONTINUITY_CUE_PATTERN.test(combinedText)) {
    return []
  }

  const topics: string[] = []

  if (/\bpossible infection\b/i.test(combinedText)) {
    topics.push("Possible infection workup")
  } else if (/\bsepsis bundle\b/i.test(combinedText)) {
    topics.push("Sepsis bundle")
  } else if (
    /\bfluid balance\b/i.test(combinedText) ||
    (/\bovernight output\b/i.test(combinedText) &&
      /\bmorning weight\b/i.test(combinedText)) ||
    (/\bdiuresis\b/i.test(combinedText) && /\bedema\b/i.test(combinedText))
  ) {
    topics.push("Fluid balance trend")
  } else if (/\bdischarge teaching\b/i.test(combinedText)) {
    topics.push("Discharge teaching readiness")
  }

  if (
    [transcript, ...structuredMemory.unresolvedItems, ...structuredMemory.followUpNeeded].some(
      (item) => CALLBACK_CONTINUITY_PATTERN.test(item)
    )
  ) {
    topics.push("callback concern")
  }

  return dedupe(topics).slice(0, 2)
}

export function deriveMemoryContinuitySignal({
  structuredMemory,
  transcript = "",
}: {
  structuredMemory: StructuredMemory
  transcript?: string
}) {
  const normalizedMemory = normalizeStructuredMemory(structuredMemory)
  const carryForwardSubjects = dedupe(
    normalizedMemory.carriedForward.map(extractContinuitySubject).filter(Boolean)
  )

  if (carryForwardSubjects.length) {
    const topics = [carryForwardSubjects[0]]

    if (
      [transcript, ...normalizedMemory.unresolvedItems, ...normalizedMemory.followUpNeeded].some(
        (item) => CALLBACK_CONTINUITY_PATTERN.test(item)
      ) &&
      !/callback/i.test(topics[0])
    ) {
      topics.push("callback concern")
    }

    const shiftSource = buildContinuityShiftSource(normalizedMemory, transcript)

    return cleanSignalText(
      `${topics.join(" and ")} ${topics.length > 1 ? "are" : "is"} carried forward ${shiftSource}.`
    )
  }

  const inferredTopics = inferContinuityTopics(normalizedMemory, transcript)

  if (inferredTopics.length) {
    const shiftSource = buildContinuityShiftSource(normalizedMemory, transcript)

    return cleanSignalText(
      `${inferredTopics.join(" and ")} ${
        inferredTopics.length > 1 ? "are" : "is"
      } carried forward ${shiftSource}.`
    )
  }

  const candidate = cleanSignalText(
    normalizedMemory.visualSignals.memoryContinuity
  )

  if (
    candidate &&
    isGroundedMemoryContinuityCandidate(candidate, normalizedMemory, transcript)
  ) {
    return candidate
  }

  return ""
}

export function finalizeRelayStatus({
  transcript,
  structuredMemory,
}: {
  transcript: string
  structuredMemory: StructuredMemory
}): RelayStatus {
  const normalizedMemory = normalizeStructuredMemory(structuredMemory)
  const escalationReasons = dedupe(normalizedMemory.escalationTriggers)
  const combinedText = [
    transcript,
    normalizedMemory.oneLineSummary,
    ...normalizedMemory.newFindings,
    ...normalizedMemory.unresolvedItems,
    ...normalizedMemory.followUpNeeded,
    ...escalationReasons,
  ]
    .filter(Boolean)
    .join(" ")
  const hasActiveEscalation =
    ACTIVE_ESCALATION_PATTERN.test(combinedText) ||
    escalationReasons.some(
      (reason) =>
        IMMEDIATE_ACTION_PATTERN.test(reason) &&
        !isConditionalEscalationReason(reason)
    )

  if (hasActiveEscalation) {
    return "Escalate"
  }

  const hasRoutineStableSignals =
    ROUTINE_STABLE_PATTERN.test(combinedText) &&
    !WORSENING_PATTERN.test(combinedText) &&
    !PENDING_CALLBACK_PATTERN.test(combinedText) &&
    normalizedMemory.unresolvedItems.length <= 1

  if (hasRoutineStableSignals) {
    return "Stable"
  }

  const hasWatchSignals =
    WORSENING_PATTERN.test(combinedText) ||
    PENDING_CALLBACK_PATTERN.test(combinedText) ||
    normalizedMemory.unresolvedItems.length > 0 ||
    normalizedMemory.followUpNeeded.length > 0 ||
    escalationReasons.length > 0

  if (hasWatchSignals) {
    return "Watch"
  }

  return "Stable"
}

export function formatClinicalTime(timestamp: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp))
}

export function formatClinicalStamp(timestamp: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp))
}

export function getStatusMeta(status: CaseStatus) {
  return statusMeta[status]
}

export function parseDurationLabel(durationLabel?: string) {
  if (!durationLabel) {
    return 0
  }

  const [minutes = 0, seconds = 0] = durationLabel.split(":").map(Number)
  return minutes * 60 + seconds
}

export function formatDurationLabelFromScript(script: string) {
  const wordCount = script.trim().split(/\s+/).filter(Boolean).length
  const durationInSeconds = Math.max(Math.round((wordCount / 150) * 60), 10)
  const minutes = Math.floor(durationInSeconds / 60)
  const seconds = durationInSeconds % 60

  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export function slugify(value: string) {
  const sanitizedValue = value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")

  return sanitizedValue || "relay"
}

function dedupe(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)))
}

function buildOneLineSummary(
  structuredMemory: StructuredMemory,
  transcript: string
) {
  if (structuredMemory.oneLineSummary) {
    return structuredMemory.oneLineSummary
  }

  const firstSentence = transcript.split(/(?<=[.!?])\s+/)[0]?.trim() ?? ""

  if (!firstSentence) {
    return "Structured relay created from the current handoff."
  }

  const words = firstSentence.split(/\s+/).filter(Boolean)
  return words.length > 22 ? `${words.slice(0, 22).join(" ")}.` : firstSentence
}

function buildAudioSummaryScript(
  structuredMemory: StructuredMemory,
  patientLabel: string,
  oneLineSummary: string
) {
  if (structuredMemory.audioSummaryScript) {
    return structuredMemory.audioSummaryScript
  }

  const script = [
    patientLabel ? `${patientLabel}.` : "",
    oneLineSummary,
    structuredMemory.newFindings[0] ?? "",
    structuredMemory.unresolvedItems[0] ?? "",
    structuredMemory.escalationTriggers[0] ?? "",
  ]
    .filter(Boolean)
    .join(" ")
    .trim()

  return script
}

export function createRelayFromStructuredMemory({
  transcript,
  structuredMemory,
  source = "generated",
  createdAt = new Date().toISOString(),
  id = crypto.randomUUID(),
  slug,
  handoffMode = "typed",
  handoffLabel = "Clinical relay",
  clinicianLabel = source === "seeded" ? "Outgoing clinician" : "New relay draft",
  unit,
  room,
  age,
  diagnosis,
  story,
  timeline,
  audioSummary,
  escalationActionText,
}: CreateRelayOptions): RelayRecord {
  const normalizedMemory = normalizeStructuredMemory(structuredMemory)
  const finalStatus = finalizeRelayStatus({
    transcript,
    structuredMemory: normalizedMemory,
  })
  const memoryContinuity = deriveMemoryContinuitySignal({
    transcript,
    structuredMemory: normalizedMemory,
  })
  const patientLabel = normalizedMemory.patientName
  const oneLineSummary = buildOneLineSummary(normalizedMemory, transcript)
  const audioSummaryScript = buildAudioSummaryScript(
    normalizedMemory,
    patientLabel,
    oneLineSummary
  )
  const relaySlug =
    slug ??
    `${slugify(patientLabel || "relay")}-${id.slice(0, 8).toLowerCase()}`

  return {
    id,
    slug: relaySlug,
    patientName: patientLabel,
    status: finalStatus,
    oneLineSummary,
    structuredMemory: {
      ...normalizedMemory,
      currentStatus: finalStatus,
      oneLineSummary,
      audioSummaryScript,
      visualSignals: {
        ...normalizedMemory.visualSignals,
        memoryContinuity,
      },
    },
    unresolvedCount: normalizedMemory.unresolvedItems.length,
    carriedForwardCount: normalizedMemory.carriedForward.length,
    audioSummary:
      audioSummary ??
      (source === "seeded"
        ? {
            status: "ready",
            script: audioSummaryScript,
            provider: "pending",
            voiceName: "Configured ElevenLabs voice",
            durationLabel: formatDurationLabelFromScript(audioSummaryScript),
            lastGeneratedAt: createdAt,
            fallbackReason: "Voice summary will generate on first playback request.",
          }
        : {
            status: "generating",
            script: audioSummaryScript,
            provider: "pending",
            voiceName: "Configured ElevenLabs voice",
            durationLabel: formatDurationLabelFromScript(audioSummaryScript),
          }),
    createdAt,
    updatedAt: createdAt,
    transcript,
    handoffLabel,
    clinicianLabel,
    handoffMode,
    unit,
    room,
    age,
    diagnosis,
    story,
    carriedForwardLabel: "Carried forward from previous shift",
    escalationActionText,
    timeline:
      timeline ??
      [
        {
          id: `${relaySlug}-captured`,
          timestamp: createdAt,
          title: "Relay created",
          description:
            source === "seeded"
              ? "Seeded relay loaded into the active caseboard."
              : "Structured memory was converted into a new active relay.",
          actor: "Relay store",
          tone: "handoff",
        },
      ],
    source,
  }
}

export function getRelayDisplayName(relay: RelayRecord) {
  return relay.patientName || "Unnamed patient"
}

export function getRelayDisplayLine(relay: RelayRecord) {
  return [relay.diagnosis, relay.room ? `Room ${relay.room}` : "", relay.unit]
    .filter(Boolean)
    .join(" | ")
}

export function getRelayStory(relay: RelayRecord) {
  return relay.story || relay.oneLineSummary || "Structured relay is ready."
}

export function getRelayWhatChanged(relay: RelayRecord) {
  return relay.structuredMemory.newFindings.length
    ? relay.structuredMemory.newFindings
    : ["No new findings were extracted from this handoff."]
}

export function getRelayCarriedForwardNote(relay: RelayRecord) {
  return (
    relay.structuredMemory.carriedForward[0] ||
    "No carried-forward items were explicitly captured in this relay."
  )
}

export function getRelayStatusNote(relay: RelayRecord) {
  if (relay.status === "Escalate") {
    return (
      relay.structuredMemory.escalationTriggers[0] ||
      "Immediate escalation is active for this relay."
    )
  }

  if (relay.status === "Watch") {
    return relay.unresolvedCount
      ? `${relay.unresolvedCount} unresolved item${relay.unresolvedCount === 1 ? "" : "s"} remain under active watch.`
      : "This relay is on watch for continued follow-up."
  }

  return relay.unresolvedCount
    ? `${relay.unresolvedCount} follow-up item${relay.unresolvedCount === 1 ? "" : "s"} remain, but the relay is stable.`
    : "The relay is stable and ready for the next shift."
}

export function getRelaySignals(relay: RelayRecord): CaseSignal[] {
  const memoryContinuity = deriveMemoryContinuitySignal({
    transcript: relay.transcript,
    structuredMemory: relay.structuredMemory,
  })

  return [
    {
      label: "Voice signal",
      value:
        relay.structuredMemory.visualSignals.voiceSignal ||
        "No voice signal extracted yet",
      tone: "teal",
    },
    {
      label: "Memory continuity",
      value: memoryContinuity || "No carried-forward state captured",
      tone: "violet",
    },
    {
      label: "Escalation logic",
      value:
        relay.structuredMemory.visualSignals.escalationLogic ||
        "No explicit escalation trigger extracted",
      tone: relay.status === "Escalate" ? "coral" : "amber",
    },
  ]
}

export function getRelayEscalationRule(relay: RelayRecord) {
  const conditions = dedupe(relay.structuredMemory.escalationTriggers).filter(
    Boolean
  )

  return {
    title: relay.status === "Escalate" ? "Escalation active" : "Escalation logic armed",
    conditions: conditions.length
      ? conditions
      : ["No explicit escalation trigger was captured from this handoff."],
    condition:
      conditions[0] || "No explicit escalation trigger was captured from this handoff.",
    action:
      relay.escalationActionText ||
      "Notify the covering clinician and preserve the updated status in the relay.",
  }
}

export function buildDashboardMetrics(relays: RelayRecord[]): DashboardMetrics {
  const watchOrEscalateCount = relays.filter(
    (relay) => relay.status !== "Stable"
  ).length
  const voiceReadyCount = relays.filter(
    (relay) => relay.audioSummary?.status === "ready"
  ).length

  return {
    activeRelayCount: relays.length,
    watchOrEscalateCount,
    voiceReadyCount,
    shiftConfidence:
      relays.some((relay) => relay.status === "Escalate")
        ? "Guarded"
        : watchOrEscalateCount
          ? "Focused"
          : "High",
  }
}

export function simulateUrgentRelayUpdate(relay: RelayRecord): RelayRecord {
  if (relay.status === "Escalate") {
    return relay
  }

  const now = new Date().toISOString()
  const urgentFinding =
    relay.status === "Watch"
      ? "Condition worsened during active watch and the relay moved into escalation."
      : "An urgent change was logged and the relay moved into escalation."
  const escalationTrigger =
    relay.structuredMemory.escalationTriggers[0] ||
    "Escalate immediately for the new urgent change."
  const updatedStructuredMemory = {
    ...relay.structuredMemory,
    currentStatus: "Escalate" as RelayStatus,
    oneLineSummary: `${relay.oneLineSummary} Status has now escalated.`,
    newFindings: dedupe([urgentFinding, ...relay.structuredMemory.newFindings]),
    unresolvedItems: dedupe([
      "Immediate clinician review is required.",
      ...relay.structuredMemory.unresolvedItems,
    ]),
    escalationTriggers: dedupe([escalationTrigger, ...relay.structuredMemory.escalationTriggers]),
    followUpNeeded: dedupe([
      "Document the urgent change and confirm the escalation plan.",
      ...relay.structuredMemory.followUpNeeded,
    ]),
    audioSummaryScript: [
      getRelayDisplayName(relay),
      "has escalated.",
      urgentFinding,
      escalationTrigger,
    ]
      .filter(Boolean)
      .join(" "),
    visualSignals: {
      ...relay.structuredMemory.visualSignals,
      escalationLogic: escalationTrigger,
      clinicalMemoryResolvesInRealTime: urgentFinding,
    },
  }

  return {
    ...relay,
    status: "Escalate",
    oneLineSummary: updatedStructuredMemory.oneLineSummary,
    structuredMemory: updatedStructuredMemory,
    unresolvedCount: updatedStructuredMemory.unresolvedItems.length,
    updatedAt: now,
    audioSummary: relay.audioSummary
      ? {
          ...relay.audioSummary,
          status: "generating",
          audioUrl: undefined,
          script: updatedStructuredMemory.audioSummaryScript,
          provider: "pending",
          fallbackReason: undefined,
          durationLabel: formatDurationLabelFromScript(
            updatedStructuredMemory.audioSummaryScript
          ),
          errorMessage: undefined,
        }
      : undefined,
    timeline: [
      {
        id: `${relay.slug}-urgent-update-${now}`,
        timestamp: now,
        title: "Urgent update recorded",
        description:
          "The relay status changed to Escalate and the dashboard should refresh immediately.",
        actor: "Incoming nurse",
        tone: "escalation",
      },
      ...relay.timeline,
    ],
  }
}

export function createRelayDraftInput(transcript: string): RelayDraftInput {
  return {
    transcript: transcript.trim(),
  }
}

export function asCase(relay: RelayRecord): Case {
  return relay
}
