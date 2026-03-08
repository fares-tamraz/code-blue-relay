import { AppHeader } from "@/components/relay/app-header"
import { ComposeWorkspace } from "@/components/relay/compose-workspace"

export default function ComposePage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-6 md:px-8 lg:px-10">
      <AppHeader
        title="Turn a spoken handoff into persistent clinical memory."
        description="The composer keeps the raw narrative on the left and reveals structured extraction on the right, so the transformation from handoff to continuity is visible and demo-friendly."
        ctaHref="/dashboard"
        ctaLabel="Open Dashboard"
      />

      <section className="mt-6 rounded-[34px] border border-white/10 bg-[rgba(7,13,24,0.5)] p-4 backdrop-blur-sm md:p-6">
        <div className="mb-6 flex flex-wrap gap-3">
          <div className="rounded-full border border-[rgba(45,211,191,0.18)] bg-[rgba(17,56,64,0.3)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[rgba(153,247,236,0.92)]">
            Raw handoff
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.24em] text-white/76">
            Structured memory
          </div>
          <div className="rounded-full border border-[rgba(251,113,133,0.16)] bg-[rgba(98,32,47,0.22)] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.24em] text-[rgba(255,195,203,0.9)]">
            Escalation logic
          </div>
        </div>

        <ComposeWorkspace />
      </section>
    </main>
  )
}
