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
    status: normalizedMemory.currentStatus,
    oneLineSummary,
    structuredMemory: {
      ...normalizedMemory,
      oneLineSummary,
      audioSummaryScript,
    },
    unresolvedCount: normalizedMemory.unresolvedItems.length,
    carriedForwardCount: normalizedMemory.carriedForward.length,
    audioSummary:
      audioSummary ??
      (source === "seeded"
        ? {
            status: "ready",
            script: audioSummaryScript,
            provider: "fallback",
            durationLabel: formatDurationLabelFromScript(audioSummaryScript),
            lastGeneratedAt: createdAt,
          }
        : {
            status: "generating",
            script: audioSummaryScript,
            provider: "pending",
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
      value:
        relay.structuredMemory.visualSignals.memoryContinuity ||
        "No carried-forward state captured",
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
  return {
    title: relay.status === "Escalate" ? "Escalation active" : "Escalation logic armed",
    condition:
      relay.structuredMemory.escalationTriggers[0] ||
      "No explicit escalation trigger was captured from this handoff.",
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
