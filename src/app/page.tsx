import Link from "next/link"
import {
  ArrowRight,
  AudioLines,
  CheckCircle2,
  HeartPulse,
  Layers3,
  ShieldAlert,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { primarySeedRelay } from "@/data/demo-cases"

import { LiveCasePreview } from "@/components/relay/live-case-preview"
import { MemoryStrands } from "@/components/relay/memory-strands"
import { SectionHeading } from "@/components/relay/section-heading"

const problemCards = [
  {
    title: "Critical nuance gets flattened",
    body:
      "A wet cough after meds, confusion above baseline, a callback that still has not come back. These details often live only in speech.",
    icon: AudioLines,
  },
  {
    title: "The next shift rebuilds the story",
    body:
      "Incoming nurses lose time reconstructing what changed, what is still unresolved, and which concerns are truly new.",
    icon: Layers3,
  },
  {
    title: "Escalation logic stays informal",
    body:
      "When risk thresholds are spoken but not persisted, urgent triggers can weaken exactly when the night gets busiest.",
    icon: ShieldAlert,
  },
]

const workflowSteps = [
  {
    step: "01",
    title: "Capture the handoff as spoken",
    body:
      "Voice-first relay keeps the outgoing nurse's narrative intact, including tone, uncertainty, and what still feels clinically off.",
  },
  {
    step: "02",
    title: "Transform speech into case memory",
    body:
      "Relay extracts new findings, unresolved items, follow-up, and escalation rules into a persistent structure that survives shift turnover.",
  },
  {
    step: "03",
    title: "Read continuity forward",
    body:
      "The incoming team sees what changed, what was carried forward, and can hear a concise voice summary before they step into the room.",
  },
]

const impactPoints = [
  "Persistent case memory, not disposable note-taking",
  "Voice-ready continuity with ElevenLabs fallback-safe scaffolding",
  "Escalation logic preserved as part of the handoff itself",
]

export default function Home() {
  return (
    <main className="relative isolate overflow-hidden">
      <section className="relative">
        <MemoryStrands />
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 md:px-8 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/10 bg-[rgba(8,14,26,0.54)] px-5 py-3 backdrop-blur-xl">
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-sm font-medium text-white/92"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-[radial-gradient(circle_at_center,rgba(97,251,239,0.34),rgba(7,13,24,0.6))] text-[rgba(152,248,238,0.96)]">
                <span className="h-2.5 w-2.5 rounded-full bg-current shadow-[0_0_18px_rgba(91,242,230,0.75)]" />
              </span>
              Code Blue Relay
            </Link>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-[rgba(45,211,191,0.18)] bg-[rgba(17,56,64,0.3)] px-3 py-1 font-semibold uppercase tracking-[0.22em] text-[rgba(153,247,236,0.92)]">
                HACK CANADA
              </span>
              <Link
                href="/dashboard"
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-medium text-white/76 transition hover:bg-white/8"
              >
                Dashboard
              </Link>
              <Link
                href="/compose"
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-medium text-white/76 transition hover:bg-white/8"
              >
                Compose
              </Link>
            </div>
          </div>

          <div className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1.02fr_0.98fr] lg:py-20">
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(167,139,250,0.16)] bg-[rgba(81,58,121,0.18)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(214,203,255,0.92)]">
                Midnight clinical intelligence
              </div>
              <h1 className="mt-8 max-w-4xl font-display text-5xl leading-[0.94] font-semibold tracking-[-0.06em] text-white md:text-7xl">
                When shift changes, critical context shouldn&apos;t.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[rgba(199,210,229,0.82)]">
                Code Blue Relay transforms spoken handoff into persistent clinical
                memory, live escalation logic, and voice-ready continuity of care.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-full bg-[linear-gradient(135deg,rgba(57,208,193,1),rgba(125,239,228,0.88))] px-6 text-[rgba(4,19,28,0.94)] hover:brightness-105"
                >
                  <Link href={`/case/${primarySeedRelay.slug}#audio-summary`}>
                    Watch 30s Handoff
                    <AudioLines className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-full border-white/12 bg-white/5 px-6 text-white hover:bg-white/8"
                >
                  <Link href={`/case/${primarySeedRelay.slug}`}>
                    Open Live Case
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[24px] border border-white/10 bg-[rgba(9,17,30,0.58)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgba(153,167,193,0.72)]">
                    Spoken relay
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/88">
                    Preserve nuance exactly where care risk lives.
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-[rgba(9,17,30,0.58)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgba(153,167,193,0.72)]">
                    Persistent memory
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/88">
                    Carry context forward instead of forcing the next shift to reconstruct it.
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-[rgba(9,17,30,0.58)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgba(153,167,193,0.72)]">
                    Voice-ready summary
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/88">
                    Hear the relay aloud before stepping into the room.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <LiveCasePreview caseData={primarySeedRelay} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-8 lg:px-10">
        <SectionHeading
          eyebrow="The problem"
          title="Clinical handoff is still too fragile for the cases that matter most."
          description="When the relay depends on memory, sticky notes, or fragmented charting, overnight safety depends on what one person remembers under pressure."
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {problemCards.map((card) => {
            const Icon = card.icon

            return (
              <div
                key={card.title}
                className="rounded-[28px] border border-white/10 bg-[rgba(9,17,30,0.7)] p-6 shadow-[0_20px_70px_rgba(2,6,23,0.24)]"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[rgba(153,247,236,0.94)]">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-white">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[rgba(186,198,223,0.8)]">
                  {card.body}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-8 lg:px-10">
        <SectionHeading
          eyebrow="Workflow"
          title="One incredible workflow, designed for a 90-second demo."
          description="Capture a shift handoff, watch it resolve into structured memory, then open the live case and see continuity survive the transition."
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {workflowSteps.map((step) => (
            <div
              key={step.step}
              className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,32,0.76),rgba(8,14,26,0.92))] p-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-5xl font-semibold tracking-[-0.06em] text-white/15">
                  {step.step}
                </span>
                <span className="rounded-full border border-[rgba(45,211,191,0.18)] bg-[rgba(17,56,64,0.3)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[rgba(153,247,236,0.92)]">
                  Relay
                </span>
              </div>
              <h3 className="mt-10 text-2xl font-semibold tracking-[-0.03em] text-white">
                {step.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-[rgba(186,198,223,0.78)]">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pt-20 pb-28 md:px-8 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,20,35,0.84),rgba(8,14,26,0.96))] p-7">
            <SectionHeading
              eyebrow="Why it matters"
              title="The next nurse should inherit context, not uncertainty."
              description="Code Blue Relay is built for those moments when everything sounds almost fine, except one or two spoken details suggest the night might turn."
            />
          </div>

          <div className="rounded-[34px] border border-white/10 bg-[rgba(9,17,30,0.76)] p-7">
            <div className="flex items-center gap-3 text-[rgba(252,211,125,0.92)]">
              <HeartPulse className="size-5" />
              <span className="text-xs font-semibold uppercase tracking-[0.24em]">
                Continuity that protects care
              </span>
            </div>
            <ul className="mt-6 space-y-4">
              {impactPoints.map((point) => (
                <li key={point} className="flex gap-3 text-sm leading-7 text-white/86">
                  <CheckCircle2 className="mt-1 size-5 shrink-0 text-[rgba(125,239,228,0.96)]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-[26px] border border-[rgba(251,191,36,0.12)] bg-[rgba(251,191,36,0.07)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[rgba(252,211,125,0.92)]">
                Demo anchor
              </p>
              <p className="mt-3 text-base leading-7 text-white/88">
                Mrs. Elina Moreau arrives on watch with dementia, possible infection,
                low intake, worsening confusion, a new wet cough after meds, and a
                physician callback still pending. The relay shows exactly what must
                follow the shift change and when escalation becomes non-optional.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
