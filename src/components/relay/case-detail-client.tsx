"use client"

import { startTransition, useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import {
  Activity,
  BellRing,
  Clock3,
  ShieldAlert,
  Siren,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { formatClinicalStamp, toneClassMap } from "@/lib/relay"
import { simulateUrgentCaseUpdate } from "@/lib/relay"
import type { Case } from "@/types/relay"

import { AudioSummaryCard } from "./audio-summary-card"
import { EscalationBanner } from "./escalation-banner"
import { RelayPanel } from "./relay-panel"
import { StatusBadge } from "./status-badge"
import { Timeline } from "./timeline"

type CaseDetailClientProps = {
  initialCase: Case
}

export function CaseDetailClient({ initialCase }: CaseDetailClientProps) {
  const [caseData, setCaseData] = useState(initialCase)
  const [hasUrgentUpdate, setHasUrgentUpdate] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const updateTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (updateTimerRef.current) {
        window.clearTimeout(updateTimerRef.current)
      }
    }
  }, [])

  function handleUrgentUpdate() {
    if (hasUrgentUpdate || isUpdating) {
      return
    }

    setIsUpdating(true)

    updateTimerRef.current = window.setTimeout(() => {
      startTransition(() => {
        setCaseData((currentCase) => simulateUrgentCaseUpdate(currentCase))
        setHasUrgentUpdate(true)
        setIsUpdating(false)
      })
    }, 450)
  }

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{
          opacity: 1,
          y: 0,
          boxShadow: hasUrgentUpdate
            ? "0 0 0 1px rgba(251,113,133,0.22), 0 30px 120px rgba(113,19,46,0.5)"
            : "0 30px 120px rgba(2,6,23,0.38)",
        }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,17,30,0.82),rgba(7,13,24,0.92))] px-6 py-6 backdrop-blur-xl md:px-8"
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={caseData.status} />
                <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-white/78">
                  {caseData.unit}
                </span>
                <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-white/78">
                  Room {caseData.room}
                </span>
              </div>

              <div>
                <h2 className="text-4xl font-semibold tracking-[-0.05em] text-white md:text-5xl">
                  {caseData.patientName}
                </h2>
                <p className="mt-3 max-w-2xl text-base leading-8 text-[rgba(199,210,229,0.84)]">
                  {caseData.story}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {caseData.liveSignals.map((signal) => (
                  <div
                    key={signal.label}
                    className={`rounded-full border px-4 py-2 text-sm ${toneClassMap[signal.tone]}`}
                  >
                    <span className="font-semibold text-white/95">
                      {signal.label}
                    </span>
                    <span className="mx-2 opacity-50">•</span>
                    <span>{signal.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full max-w-md rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[rgba(153,167,193,0.76)]">
                    Live status
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {caseData.statusNote}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[rgba(153,167,193,0.7)]">
                      <Clock3 className="size-3.5" />
                      Last update
                    </div>
                    <p className="mt-2 text-sm text-white/90">
                      {formatClinicalStamp(caseData.lastUpdated)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[rgba(153,167,193,0.7)]">
                      <Activity className="size-3.5" />
                      Unresolved
                    </div>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                      {caseData.unresolvedCount}
                    </p>
                  </div>
                </div>
                <Button
                  size="lg"
                  onClick={handleUrgentUpdate}
                  disabled={hasUrgentUpdate || isUpdating}
                  className="h-11 w-full rounded-full bg-[linear-gradient(135deg,rgba(251,113,133,1),rgba(255,190,200,0.9))] text-[rgba(36,8,14,0.95)] hover:brightness-105"
                >
                  {hasUrgentUpdate ? (
                    <>
                      <ShieldAlert className="size-4" />
                      Escalation triggered
                    </>
                  ) : isUpdating ? (
                    <>
                      <BellRing className="size-4 animate-pulse" />
                      Processing urgent update
                    </>
                  ) : (
                    <>
                      <Siren className="size-4" />
                      Simulate urgent update
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <EscalationBanner rule={caseData.escalationRule} status={caseData.status} />
        </div>
      </motion.section>

      <AudioSummaryCard audioSummary={caseData.audioSummary} />

      <div className="grid gap-6 xl:grid-cols-2">
        <RelayPanel
          title="Spoken Handoff"
          eyebrow={caseData.handoff.shiftLabel}
          tone="teal"
        >
          <div className="space-y-4">
            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm font-medium text-white">
                  {caseData.handoff.clinician}
                </div>
                <div className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/72">
                  {caseData.handoff.mode === "voice" ? "Voice capture" : "Typed relay"}
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-[rgba(212,221,237,0.84)]">
                {caseData.handoff.transcript}
              </p>
            </div>
          </div>
        </RelayPanel>

        <RelayPanel
          title="Structured Memory"
          eyebrow="Persistent continuity layer"
          tone="violet"
          items={[
            caseData.structuredMemory.summary,
            ...caseData.structuredMemory.carriedForward,
          ]}
        />

        <RelayPanel
          title="What Changed"
          eyebrow="Shift delta"
          tone="teal"
          items={caseData.whatChanged}
        />

        <RelayPanel
          title="Carried Forward"
          eyebrow="Carried forward from previous shift"
          tone="violet"
          items={[
            caseData.carriedForwardNote,
            ...caseData.structuredMemory.carriedForward,
          ]}
        />

        <RelayPanel
          title="Unresolved"
          eyebrow="Needs closure"
          tone="amber"
          items={caseData.structuredMemory.unresolvedItems}
        />

        <RelayPanel
          title="Escalation Logic"
          eyebrow="Thresholds to act"
          tone="coral"
          items={caseData.structuredMemory.escalationTriggers}
        />

        <RelayPanel
          title="Follow-up Needed"
          eyebrow="Next shift actions"
          tone="teal"
          items={caseData.structuredMemory.followUpNeeded}
          className="xl:col-span-2"
        />
      </div>

      <Timeline events={caseData.timeline} />
    </div>
  )
}
