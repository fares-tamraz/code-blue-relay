import type { Case } from "@/types/relay"

export const demoCases: Case[] = [
  {
    id: "elina-moreau",
    patientName: "Mrs. Elina Moreau",
    age: 78,
    room: "412B",
    unit: "Neuro Stepdown",
    diagnosis: "Dementia, possible infection, low intake",
    story:
      "Confusion is above baseline tonight. Intake stayed low, cough turned wet after medications, and the physician callback is still pending.",
    status: "Watch",
    statusNote:
      "Respiratory watch is active while the team waits on a physician callback.",
    lastUpdated: "2026-03-08T00:18:00-05:00",
    unresolvedCount: 4,
    carriedForwardLabel: "Carried forward from previous shift",
    carriedForwardNote:
      "Physician callback pending on fever trend, cough after meds, and whether to broaden infectious workup tonight.",
    whatChanged: [
      "Confusion rose above her daytime baseline during evening med pass.",
      "Wet cough appeared after medications and was not present on prior handoff.",
      "Oral intake stayed poor despite repeated prompting and family encouragement.",
    ],
    handoff: {
      id: "handoff-elina-pm",
      shiftLabel: "Evening to Night Relay",
      clinician: "Nurse T. Alvarez, RN",
      capturedAt: "2026-03-07T23:46:00-05:00",
      mode: "voice",
      transcript:
        "Mrs. Elina Moreau is 78 with dementia and possible infection. She has been more confused than baseline since late afternoon. Intake was low again this shift, maybe a few sips at dinner and half the applesauce with meds. After medications she started a wet cough that I did not hear earlier. Lungs are still coarse at the bases. Temp came down after Tylenol but I am still waiting on the physician callback. If breathing worsens or fever rises again tonight, escalate immediately.",
    },
    structuredMemory: {
      summary:
        "High-risk overnight watch for infection progression, dehydration, and respiratory decline in a patient with dementia.",
      newFindings: [
        "Confusion increased above baseline during the evening shift.",
        "New wet cough emerged immediately after medication administration.",
        "Persistent low oral intake raises dehydration risk overnight.",
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
      carriedForward: [
        "Possible infection workup remains unresolved from the prior shift.",
        "Family noted confusion drift over the last 24 hours.",
      ],
    },
    escalationRule: {
      id: "rule-elina-breathing-fever",
      title: "Night respiratory infection watch",
      condition:
        "If breathing worsens or fever rises again tonight, escalate immediately.",
      action:
        "Notify physician, trigger respiratory reassessment, and move the case into active escalation.",
      severity: "escalate",
    },
    audioSummary: {
      id: "audio-elina",
      voiceName: "Clinical Night Voice",
      durationLabel: "0:30",
      transcript:
        "Elina Moreau remains on watch. Confusion is above baseline, intake stayed low, and a new wet cough started after medications. Physician callback is still pending. If breathing worsens or fever rises again tonight, escalate immediately.",
      status: "mock",
      provider: "mock",
      audioUrl: null,
      lastGeneratedAt: "2026-03-07T23:49:00-05:00",
    },
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
          "System promoted post-med wet cough into new findings and linked it to aspiration watch.",
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
    liveSignals: [
      {
        label: "Respiratory watch",
        value: "Wet cough after meds",
        tone: "amber",
      },
      {
        label: "Continuity memory",
        value: "Callback pending",
        tone: "violet",
      },
      {
        label: "Hydration",
        value: "Low intake",
        tone: "teal",
      },
    ],
  },
  {
    id: "mateo-ruiz",
    patientName: "Mateo Ruiz",
    age: 46,
    room: "305A",
    unit: "Post-op Surgical",
    diagnosis: "Post-op colectomy, pain control",
    story:
      "Ambulating with assistance, pain improving, bowel sounds returning, and family education is underway.",
    status: "Stable",
    statusNote:
      "Recovery is on plan with one overnight follow-up around bowel function.",
    lastUpdated: "2026-03-07T22:54:00-05:00",
    unresolvedCount: 1,
    carriedForwardLabel: "Carried forward from previous shift",
    carriedForwardNote:
      "Continue bowel function watch and reinforce discharge teaching in the morning.",
    whatChanged: [
      "Pain is controlled on oral medications for the first full shift.",
      "Patient completed two assisted hallway walks without dizziness.",
    ],
    handoff: {
      id: "handoff-mateo-pm",
      shiftLabel: "Evening to Night Relay",
      clinician: "Nurse S. Ahmed, RN",
      capturedAt: "2026-03-07T22:38:00-05:00",
      mode: "typed",
      transcript:
        "Mateo Ruiz is improving post-op. He tolerated oral pain meds, walked twice with assistance, and has bowel sounds returning. Keep an eye on nausea overnight, but overall he is much more comfortable than yesterday.",
    },
    structuredMemory: {
      summary:
        "Routine recovery handoff with low overnight risk and one GI follow-up item.",
      newFindings: [
        "Transition to oral pain control was successful.",
        "Mobility improved to two assisted hallway walks.",
      ],
      unresolvedItems: ["Confirm first post-op bowel movement."],
      escalationTriggers: [
        "Escalate for worsening abdominal distention or uncontrolled pain.",
      ],
      followUpNeeded: [
        "Assess nausea after midnight snack.",
        "Reinforce incentive spirometry coaching.",
      ],
      carriedForward: [
        "Continue discharge teaching readiness assessment from day shift.",
      ],
    },
    escalationRule: {
      id: "rule-mateo-postop",
      title: "Post-op discomfort guardrail",
      condition:
        "Escalate for worsening abdominal distention, uncontrolled pain, or persistent vomiting.",
      action:
        "Notify surgical team and convert the case to active watch.",
      severity: "watch",
    },
    audioSummary: {
      id: "audio-mateo",
      voiceName: "Clinical Night Voice",
      durationLabel: "0:18",
      transcript:
        "Mateo Ruiz is stable post-op. Pain control has improved, he is ambulating with assistance, and overnight follow-up is focused on nausea and return of bowel function.",
      status: "mock",
      provider: "mock",
      audioUrl: null,
      lastGeneratedAt: "2026-03-07T22:40:00-05:00",
    },
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
    liveSignals: [
      {
        label: "Pain plan",
        value: "Oral control",
        tone: "teal",
      },
      {
        label: "Mobility",
        value: "2 hallway walks",
        tone: "violet",
      },
      {
        label: "Open item",
        value: "Bowel movement",
        tone: "amber",
      },
    ],
  },
  {
    id: "harper-singh",
    patientName: "Harper Singh",
    age: 67,
    room: "518C",
    unit: "Oncology Stepdown",
    diagnosis: "Neutropenic fever, hypotension trend",
    story:
      "Pressure drifted lower over the last hour and the sepsis bundle is already in motion.",
    status: "Escalate",
    statusNote:
      "Immediate physician and charge nurse awareness required.",
    lastUpdated: "2026-03-08T00:04:00-05:00",
    unresolvedCount: 3,
    carriedForwardLabel: "Carried forward from previous shift",
    carriedForwardNote:
      "Follow culture timing closely and maintain sepsis bundle milestones from prior relay.",
    whatChanged: [
      "Blood pressure continued drifting despite fluid support.",
      "Second set of cultures was delayed and remains outstanding.",
    ],
    handoff: {
      id: "handoff-harper-pm",
      shiftLabel: "Evening to Night Relay",
      clinician: "Nurse K. Osei, RN",
      capturedAt: "2026-03-07T23:28:00-05:00",
      mode: "voice",
      transcript:
        "Harper Singh is escalating. We started the sepsis bundle, pressure is softer than at shift start, and I need the incoming nurse to keep the physician in the loop if MAP slips again or cultures stay delayed.",
    },
    structuredMemory: {
      summary:
        "High-acuity oncology case already in escalation with hemodynamic monitoring and sepsis timing risk.",
      newFindings: [
        "MAP trend softened over the last hour.",
        "Culture timing now risks falling outside the preferred window.",
      ],
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
      carriedForward: [
        "Continue active sepsis bundle launched on prior shift.",
      ],
    },
    escalationRule: {
      id: "rule-harper-sepsis",
      title: "Sepsis response",
      condition:
        "If MAP declines further or fever spikes after antibiotics, escalate immediately.",
      action:
        "Activate physician review and prepare for rapid transfer if needed.",
      severity: "escalate",
    },
    audioSummary: {
      id: "audio-harper",
      voiceName: "Clinical Night Voice",
      durationLabel: "0:23",
      transcript:
        "Harper Singh is in escalation for neutropenic fever with a soft blood pressure trend. Continue the sepsis bundle, watch MAP closely, and keep the physician actively updated.",
      status: "mock",
      provider: "mock",
      audioUrl: null,
      lastGeneratedAt: "2026-03-07T23:29:00-05:00",
    },
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
          "MAP softened further, keeping the case in active escalation.",
        actor: "Clinical logic",
        tone: "warning",
      },
    ],
    liveSignals: [
      {
        label: "Sepsis bundle",
        value: "In motion",
        tone: "coral",
      },
      {
        label: "Hemodynamics",
        value: "Pressure soft",
        tone: "amber",
      },
      {
        label: "Cultures",
        value: "One pending",
        tone: "violet",
      },
    ],
  },
  {
    id: "irene-keller",
    patientName: "Irene Keller",
    age: 84,
    room: "221D",
    unit: "Cardiopulmonary",
    diagnosis: "CHF, COPD flare recovery",
    story:
      "Breathing is improved from admission, but diuresis and morning weight trend still need continuity.",
    status: "Watch",
    statusNote:
      "Low-friction overnight watch for fluid balance and morning respiratory reassessment.",
    lastUpdated: "2026-03-07T21:52:00-05:00",
    unresolvedCount: 2,
    carriedForwardLabel: "Carried forward from previous shift",
    carriedForwardNote:
      "Keep morning weight, urine output, and oxygen wean plan connected across shifts.",
    whatChanged: [
      "Oxygen requirement dropped from 3 liters to 2 liters.",
      "Peripheral edema is slightly improved after evening diuresis.",
    ],
    handoff: {
      id: "handoff-irene-pm",
      shiftLabel: "Evening to Night Relay",
      clinician: "Nurse J. Brooks, RN",
      capturedAt: "2026-03-07T21:33:00-05:00",
      mode: "typed",
      transcript:
        "Irene Keller looks better tonight. Oxygen is down to 2 liters and edema is a little softer after diuresis, but we still need a strict overnight output total and morning weight to keep the plan moving.",
    },
    structuredMemory: {
      summary:
        "Improving cardiopulmonary case with fluid balance continuity needs still active.",
      newFindings: [
        "Oxygen weaned to 2 liters.",
        "Edema slightly improved after evening diuresis.",
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
      carriedForward: [
        "Fluid balance trend remains the key continuity item from day shift.",
      ],
    },
    escalationRule: {
      id: "rule-irene-fluid",
      title: "Fluid balance watch",
      condition:
        "Escalate for increased work of breathing, rising oxygen demand, or poor diuretic response.",
      action:
        "Alert covering clinician and convert to higher acuity respiratory watch.",
      severity: "watch",
    },
    audioSummary: {
      id: "audio-irene",
      voiceName: "Clinical Night Voice",
      durationLabel: "0:19",
      transcript:
        "Irene Keller remains on watch. Oxygen needs have improved, but overnight urine output and morning weight are critical to carry fluid balance forward safely.",
      status: "mock",
      provider: "mock",
      audioUrl: null,
      lastGeneratedAt: "2026-03-07T21:36:00-05:00",
    },
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
    liveSignals: [
      {
        label: "Oxygen",
        value: "2 liters NC",
        tone: "teal",
      },
      {
        label: "Fluid watch",
        value: "Output pending",
        tone: "amber",
      },
      {
        label: "Continuity",
        value: "Morning weight",
        tone: "violet",
      },
    ],
  },
]

export const primaryDemoCase = demoCases[0]

export const composeSeedTranscript = primaryDemoCase.handoff.transcript

export function getCaseById(id: string) {
  return demoCases.find((demoCase) => demoCase.id === id)
}
