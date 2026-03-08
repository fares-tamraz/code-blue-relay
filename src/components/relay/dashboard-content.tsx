"use client"

import { Activity, AudioLines, BellRing, HeartPulse } from "lucide-react"

import { CaseCard } from "@/components/relay/case-card"

import { useRelayStore } from "./relay-store-provider"

const summaryTileDefinitions = [
  {
    key: "active",
    label: "Active relays",
    icon: Activity,
  },
  {
    key: "watch",
    label: "Watch or escalate",
    icon: BellRing,
  },
  {
    key: "voice",
    label: "Voice ready",
    icon: AudioLines,
  },
  {
    key: "confidence",
    label: "Shift confidence",
    icon: HeartPulse,
  },
] as const

export function DashboardContent() {
  const { metrics, relays } = useRelayStore()

  const summaryValues = {
    active: {
      value: `${metrics.activeRelayCount}`,
      caption: "relays live in the shared store",
    },
    watch: {
      value: `${metrics.watchOrEscalateCount}`,
      caption: "require active continuity",
    },
    voice: {
      value: `${metrics.voiceReadyCount}/${metrics.activeRelayCount}`,
      caption: "relay summaries ready for playback",
    },
    confidence: {
      value: metrics.shiftConfidence,
      caption: "driven from the current relay states",
    },
  } as const

  return (
    <>
      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryTileDefinitions.map((tile) => {
          const Icon = tile.icon
          const tileValue = summaryValues[tile.key]

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
                    {tileValue.value}
                  </p>
                  <p className="mt-2 text-sm text-[rgba(186,198,223,0.74)]">
                    {tileValue.caption}
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
            Dashboard counters, card states, new relay insertion, and escalation
            transitions all read from the same client-side source of truth.
          </p>
        </div>

        {relays.length ? (
          <div className="grid gap-6 xl:grid-cols-2">
            {relays.map((relay) => (
              <CaseCard key={relay.slug} caseData={relay} />
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-white/10 bg-[rgba(9,17,30,0.72)] px-6 py-10 text-center text-[rgba(186,198,223,0.76)]">
            No relays are loaded.
          </div>
        )}
      </section>
    </>
  )
}
