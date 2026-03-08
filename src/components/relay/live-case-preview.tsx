"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, AudioLines, Clock3, CornerDownRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatClinicalTime, toneClassMap } from "@/lib/relay"
import type { Case } from "@/types/relay"

import { StatusBadge } from "./status-badge"

type LiveCasePreviewProps = {
  caseData: Case
}

export function LiveCasePreview({ caseData }: LiveCasePreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
    >
      <Card className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,32,0.88),rgba(7,14,24,0.96))] py-0 shadow-[0_40px_120px_rgba(4,10,28,0.7)]">
        <div className="border-b border-white/8 bg-[linear-gradient(90deg,rgba(46,208,194,0.18),rgba(147,107,245,0.14),rgba(251,191,36,0.08))] px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgba(153,167,193,0.82)]">
                Live case preview
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                {caseData.patientName}
              </h3>
              <p className="mt-1 text-sm text-[rgba(186,198,223,0.76)]">
                {caseData.age} • {caseData.unit} • Room {caseData.room}
              </p>
            </div>
            <StatusBadge status={caseData.status} />
          </div>
        </div>

        <CardContent className="space-y-6 px-6 py-6">
          <p className="max-w-xl text-sm leading-7 text-[rgba(202,213,233,0.82)]">
            {caseData.story}
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            {caseData.liveSignals.map((signal) => (
              <div
                key={signal.label}
                className={`rounded-2xl border px-4 py-3 ${toneClassMap[signal.tone]}`}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] opacity-70">
                  {signal.label}
                </p>
                <p className="mt-2 text-sm font-medium text-white/95">
                  {signal.value}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-3 rounded-[24px] border border-white/8 bg-[rgba(255,255,255,0.03)] p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[rgba(153,167,193,0.8)]">
                <CornerDownRight className="size-3.5" />
                What changed since last shift
              </div>
              <div className="flex items-center gap-2 text-xs text-[rgba(186,198,223,0.72)]">
                <Clock3 className="size-3.5" />
                {formatClinicalTime(caseData.lastUpdated)}
              </div>
            </div>
            <ul className="space-y-2 text-sm leading-6 text-[rgba(220,228,243,0.88)]">
              {caseData.whatChanged.slice(0, 2).map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[rgba(124,241,232,0.9)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="h-11 rounded-full bg-[linear-gradient(135deg,rgba(57,208,193,1),rgba(125,239,228,0.88))] px-5 text-[rgba(4,19,28,0.94)] hover:brightness-105"
            >
              <Link href={`/case/${caseData.id}`}>
                Open live case
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 rounded-full border-white/12 bg-white/5 px-5 text-white hover:bg-white/8"
            >
              <Link href={`/case/${caseData.id}#audio-summary`}>
                <AudioLines className="size-4" />
                Play relay summary
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
