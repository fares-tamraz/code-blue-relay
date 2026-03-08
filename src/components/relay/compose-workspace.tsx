"use client"

import {
  startTransition,
  useDeferredValue,
  useRef,
  useState,
} from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowRight,
  AudioLines,
  CheckCircle2,
  Mic,
  MicOff,
  Sparkles,
  WandSparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  defaultDemoTranscriptPreset,
  demoTranscriptPresets,
} from "@/data/demo-transcripts"
import { createEmptyStructuredMemory } from "@/lib/ai/relay-schema"
import { createRelayDraftInput, deriveMemoryContinuitySignal } from "@/lib/relay"
import type { StructuredMemory } from "@/types/relay"

import { EmptyState } from "./empty-state"
import { useComposeMicrophone } from "./use-compose-microphone"
import { useRelayStore } from "./relay-store-provider"

const emptyStructuredMemory = createEmptyStructuredMemory()

const extractionSections: Array<{
  title: string
  accent: string
  getItems: (memory: StructuredMemory) => string[]
}> = [
  {
    title: "Situation",
    accent: "bg-[rgba(45,211,191,0.9)]",
    getItems: (memory) => memory.newFindings,
  },
  {
    title: "Background",
    accent: "bg-[rgba(167,139,250,0.9)]",
    getItems: (memory) => memory.carriedForward,
  },
  {
    title: "Assessment",
    accent: "bg-[rgba(245,158,11,0.9)]",
    getItems: (memory) => memory.unresolvedItems,
  },
  {
    title: "Recommendation",
    accent: "bg-[rgba(251,113,133,0.9)]",
    getItems: (memory) =>
      Array.from(
        new Set([...memory.followUpNeeded, ...memory.escalationTriggers])
      ),
  },
]

export function ComposeWorkspace() {
  const router = useRouter()
  const { createRelay } = useRelayStore()
  const [transcript, setTranscript] = useState(defaultDemoTranscriptPreset.transcript)
  const [handoffMode, setHandoffMode] = useState<"voice" | "typed">(
    defaultDemoTranscriptPreset.handoffMode
  )
  const [structuredMemory, setStructuredMemory] =
    useState<StructuredMemory | null>(null)
  const [isGeneratingStructuredMemory, setIsGeneratingStructuredMemory] =
    useState(false)
  const [isCreatingRelay, setIsCreatingRelay] = useState(false)
  const [generationError, setGenerationError] = useState("")
  const generationRequestRef = useRef<AbortController | null>(null)
  const deferredTranscript = useDeferredValue(transcript)

  function applyTranscriptUpdate(nextTranscript: string, nextMode: "voice" | "typed") {
    if (generationRequestRef.current) {
      generationRequestRef.current.abort()
      generationRequestRef.current = null
    }

    setHandoffMode(nextMode)
    setTranscript(nextTranscript)
    setStructuredMemory(null)
    setGenerationError("")
  }

  function handleCapturedTranscript(capturedText: string) {
    const nextTranscript = transcript
      ? `${transcript.trim()} ${capturedText}`.trim()
      : capturedText

    applyTranscriptUpdate(nextTranscript, "voice")
  }

  const microphone = useComposeMicrophone({
    onTranscriptCaptured: handleCapturedTranscript,
  })

  async function handleGenerateStructuredMemory() {
    const draft = createRelayDraftInput(transcript)

    if (!draft.transcript) {
      setGenerationError("Enter or capture a handoff before generating memory.")
      setStructuredMemory(null)
      return
    }

    if (generationRequestRef.current) {
      generationRequestRef.current.abort()
    }

    const controller = new AbortController()
    generationRequestRef.current = controller
    setGenerationError("")
    setIsGeneratingStructuredMemory(true)

    try {
      const response = await fetch("/api/structured-memory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draft),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`Structured memory request failed with ${response.status}`)
      }

      const payload = (await response.json()) as {
        structuredMemory: StructuredMemory
      }

      startTransition(() => {
        setStructuredMemory(payload.structuredMemory)
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return
      }

      setGenerationError(
        "Structured memory could not be generated. The relay is still safe to retry with the current handoff."
      )
      setStructuredMemory(null)
    } finally {
      setIsGeneratingStructuredMemory(false)
      generationRequestRef.current = null
    }
  }

  async function handleCreateRelay() {
    if (!structuredMemory) {
      return
    }

    setIsCreatingRelay(true)

    try {
      const relay = await createRelay({
        transcript: transcript.trim(),
        structuredMemory,
        handoffMode,
      })

      router.push(`/case/${relay.slug}`)
    } finally {
      setIsCreatingRelay(false)
    }
  }

  const wordCount = deferredTranscript.trim().split(/\s+/).filter(Boolean).length
  const generatedVisualSignals = structuredMemory?.visualSignals ?? emptyStructuredMemory.visualSignals
  const generatedMemoryContinuity = structuredMemory
    ? deriveMemoryContinuitySignal({
        transcript,
        structuredMemory,
      })
    : ""
  const canCreateRelay = Boolean(structuredMemory) && !isGeneratingStructuredMemory
  const selectedPresetId =
    demoTranscriptPresets.find((preset) => preset.transcript === transcript)?.id ??
    null

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
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={microphone.toggleListening}
              disabled={
                !microphone.isSupported ||
                microphone.permissionState === "denied"
              }
              className="h-8 rounded-full border-white/12 bg-white/5 px-3 text-white hover:bg-white/8 disabled:opacity-70"
            >
              {microphone.isListening ? (
                <>
                  <Mic className="size-4 text-[rgba(125,239,228,0.96)]" />
                  Listening
                </>
              ) : microphone.permissionState === "denied" ? (
                <>
                  <MicOff className="size-4 text-[rgba(255,195,203,0.92)]" />
                  Mic denied
                </>
              ) : !microphone.isSupported ? (
                <>
                  <MicOff className="size-4 text-[rgba(252,211,125,0.92)]" />
                  Mic unavailable
                </>
              ) : (
                <>
                  <Mic className="size-4" />
                  Start mic
                </>
              )}
            </Button>
          </div>
          <div>
            <CardTitle className="text-3xl font-semibold tracking-[-0.04em] text-white">
              Raw handoff enters the relay
            </CardTitle>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[rgba(186,198,223,0.8)]">
              Capture the nurse&apos;s words as spoken, preserve the nuance, then let
              Relay promote only the current handoff into structured memory that
              the next shift can trust.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 px-6 pb-6">
          <div className="rounded-[22px] border border-white/8 bg-[rgba(255,255,255,0.03)] px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[rgba(153,167,193,0.74)]">
                  Demo transcript presets
                </p>
                <p className="mt-2 text-sm text-white/82">
                  Quick-load QA handoffs. Each preset still runs through the same
                  generation and repair pipeline.
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-white/76">
                HACK CANADA demo prep
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {demoTranscriptPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    applyTranscriptUpdate(preset.transcript, preset.handoffMode)
                  }}
                  className={`rounded-full border px-3 py-2 text-left text-xs font-medium tracking-[0.14em] transition hover:bg-white/8 ${
                    selectedPresetId === preset.id
                      ? "border-[rgba(45,211,191,0.24)] bg-[rgba(17,56,64,0.32)] text-[rgba(163,252,239,0.96)]"
                      : "border-white/10 bg-white/5 text-white/78"
                  }`}
                >
                  <span className="block uppercase">{preset.label}</span>
                  <span className="mt-1 block tracking-normal text-[11px] opacity-72">
                    {preset.context}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Textarea
            value={transcript}
            onChange={(event) => {
              applyTranscriptUpdate(event.target.value, "typed")
            }}
            className="min-h-[320px] rounded-[28px] border-white/10 bg-[rgba(255,255,255,0.03)] px-5 py-5 text-base leading-7 text-white placeholder:text-[rgba(153,167,193,0.62)]"
            placeholder="Speak or type the outgoing handoff..."
          />

          <div className="flex flex-wrap items-start justify-between gap-3 rounded-[22px] border border-white/8 bg-[rgba(255,255,255,0.03)] px-4 py-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[rgba(153,167,193,0.74)]">
                Microphone status
              </p>
              <p className="mt-2 text-sm text-white/88">
                {microphone.errorMessage ||
                  (microphone.isListening
                    ? "Voice capture is active and appends transcript to the current handoff."
                    : microphone.permissionState === "denied"
                      ? "Microphone permission is denied. The control stays visible so the state is explicit."
                      : !microphone.isSupported
                        ? "This browser cannot provide microphone transcription for the relay composer."
                        : "Microphone capture is ready when you want to append spoken handoff." )}
              </p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-white/76">
              {handoffMode === "voice" ? "Voice-assisted input" : "Typed input"}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[22px] border border-[rgba(45,211,191,0.16)] bg-[rgba(17,56,64,0.24)] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[rgba(153,247,236,0.92)]">
                Voice signal
              </p>
              <p className="mt-2 text-sm text-white/88">
                {generatedVisualSignals.voiceSignal ||
                  "Generated from the current handoff only once structured memory is created."}
              </p>
            </div>
            <div className="rounded-[22px] border border-[rgba(167,139,250,0.16)] bg-[rgba(81,58,121,0.22)] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[rgba(214,203,255,0.9)]">
                Memory continuity
              </p>
              <p className="mt-2 text-sm text-white/88">
                {generatedMemoryContinuity ||
                  "Remains empty unless the current handoff explicitly includes carried-forward context."}
              </p>
            </div>
            <div className="rounded-[22px] border border-[rgba(251,113,133,0.16)] bg-[rgba(98,32,47,0.22)] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[rgba(255,195,203,0.92)]">
                Escalation logic
              </p>
              <p className="mt-2 text-sm text-white/88">
                {generatedVisualSignals.escalationLogic ||
                  "Only explicit escalation thresholds from the current handoff appear here."}
              </p>
            </div>
          </div>

          {generationError ? (
            <div className="rounded-[22px] border border-[rgba(251,113,133,0.22)] bg-[rgba(98,32,47,0.22)] px-4 py-3 text-sm text-[rgba(255,195,203,0.94)]">
              {generationError}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={handleGenerateStructuredMemory}
              disabled={isGeneratingStructuredMemory}
              className="h-[52px] flex-1 rounded-full bg-[linear-gradient(135deg,rgba(57,208,193,1),rgba(125,239,228,0.88))] text-base font-semibold text-[rgba(4,19,28,0.96)] hover:brightness-105"
            >
              {isGeneratingStructuredMemory ? (
                <>
                  <WandSparkles className="size-4 animate-pulse" />
                  Generating Structured Memory
                </>
              ) : (
                <>
                  Generate Structured Memory
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>

            {canCreateRelay ? (
              <Button
                size="lg"
                onClick={handleCreateRelay}
                disabled={isCreatingRelay}
                className="h-[52px] flex-1 rounded-full border border-white/12 bg-white/6 text-base font-semibold text-white hover:bg-white/8"
              >
                {isCreatingRelay ? (
                  <>
                    <Sparkles className="size-4 animate-pulse" />
                    Creating Relay
                  </>
                ) : (
                  <>
                    Create Relay
                    <CheckCircle2 className="size-4" />
                  </>
                )}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[32px] border border-white/10 bg-[rgba(7,13,24,0.78)] py-0 shadow-[0_28px_100px_rgba(2,6,23,0.42)]">
        <CardHeader className="space-y-4 px-6 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(167,139,250,0.18)] bg-[rgba(81,58,121,0.22)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[rgba(214,203,255,0.92)]">
              <Sparkles className="size-3.5" />
              Structured memory
            </div>
            {structuredMemory ? (
              <div className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-white/76">
                {structuredMemory.currentStatus}
              </div>
            ) : null}
          </div>
          <div>
            <CardTitle className="text-3xl font-semibold tracking-[-0.04em] text-white">
              Clinical memory resolves in real time
            </CardTitle>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[rgba(186,198,223,0.8)]">
              {structuredMemory?.visualSignals.clinicalMemoryResolvesInRealTime ||
                "Generate structured memory to see how the current handoff resolves into durable continuity, follow-up, and escalation logic."}
            </p>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {structuredMemory ? (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.08,
                  },
                },
              }}
              className="space-y-4"
            >
              <div className="rounded-[24px] border border-white/8 bg-[rgba(255,255,255,0.03)] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[rgba(153,167,193,0.74)]">
                      Patient
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {structuredMemory.patientName || "Unnamed patient"}
                    </p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-white/76">
                    {structuredMemory.currentStatus}
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-[rgba(205,214,231,0.84)]">
                  {structuredMemory.oneLineSummary || "No one-line summary generated."}
                </p>
              </div>

              {extractionSections.map((section) => {
                const items = section.getItems(structuredMemory)

                return (
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
                    {items.length ? (
                      <ul className="space-y-2.5 text-sm leading-6 text-[rgba(212,221,237,0.84)]">
                        {items.map((item, index) => (
                          <li
                            key={`${section.title}-${index}`}
                            className="flex gap-3"
                          >
                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-white/75" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm leading-6 text-[rgba(153,167,193,0.72)]">
                        No items were extracted from the current handoff.
                      </p>
                    )}
                  </motion.div>
                )
              })}
            </motion.div>
          ) : (
            <EmptyState
              title="Structured memory appears here"
              description="Generate Structured Memory to promote the current handoff into durable findings, unresolved risk, carry-forward state, follow-up, and escalation logic."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
