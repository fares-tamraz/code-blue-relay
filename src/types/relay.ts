export type CaseStatus = "Stable" | "Watch" | "Escalate"

export type SignalTone = "teal" | "amber" | "coral" | "violet"

export type TimelineTone = "handoff" | "memory" | "warning" | "escalation"

export type CaseSignal = {
  label: string
  value: string
  tone: SignalTone
}

export type Handoff = {
  id: string
  shiftLabel: string
  clinician: string
  capturedAt: string
  mode: "voice" | "typed"
  transcript: string
}

export type StructuredMemory = {
  summary: string
  newFindings: string[]
  unresolvedItems: string[]
  escalationTriggers: string[]
  followUpNeeded: string[]
  carriedForward: string[]
}

export type EscalationRule = {
  id: string
  title: string
  condition: string
  action: string
  severity: "watch" | "escalate"
}

export type TimelineEvent = {
  id: string
  timestamp: string
  title: string
  description: string
  actor: string
  tone: TimelineTone
}

export type AudioSummary = {
  id: string
  voiceName: string
  durationLabel: string
  transcript: string
  status: "ready" | "generating" | "mock"
  provider: "elevenlabs" | "mock"
  audioUrl: string | null
  lastGeneratedAt: string
}

export type Case = {
  id: string
  patientName: string
  age: number
  room: string
  unit: string
  diagnosis: string
  story: string
  status: CaseStatus
  statusNote: string
  lastUpdated: string
  unresolvedCount: number
  carriedForwardLabel: string
  carriedForwardNote: string
  whatChanged: string[]
  handoff: Handoff
  structuredMemory: StructuredMemory
  escalationRule: EscalationRule
  audioSummary: AudioSummary
  timeline: TimelineEvent[]
  liveSignals: CaseSignal[]
}
