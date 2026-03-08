import { createRelayFromStructuredMemory } from "@/lib/relay"
import type { RelayRecord } from "@/types/relay"

export const seededRelays: RelayRecord[] = [
  createRelayFromStructuredMemory({
    id: "elina-moreau",
    slug: "elina-moreau",
    source: "seeded",
    transcript:
      "Mrs. Elina Moreau is 78 with dementia and possible infection. She has been more confused than baseline since late afternoon. Intake was low again this shift, maybe a few sips at dinner and half the applesauce with meds. After medications she started a wet cough that I did not hear earlier. Lungs are still coarse at the bases. Temp came down after Tylenol but I am still waiting on the physician callback. If breathing worsens or fever rises again tonight, escalate immediately.",
    structuredMemory: {
      patientName: "Mrs. Elina Moreau",
      oneLineSummary:
        "High-risk overnight watch for infection progression, dehydration, and respiratory decline in a patient with dementia.",
      currentStatus: "Watch",
      newFindings: [
        "Confusion increased above baseline during the evening shift.",
        "New wet cough emerged immediately after medication administration.",
        "Persistent low oral intake raises dehydration risk overnight.",
      ],
      carriedForward: [
        "Possible infection workup remains unresolved from the prior shift.",
        "Family noted confusion drift over the last 24 hours.",
      ],
      unresolvedItems: [
        "Physician callback remains pending.",
        "Need overnight reassessment of lung sounds and temperature trend.",
        "Clarify whether aspiration precautions should be intensified.",
        "Track urine output if intake remains poor.",
      ],
      escalationTriggers: [
        "If breathing worsens or fever rises again tonight, escalate immediately.",
        "Escalate for sustained inability to clear secretions after meds.",
      ],
      followUpNeeded: [
        "Repeat temperature and respiratory assessment at 02:00.",
        "Document intake tolerance after the next hydration attempt.",
        "Recontact physician if callback is not received within the hour.",
      ],
      audioSummaryScript:
        "Elina Moreau remains on watch. Confusion is above baseline, intake stayed low, and a new wet cough started after medications. Physician callback is still pending. If breathing worsens or fever rises again tonight, escalate immediately.",
      visualSignals: {
        voiceSignal:
          "Wet cough after medications and confusion above baseline were captured from the spoken relay.",
        memoryContinuity:
          "Possible infection workup and callback concern are carried forward from the prior shift.",
        escalationLogic:
          "If breathing worsens or fever rises again tonight, escalate immediately.",
        clinicalMemoryResolvesInRealTime:
          "The relay separates what changed tonight from what remains unresolved overnight.",
      },
    },
    createdAt: "2026-03-07T23:46:00-05:00",
    handoffMode: "voice",
    handoffLabel: "Evening to Night Relay",
    clinicianLabel: "Nurse T. Alvarez, RN",
    unit: "Neuro Stepdown",
    room: "412B",
    age: 78,
    diagnosis: "Dementia, possible infection, low intake",
    story:
      "Confusion is above baseline tonight. Intake stayed low, cough turned wet after medications, and the physician callback is still pending.",
    escalationActionText:
      "Notify physician, trigger respiratory reassessment, and move the case into active escalation.",
    timeline: [
      {
        id: "evt-elina-1",
        timestamp: "2026-03-07T23:46:00-05:00",
        title: "Voice handoff captured",
        description:
          "Night shift relay captured from outgoing nurse and persisted as structured memory.",
        actor: "Relay capture",
        tone: "handoff",
      },
      {
        id: "evt-elina-2",
        timestamp: "2026-03-07T23:53:00-05:00",
        title: "Memory updated with new cough",
        description:
          "System promoted the post-med wet cough into the active continuity layer.",
        actor: "Case memory",
        tone: "memory",
      },
      {
        id: "evt-elina-3",
        timestamp: "2026-03-08T00:18:00-05:00",
        title: "Escalation logic armed",
        description:
          "Breathing decline or recurrent fever now triggers immediate overnight escalation.",
        actor: "Clinical logic",
        tone: "warning",
      },
    ],
  }),
  createRelayFromStructuredMemory({
    id: "mateo-ruiz",
    slug: "mateo-ruiz",
    source: "seeded",
    transcript:
      "Mateo Ruiz is improving post-op. He tolerated oral pain meds, walked twice with assistance, and has bowel sounds returning. Keep an eye on nausea overnight, but overall he is much more comfortable than yesterday.",
    structuredMemory: {
      patientName: "Mateo Ruiz",
      oneLineSummary:
        "Routine recovery handoff with low overnight risk and one GI follow-up item.",
      currentStatus: "Stable",
      newFindings: [
        "Transition to oral pain control was successful.",
        "Mobility improved to two assisted hallway walks.",
      ],
      carriedForward: [
        "Continue discharge teaching readiness assessment from day shift.",
      ],
      unresolvedItems: ["Confirm first post-op bowel movement."],
      escalationTriggers: [
        "Escalate for worsening abdominal distention or uncontrolled pain.",
      ],
      followUpNeeded: [
        "Assess nausea after midnight snack.",
        "Reinforce incentive spirometry coaching.",
      ],
      audioSummaryScript:
        "Mateo Ruiz is stable post-op. Pain control has improved, he is ambulating with assistance, and overnight follow-up is focused on nausea and return of bowel function.",
      visualSignals: {
        voiceSignal:
          "Pain control and mobility gains were carried directly from the current handoff.",
        memoryContinuity:
          "Discharge teaching readiness remains carried forward from the day shift.",
        escalationLogic:
          "Escalate for worsening abdominal distention or uncontrolled pain.",
        clinicalMemoryResolvesInRealTime:
          "Recovery milestones and the remaining GI follow-up item are kept in one relay.",
      },
    },
    createdAt: "2026-03-07T22:38:00-05:00",
    handoffMode: "typed",
    handoffLabel: "Evening to Night Relay",
    clinicianLabel: "Nurse S. Ahmed, RN",
    unit: "Post-op Surgical",
    room: "305A",
    age: 46,
    diagnosis: "Post-op colectomy, pain control",
    story:
      "Ambulating with assistance, pain improving, bowel sounds returning, and family education is underway.",
    escalationActionText:
      "Notify the surgical team and move the relay into active watch if symptoms worsen.",
    timeline: [
      {
        id: "evt-mateo-1",
        timestamp: "2026-03-07T20:10:00-05:00",
        title: "Pain regimen stepped down",
        description:
          "Switched to oral medications with good control and no breakthrough escalation.",
        actor: "Post-op team",
        tone: "memory",
      },
      {
        id: "evt-mateo-2",
        timestamp: "2026-03-07T22:38:00-05:00",
        title: "Typed handoff saved",
        description:
          "Recovery milestones were preserved for the incoming team.",
        actor: "Relay capture",
        tone: "handoff",
      },
    ],
  }),
  createRelayFromStructuredMemory({
    id: "harper-singh",
    slug: "harper-singh",
    source: "seeded",
    transcript:
      "Harper Singh is escalating. We started the sepsis bundle, pressure is softer than at shift start, and I need the incoming nurse to keep the physician in the loop if MAP slips again or cultures stay delayed.",
    structuredMemory: {
      patientName: "Harper Singh",
      oneLineSummary:
        "High-acuity oncology case already in escalation with hemodynamic monitoring and sepsis timing risk.",
      currentStatus: "Escalate",
      newFindings: [
        "MAP trend softened over the last hour.",
        "Culture timing now risks falling outside the preferred window.",
      ],
      carriedForward: ["Continue active sepsis bundle launched on prior shift."],
      unresolvedItems: [
        "Second culture still pending.",
        "Need lactate follow-up result.",
        "Pressor threshold discussion pending with physician.",
      ],
      escalationTriggers: [
        "Escalate immediately for further MAP decline.",
        "Escalate if fever spikes after antibiotic start.",
      ],
      followUpNeeded: [
        "Verify line access reliability.",
        "Track bundle timing to completion.",
      ],
      audioSummaryScript:
        "Harper Singh is in escalation for neutropenic fever with a soft blood pressure trend. Continue the sepsis bundle, watch MAP closely, and keep the physician actively updated.",
      visualSignals: {
        voiceSignal:
          "Soft blood pressure trend was pulled directly from the current handoff.",
        memoryContinuity:
          "The active sepsis bundle remains carried forward from the prior shift.",
        escalationLogic:
          "Escalate immediately for further MAP decline or fever spike after antibiotics.",
        clinicalMemoryResolvesInRealTime:
          "The relay preserves the sepsis response milestones and the hemodynamic risk together.",
      },
    },
    createdAt: "2026-03-07T23:28:00-05:00",
    handoffMode: "voice",
    handoffLabel: "Evening to Night Relay",
    clinicianLabel: "Nurse K. Osei, RN",
    unit: "Oncology Stepdown",
    room: "518C",
    age: 67,
    diagnosis: "Neutropenic fever, hypotension trend",
    story:
      "Pressure drifted lower over the last hour and the sepsis bundle is already in motion.",
    escalationActionText:
      "Activate physician review and prepare for rapid transfer if needed.",
    timeline: [
      {
        id: "evt-harper-1",
        timestamp: "2026-03-07T22:50:00-05:00",
        title: "Sepsis bundle started",
        description:
          "Antibiotics, fluids, and cultures were initiated for neutropenic fever.",
        actor: "Rapid response",
        tone: "escalation",
      },
      {
        id: "evt-harper-2",
        timestamp: "2026-03-08T00:04:00-05:00",
        title: "Pressure trend worsened",
        description:
          "MAP softened further, keeping the relay in active escalation.",
        actor: "Clinical logic",
        tone: "warning",
      },
    ],
  }),
  createRelayFromStructuredMemory({
    id: "irene-keller",
    slug: "irene-keller",
    source: "seeded",
    transcript:
      "Irene Keller looks better tonight. Oxygen is down to 2 liters and edema is a little softer after diuresis, but we still need a strict overnight output total and morning weight to keep the plan moving.",
    structuredMemory: {
      patientName: "Irene Keller",
      oneLineSummary:
        "Improving cardiopulmonary case with fluid balance continuity needs still active.",
      currentStatus: "Watch",
      newFindings: [
        "Oxygen weaned to 2 liters.",
        "Edema slightly improved after evening diuresis.",
      ],
      carriedForward: [
        "Fluid balance trend remains the key continuity item from day shift.",
      ],
      unresolvedItems: [
        "Need strict overnight output total.",
        "Morning weight must be captured before breakfast.",
      ],
      escalationTriggers: [
        "Escalate for increased work of breathing or rising oxygen demand.",
      ],
      followUpNeeded: [
        "Document diuresis response by 04:00.",
        "Preserve oxygen wean plan in morning handoff.",
      ],
      audioSummaryScript:
        "Irene Keller remains on watch. Oxygen needs have improved, but overnight urine output and morning weight are critical to carry fluid balance forward safely.",
      visualSignals: {
        voiceSignal:
          "Improved oxygen requirement and softer edema were captured from this handoff.",
        memoryContinuity:
          "Fluid balance tracking is carried forward from the earlier shift.",
        escalationLogic:
          "Escalate for increased work of breathing or rising oxygen demand.",
        clinicalMemoryResolvesInRealTime:
          "The relay keeps improvement and overnight fluid-balance follow-up tied together.",
      },
    },
    createdAt: "2026-03-07T21:33:00-05:00",
    handoffMode: "typed",
    handoffLabel: "Evening to Night Relay",
    clinicianLabel: "Nurse J. Brooks, RN",
    unit: "Cardiopulmonary",
    room: "221D",
    age: 84,
    diagnosis: "CHF, COPD flare recovery",
    story:
      "Breathing is improved from admission, but diuresis and morning weight trend still need continuity.",
    escalationActionText:
      "Alert the covering clinician and move the relay into higher-acuity respiratory watch.",
    timeline: [
      {
        id: "evt-irene-1",
        timestamp: "2026-03-07T20:45:00-05:00",
        title: "Oxygen weaned",
        description:
          "Patient tolerated reduction from 3 liters to 2 liters nasal cannula.",
        actor: "Respiratory therapy",
        tone: "memory",
      },
      {
        id: "evt-irene-2",
        timestamp: "2026-03-07T21:33:00-05:00",
        title: "Continuity relay stored",
        description:
          "Overnight output and morning weight were marked as carried-forward priorities.",
        actor: "Relay capture",
        tone: "handoff",
      },
    ],
  }),
]

export const demoCases = seededRelays
export const primarySeedRelay = seededRelays[0]
export const primaryDemoCase = primarySeedRelay
export const composeSeedTranscript = primarySeedRelay.transcript

export function getSeededRelayBySlug(slug: string) {
  return seededRelays.find((relay) => relay.slug === slug)
}

export function getCaseById(id: string) {
  return getSeededRelayBySlug(id)
}
