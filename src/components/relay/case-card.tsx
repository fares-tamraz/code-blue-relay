"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, AudioLines, CornerDownRight, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  formatClinicalTime,
  getRelayCarriedForwardNote,
  getRelayDisplayLine,
  getRelayDisplayName,
  getRelaySignals,
  getRelayStatusNote,
  getRelayWhatChanged,
  getStatusMeta,
  toneClassMap,
} from "@/lib/relay"
import type { Case } from "@/types/relay"

import { StatusBadge } from "./status-badge"

type CaseCardProps = {
  caseData: Case
}

export function CaseCard({ caseData }: CaseCardProps) {
  const statusSurface = getStatusMeta(caseData.status)
  const relaySignals = getRelaySignals(caseData)
  const relayWhatChanged = getRelayWhatChanged(caseData)
  const relayDisplayLine = getRelayDisplayLine(caseData)

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="h-full"
    >
      <Card
        className={`h-full rounded-[28px] border py-0 shadow-[0_24px_80px_rgba(3,9,24,0.45)] ${statusSurface.surfaceClassName}`}
      >
        <CardHeader className="space-y-4 px-5 pt-5 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[rgba(153,167,193,0.78)]">
                {caseData.unit || "Active Relay"}
              </p>
              <CardTitle className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                {getRelayDisplayName(caseData)}
              </CardTitle>
              {relayDisplayLine ? (
                <p className="mt-1 text-sm text-[rgba(186,198,223,0.74)]">
                  {relayDisplayLine}
                </p>
              ) : null}
            </div>
            <StatusBadge status={caseData.status} />
          </div>

          <p className="text-sm leading-7 text-[rgba(213,221,235,0.82)]">
            {getRelayStatusNote(caseData)}
          </p>
        </CardHeader>

        <CardContent className="space-y-5 px-5 pb-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {relaySignals.map((signal) => (
              <div
                key={signal.label}
                className={`rounded-2xl border px-3.5 py-3 ${toneClassMap[signal.tone]}`}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-70">
                  {signal.label}
                </p>
                <p className="mt-1.5 text-sm font-medium text-white/92">
                  {signal.value}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-[22px] border border-white/8 bg-[rgba(255,255,255,0.03)] p-4">
            <div className="mb-3 flex items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[rgba(153,167,193,0.78)]">
                What changed since last shift
              </p>
              <p className="text-xs text-[rgba(186,198,223,0.65)]">
                {formatClinicalTime(caseData.updatedAt)}
              </p>
            </div>
            <ul className="space-y-2.5 text-sm leading-6 text-[rgba(220,228,243,0.86)]">
              {relayWhatChanged.slice(0, 2).map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[rgba(124,241,232,0.94)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[22px] border border-[rgba(167,139,250,0.12)] bg-[rgba(167,139,250,0.08)] p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[rgba(208,196,255,0.85)]">
                <CornerDownRight className="size-3.5" />
                {caseData.carriedForwardLabel}
              </div>
              <p className="mt-3 text-sm leading-6 text-[rgba(229,223,255,0.88)]">
                {getRelayCarriedForwardNote(caseData)}
              </p>
            </div>

            <div className="rounded-[22px] border border-[rgba(245,158,11,0.14)] bg-[rgba(245,158,11,0.08)] p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[rgba(252,211,125,0.9)]">
                <Sparkles className="size-3.5" />
                Unresolved
              </div>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
                {caseData.unresolvedCount}
              </p>
              <p className="mt-1 text-sm text-[rgba(252,211,125,0.76)]">
                items still need overnight closure
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="h-10 rounded-full bg-[linear-gradient(135deg,rgba(57,208,193,1),rgba(125,239,228,0.88))] px-4 text-[rgba(4,19,28,0.94)] hover:brightness-105"
            >
              <Link href={`/case/${caseData.slug}`}>
                Open Relay
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-10 rounded-full border-white/12 bg-white/5 px-4 text-white hover:bg-white/8"
            >
              <Link href={`/case/${caseData.slug}#audio-summary`}>
                <AudioLines className="size-4" />
                Play Summary
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
