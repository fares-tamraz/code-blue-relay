"use client"

import { startTransition, useDeferredValue, useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, AudioLines, Sparkles, WandSparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { composeSeedTranscript, primaryDemoCase } from "@/data/demo-cases"

import { EmptyState } from "./empty-state"

const extractionSections = [
  {
    title: "New findings",
    items: primaryDemoCase.structuredMemory.newFindings,
    accent: "bg-[rgba(45,211,191,0.9)]",
  },
  {
    title: "Unresolved items",
    items: primaryDemoCase.structuredMemory.unresolvedItems,
    accent: "bg-[rgba(245,158,11,0.9)]",
  },
  {
    title: "Escalation triggers",
    items: primaryDemoCase.structuredMemory.escalationTriggers,
    accent: "bg-[rgba(251,113,133,0.9)]",
  },
  {
    title: "Follow-up needed",
    items: primaryDemoCase.structuredMemory.followUpNeeded,
    accent: "bg-[rgba(167,139,250,0.9)]",
  },
]

export function ComposeWorkspace() {
  const [transcript, setTranscript] = useState(composeSeedTranscript)
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)
  const deferredTranscript = useDeferredValue(transcript)
  const generationTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (generationTimerRef.current) {
        window.clearTimeout(generationTimerRef.current)
      }
    }
  }, [])

  function handleGenerateRelay() {
    if (generationTimerRef.current) {
      window.clearTimeout(generationTimerRef.current)
    }

    setIsGenerating(true)

    generationTimerRef.current = window.setTimeout(() => {
      startTransition(() => {
        setHasGenerated(true)
        setIsGenerating(false)
      })
    }, 780)
  }

  const wordCount = deferredTranscript.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <Card className="rounded-[32px] border border-white/10 bg-[rgba(7,13,24,0.74)] py-0 shadow-[0_28px_100px_rgba(2,6,23,0.42)]">
        <CardHeader className="space-y-4 px-6 pt-6 pb-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(45,211,191,0.18)] bg-[rgba(17,56,64,0.3)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[rgba(163,252,239,0.94)]">
              <AudioLines className="size-3.5" />
              Spoken or typed handoff
            </div>
            <div className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-white/78">
              {wordCount} words captured
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-semibold tracking-[-0.04em] text-white">
              Raw handoff enters the relay
            </CardTitle>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[rgba(186,198,223,0.8)]">
              Capture the nurse’s words as spoken, preserve the nuance, then let
              Relay promote risk, continuity, and escalation logic into a case
              memory the next shift can trust.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 px-6 pb-6">
          <Textarea
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
            className="min-h-[320px] rounded-[28px] border-white/10 bg-[rgba(255,255,255,0.03)] px-5 py-5 text-base leading-7 text-white placeholder:text-[rgba(153,167,193,0.62)]"
            placeholder="Speak or type the outgoing handoff..."
          />

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[22px] border border-[rgba(45,211,191,0.16)] bg-[rgba(17,56,64,0.24)] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[rgba(153,247,236,0.92)]">
                Voice signal
              </p>
              <p className="mt-2 text-sm text-white/88">
                Wet cough and baseline confusion are preserved from the narrative.
              </p>
            </div>
            <div className="rounded-[22px] border border-[rgba(167,139,250,0.16)] bg-[rgba(81,58,121,0.22)] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[rgba(214,203,255,0.9)]">
                Memory continuity
              </p>
              <p className="mt-2 text-sm text-white/88">
                Pending callback and prior-shift infection concern stay attached.
              </p>
            </div>
            <div className="rounded-[22px] border border-[rgba(251,113,133,0.16)] bg-[rgba(98,32,47,0.22)] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[rgba(255,195,203,0.92)]">
                Escalation logic
              </p>
              <p className="mt-2 text-sm text-white/88">
                Breathing decline or rising fever tonight triggers immediate escalation.
              </p>
            </div>
          </div>

          <Button
            size="lg"
            onClick={handleGenerateRelay}
            disabled={isGenerating}
            className="h-[52px] w-full rounded-full bg-[linear-gradient(135deg,rgba(57,208,193,1),rgba(125,239,228,0.88))] text-base font-semibold text-[rgba(4,19,28,0.96)] hover:brightness-105"
          >
            {isGenerating ? (
              <>
                <WandSparkles className="size-4 animate-pulse" />
                Generating relay
              </>
            ) : (
              <>
                Generate Relay
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-[32px] border border-white/10 bg-[rgba(7,13,24,0.78)] py-0 shadow-[0_28px_100px_rgba(2,6,23,0.42)]">
        <CardHeader className="space-y-4 px-6 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(167,139,250,0.18)] bg-[rgba(81,58,121,0.22)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[rgba(214,203,255,0.92)]">
              <Sparkles className="size-3.5" />
              Structured memory
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-semibold tracking-[-0.04em] text-white">
              Clinical memory resolves in real time
            </CardTitle>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[rgba(186,198,223,0.8)]">
              Relay separates what is new, what remains unresolved, and what must
              stay alive through the night shift.
            </p>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {hasGenerated ? (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              className="space-y-4"
            >
              {extractionSections.map((section) => (
                <motion.div
                  key={section.title}
                  variants={{
                    hidden: { opacity: 0, y: 18 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="rounded-[24px] border border-white/8 bg-[rgba(255,255,255,0.03)] p-5"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className={`h-3 w-3 rounded-full ${section.accent}`} />
                    <h3 className="text-lg font-semibold text-white">
                      {section.title}
                    </h3>
                  </div>
                  <ul className="space-y-2.5 text-sm leading-6 text-[rgba(212,221,237,0.84)]">
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-white/75" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState
              title="Structured memory appears here"
              description="Generate Relay to promote the transcript into durable findings, unresolved risk, follow-up, and escalation logic."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
