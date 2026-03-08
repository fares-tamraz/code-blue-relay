import type { Case, CaseStatus, SignalTone } from "@/types/relay"

type StatusMeta = {
  label: CaseStatus
  chipClassName: string
  surfaceClassName: string
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

export function parseDurationLabel(durationLabel: string) {
  const [minutes, seconds] = durationLabel.split(":").map(Number)
  return minutes * 60 + seconds
}

export function simulateUrgentCaseUpdate(caseData: Case): Case {
  if (caseData.status === "Escalate") {
    return caseData
  }

  const updatedUnresolvedItems = [
    "Prepare immediate physician escalation for respiratory decline.",
    ...caseData.structuredMemory.unresolvedItems,
  ]

  return {
    ...caseData,
    status: "Escalate",
    statusNote:
      "Breathing worsened overnight. Immediate escalation is now active.",
    lastUpdated: "2026-03-08T00:43:00-05:00",
    unresolvedCount: updatedUnresolvedItems.length,
    whatChanged: [
      "Breathing effort increased during the latest overnight reassessment.",
      ...caseData.whatChanged,
    ],
    structuredMemory: {
      ...caseData.structuredMemory,
      summary:
        "Case has moved from watch to escalation after overnight breathing decline.",
      newFindings: [
        "Work of breathing increased during the urgent overnight check.",
        ...caseData.structuredMemory.newFindings,
      ],
      unresolvedItems: updatedUnresolvedItems,
      followUpNeeded: [
        "Stay at bedside until physician plan is confirmed.",
        ...caseData.structuredMemory.followUpNeeded,
      ],
    },
    timeline: [
      {
        id: `${caseData.id}-urgent-update`,
        timestamp: "2026-03-08T00:43:00-05:00",
        title: "Urgent overnight update",
        description:
          "Breathing worsened and the case crossed the escalation threshold.",
        actor: "Incoming nurse",
        tone: "escalation",
      },
      ...caseData.timeline,
    ],
    liveSignals: [
      {
        label: "Escalation active",
        value: "Breathing worsened",
        tone: "coral",
      },
      ...caseData.liveSignals.filter(
        (signal) => signal.label !== "Respiratory watch"
      ),
    ],
    audioSummary: {
      ...caseData.audioSummary,
      transcript:
        "Elina Moreau has escalated. Breathing worsened overnight on top of confusion above baseline, low intake, and the earlier wet cough after medications. Physician escalation should happen immediately.",
      lastGeneratedAt: "2026-03-08T00:43:00-05:00",
    },
  }
}
