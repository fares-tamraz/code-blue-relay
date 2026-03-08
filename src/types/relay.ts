export type RelayStatus = "Stable" | "Watch" | "Escalate"

export type CaseStatus = RelayStatus

export type SignalTone = "teal" | "amber" | "coral" | "violet"

export type TimelineTone = "handoff" | "memory" | "warning" | "escalation"

export type RelayDraftInput = {
  transcript: string
}

export type StructuredMemory = {
  patientName: string
  oneLineSummary: string
  currentStatus: RelayStatus
  newFindings: string[]
  carriedForward: string[]
  unresolvedItems: string[]
  escalationTriggers: string[]
  followUpNeeded: string[]
  audioSummaryScript: string
  visualSignals: {
    voiceSignal: string
    memoryContinuity: string
    escalationLogic: string
    clinicalMemoryResolvesInRealTime: string
  }
}

export type RelayAudioSummary = {
  status: "ready" | "generating" | "failed"
  audioUrl?: string
  script: string
  provider?: "elevenlabs" | "fallback" | "pending"
  voiceName?: string
  requestedVoiceId?: string
  usedVoiceId?: string
  durationLabel?: string
  lastGeneratedAt?: string
  errorMessage?: string
  fallbackReason?: string
}

export type Relay = {
  id: string
  slug: string
  patientName: string
  status: RelayStatus
  oneLineSummary: string
  structuredMemory: StructuredMemory
  unresolvedCount: number
  carriedForwardCount: number
  audioSummary?: RelayAudioSummary
  createdAt: string
  updatedAt: string
}

export type TimelineEvent = {
  id: string
  timestamp: string
  title: string
  description: string
  actor: string
  tone: TimelineTone
}

export type CaseSignal = {
  label: string
  value: string
  tone: SignalTone
}

export type RelayRecord = Relay & {
  transcript: string
  handoffLabel: string
  clinicianLabel: string
  handoffMode: "voice" | "typed"
  unit?: string
  room?: string
  age?: number
  diagnosis?: string
  story?: string
  carriedForwardLabel: string
  escalationActionText?: string
  timeline: TimelineEvent[]
  source: "seeded" | "generated"
}

export type Case = RelayRecord

export type DashboardMetrics = {
  activeRelayCount: number
  watchOrEscalateCount: number
  voiceReadyCount: number
  shiftConfidence: "High" | "Focused" | "Guarded"
}
