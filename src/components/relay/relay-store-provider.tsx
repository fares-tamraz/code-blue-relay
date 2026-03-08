"use client"

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"

import { seededRelays } from "@/data/demo-cases"
import {
  buildDashboardMetrics,
  createRelayFromStructuredMemory,
  formatDurationLabelFromScript,
  simulateUrgentRelayUpdate,
} from "@/lib/relay"
import type {
  RelayAudioSummary,
  RelayRecord,
  StructuredMemory,
} from "@/types/relay"

type CreateRelayArgs = {
  transcript: string
  structuredMemory: StructuredMemory
  handoffMode?: RelayRecord["handoffMode"]
}

type RelayStoreContextValue = {
  relays: RelayRecord[]
  metrics: ReturnType<typeof buildDashboardMetrics>
  getRelayBySlug: (slug: string) => RelayRecord | undefined
  createRelay: (args: CreateRelayArgs) => Promise<RelayRecord>
  ensureRelayAudio: (slug: string) => Promise<RelayAudioSummary | undefined>
  escalateRelay: (slug: string) => void
}

const RelayStoreContext = createContext<RelayStoreContextValue | null>(null)

type AudioSummaryResponse = {
  audioSummary: RelayAudioSummary
}

type PendingAudioRequest = {
  script: string
  promise: Promise<RelayAudioSummary | undefined>
}

export function RelayStoreProvider({ children }: { children: ReactNode }) {
  const [relays, setRelays] = useState<RelayRecord[]>(seededRelays)
  const relaysRef = useRef(relays)
  const audioRequestsRef = useRef<
    Partial<Record<string, PendingAudioRequest>>
  >({})

  useEffect(() => {
    relaysRef.current = relays
  }, [relays])

  function getRelayBySlug(slug: string) {
    return relaysRef.current.find((relay) => relay.slug === slug)
  }

  function updateRelayAudio(
    slug: string,
    updater: (relay: RelayRecord) => RelayAudioSummary
  ) {
    setRelays((currentRelays) =>
      currentRelays.map((relay) =>
        relay.slug === slug
          ? {
              ...relay,
              updatedAt: new Date().toISOString(),
              audioSummary: updater(relay),
            }
          : relay
      )
    )
  }

  async function requestRelayAudio(relay: RelayRecord) {
    if (!relay.audioSummary) {
      return undefined
    }

    const requestScript = relay.audioSummary.script

    if (relay.audioSummary.audioUrl) {
      return relay.audioSummary
    }

    if (
      audioRequestsRef.current[relay.slug] &&
      audioRequestsRef.current[relay.slug]!.script === requestScript
    ) {
      return audioRequestsRef.current[relay.slug]!.promise
    }

    updateRelayAudio(relay.slug, (currentRelay) => ({
      ...currentRelay.audioSummary!,
      status: "generating",
      provider: "pending",
      errorMessage: undefined,
      fallbackReason: undefined,
      durationLabel:
        currentRelay.audioSummary?.durationLabel ??
        formatDurationLabelFromScript(currentRelay.audioSummary?.script ?? ""),
    }))

    const request = fetch("/api/audio-summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        relayId: relay.id,
        relaySlug: relay.slug,
        script: relay.audioSummary.script,
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Audio summary request failed with ${response.status}`)
        }

        const payload = (await response.json()) as AudioSummaryResponse

        updateRelayAudio(relay.slug, (currentRelay) => ({
          ...(currentRelay.audioSummary?.script === requestScript
            ? {
                ...currentRelay.audioSummary!,
                ...payload.audioSummary,
                script:
                  payload.audioSummary.script || currentRelay.audioSummary!.script,
              }
            : currentRelay.audioSummary!),
        }))

        return payload.audioSummary
      })
      .catch((error) => {
        const fallbackSummary: RelayAudioSummary = {
          ...relay.audioSummary!,
          status: "failed",
          provider: "fallback",
          voiceName: "Relay-specific fallback voice",
          errorMessage:
            error instanceof Error
              ? error.message
              : "Audio summary generation failed.",
          fallbackReason: "audio_summary_request_failed",
        }

        updateRelayAudio(relay.slug, (currentRelay) =>
          currentRelay.audioSummary?.script === requestScript
            ? fallbackSummary
            : currentRelay.audioSummary!
        )

        return fallbackSummary
      })
      .finally(() => {
        if (audioRequestsRef.current[relay.slug]?.script === requestScript) {
          delete audioRequestsRef.current[relay.slug]
        }
      })

    audioRequestsRef.current[relay.slug] = {
      script: requestScript,
      promise: request,
    }

    return request
  }

  async function ensureRelayAudio(slug: string) {
    const existingRelay = getRelayBySlug(slug)

    if (!existingRelay) {
      return undefined
    }

    return requestRelayAudio(existingRelay)
  }

  async function createRelay({
    transcript,
    structuredMemory,
    handoffMode = "typed",
  }: CreateRelayArgs) {
    const relay = createRelayFromStructuredMemory({
      transcript,
      structuredMemory,
      handoffMode,
      clinicianLabel: "New relay draft",
      handoffLabel: "Generated relay",
      story:
        structuredMemory.visualSignals.clinicalMemoryResolvesInRealTime ||
        structuredMemory.oneLineSummary,
    })

    setRelays((currentRelays) => [relay, ...currentRelays])
    void requestRelayAudio(relay)

    return relay
  }

  function escalateRelay(slug: string) {
    let updatedRelay: RelayRecord | undefined

    setRelays((currentRelays) =>
      currentRelays.map((relay) => {
        if (relay.slug !== slug) {
          return relay
        }

        updatedRelay = simulateUrgentRelayUpdate(relay)
        return updatedRelay
      })
    )

    if (updatedRelay) {
      void requestRelayAudio(updatedRelay)
    }
  }

  const value: RelayStoreContextValue = {
    relays,
    metrics: buildDashboardMetrics(relays),
    getRelayBySlug,
    createRelay,
    ensureRelayAudio,
    escalateRelay,
  }

  return (
    <RelayStoreContext.Provider value={value}>
      {children}
    </RelayStoreContext.Provider>
  )
}

export function useRelayStore() {
  const context = useContext(RelayStoreContext)

  if (!context) {
    throw new Error("useRelayStore must be used inside RelayStoreProvider")
  }

  return context
}
