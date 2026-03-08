export type DemoTranscriptPreset = {
  id: string
  label: string
  context: string
  handoffMode: "voice" | "typed"
  transcript: string
}

export const demoTranscriptPresets: DemoTranscriptPreset[] = [
  {
    id: "nora-patel-infection-watch",
    label: "Nora Patel",
    context: "Watch | infection workup + callback",
    handoffMode: "voice",
    transcript:
      "Nora Patel is 82 with possible infection. She is more confused than baseline, intake stayed poor, and I am still waiting on the physician callback. Prior shift asked us to keep the infection workup carried forward overnight. Recheck temp at 02:00. If breathing worsens, escalate.",
  },
  {
    id: "devon-lee-postop-stable",
    label: "Devon Lee",
    context: "Stable | no carry-forward continuity",
    handoffMode: "typed",
    transcript:
      "Devon Lee is stable after knee replacement. Pain is controlled on oral meds and he walked twice with one assist. Recheck nausea after midnight. If pain breaks through the current regimen, escalate.",
  },
  {
    id: "maya-garcia-sepsis-escalate",
    label: "Maya Garcia",
    context: "Escalate | sepsis bundle in motion",
    handoffMode: "voice",
    transcript:
      "Maya Garcia is already escalating for sepsis. The sepsis bundle started before shift change and the repeat culture is still pending from the prior shift. Lactate redraw is due now. Escalate immediately if MAP drops again or fever spikes after antibiotics.",
  },
  {
    id: "owen-brooks-fluid-watch",
    label: "Owen Brooks",
    context: "Watch | fluid balance continuity",
    handoffMode: "typed",
    transcript:
      "Owen Brooks is on watch for heart failure recovery. Oxygen is down to 2 liters and edema is a little softer after diuresis. Day shift needs the fluid balance trend carried forward into morning rounds, including the overnight output total and morning weight. If oxygen demand rises or work of breathing increases, escalate.",
  },
]

export const defaultDemoTranscriptPreset = demoTranscriptPresets[0]
