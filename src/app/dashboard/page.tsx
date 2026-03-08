import { Activity, AudioLines, BellRing, HeartPulse } from "lucide-react"

import { AppHeader } from "@/components/relay/app-header"
import { CaseCard } from "@/components/relay/case-card"
import { demoCases } from "@/data/demo-cases"

const summaryTiles = [
  {
    label: "Active relays",
    value: `${demoCases.length}`,
    caption: "demo cases live",
    icon: Activity,
  },
  {
    label: "Watch or escalate",
    value: `${demoCases.filter((caseData) => caseData.status !== "Stable").length}`,
    caption: "require active continuity",
    icon: BellRing,
  },
  {
    label: "Voice ready",
    value: "100%",
    caption: "audio summaries available",
    icon: AudioLines,
  },
  {
    label: "Shift confidence",
    value: "High",
    caption: "continuity preserved across handoff",
    icon: HeartPulse,
  },
]

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-6 md:px-8 lg:px-10">
      <AppHeader
        title="Active cases, structured for the incoming shift."
        description="Every card keeps the incoming team focused on what changed, what stayed unresolved, and what was carried forward from the previous shift."
        ctaHref="/compose"
        ctaLabel="Compose New Relay"
      />

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryTiles.map((tile) => {
          const Icon = tile.icon

          return (
            <div
              key={tile.label}
              className="rounded-[26px] border border-white/10 bg-[rgba(9,17,30,0.72)] p-5 shadow-[0_20px_70px_rgba(2,6,23,0.22)]"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[rgba(153,167,193,0.72)]">
                    {tile.label}
                  </p>
                  <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white">
                    {tile.value}
                  </p>
                  <p className="mt-2 text-sm text-[rgba(186,198,223,0.74)]">
                    {tile.caption}
                  </p>
                </div>
                <div className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[rgba(153,247,236,0.94)]">
                  <Icon className="size-5" />
                </div>
              </div>
            </div>
          )
        })}
      </section>

      <section className="mt-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[rgba(153,167,193,0.74)]">
              Live caseboard
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
              Open any relay and continue care with the full story intact.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[rgba(186,198,223,0.76)]">
            Demo data is mocked locally, but the interface is already structured for
            future Supabase and Backboard-backed persistence.
          </p>
        </div>

        {demoCases.length ? (
          <div className="grid gap-6 xl:grid-cols-2">
            {demoCases.map((caseData) => (
              <CaseCard key={caseData.id} caseData={caseData} />
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-white/10 bg-[rgba(9,17,30,0.72)] px-6 py-10 text-center text-[rgba(186,198,223,0.76)]">
            No demo cases are loaded.
          </div>
        )}
      </section>
    </main>
  )
}
