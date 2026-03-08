"use client"

import { useEffect, useEffectEvent, useRef, useState } from "react"
import { motion } from "framer-motion"
import { AudioLines, Pause, Play, RadioTower } from "lucide-react"

import { Button } from "@/components/ui/button"
import { formatDurationLabelFromScript, parseDurationLabel } from "@/lib/relay"
import type { Case } from "@/types/relay"

import { useRelayStore } from "./relay-store-provider"

type AudioSummaryCardProps = {
  relay: Case
}

const waveformBars = [24, 40, 18, 34, 28, 42, 20, 38, 26, 34, 16, 30]

export function AudioSummaryCard({ relay }: AudioSummaryCardProps) {
  const { ensureRelayAudio } = useRelayStore()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRequestingAudio, setIsRequestingAudio] = useState(false)
  const [progress, setProgress] = useState(0)
  const [pendingAutoplay, setPendingAutoplay] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const fallbackIntervalRef = useRef<number | null>(null)
  const audioSummary = relay.audioSummary
  const audioIdentity = [
    relay.slug,
    audioSummary?.audioUrl ?? "no-audio",
    audioSummary?.lastGeneratedAt ?? relay.updatedAt,
  ].join(":")

  const durationLabel =
    audioSummary?.durationLabel ??
    formatDurationLabelFromScript(audioSummary?.script ?? relay.oneLineSummary)
  const durationSeconds = Math.max(parseDurationLabel(durationLabel), 1)

  function clearFallbackInterval() {
    if (fallbackIntervalRef.current) {
      window.clearInterval(fallbackIntervalRef.current)
      fallbackIntervalRef.current = null
    }
  }

  function stopSpeechFallback() {
    clearFallbackInterval()

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }

    utteranceRef.current = null
  }

  function stopPlayback() {
    if (audioRef.current) {
      audioRef.current.pause()
    }

    stopSpeechFallback()
    setIsPlaying(false)
  }

  const resetPlayback = useEffectEvent(() => {
    stopPlayback()
    setPendingAutoplay(false)
    setProgress(0)
  })

  const cleanupPlayback = useEffectEvent(() => {
    if (audioRef.current) {
      audioRef.current.pause()
    }

    clearFallbackInterval()

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
  })

  useEffect(() => {
    if (!pendingAutoplay || !audioSummary?.audioUrl || !audioRef.current) {
      return
    }

    void audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true)
        setPendingAutoplay(false)
      })
      .catch(() => {
        setPendingAutoplay(false)
      })
  }, [audioSummary?.audioUrl, pendingAutoplay])

  useEffect(() => {
    resetPlayback()
  }, [audioIdentity])

  useEffect(() => {
    if (audioSummary?.status !== "generating") {
      return
    }

    resetPlayback()
  }, [audioSummary?.status])

  useEffect(() => {
    return () => {
      cleanupPlayback()
    }
  }, [])

  function startSpeechFallback() {
    if (!audioSummary?.script) {
      return
    }

    if (!("speechSynthesis" in window)) {
      setProgress(100)
      return
    }

    stopSpeechFallback()
    setProgress(0)
    setIsPlaying(true)

    const utterance = new SpeechSynthesisUtterance(audioSummary.script)
    utterance.rate = 0.98
    utterance.onend = () => {
      clearFallbackInterval()
      setIsPlaying(false)
      setProgress(100)
    }
    utterance.onerror = () => {
      clearFallbackInterval()
      setIsPlaying(false)
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)

    fallbackIntervalRef.current = window.setInterval(() => {
      setProgress((value) => {
        const nextValue = value + 100 / durationSeconds / 3
        return nextValue >= 100 ? 100 : nextValue
      })
    }, 320)
  }

  async function handlePlay() {
    if (!audioSummary) {
      return
    }

    if (isPlaying) {
      stopPlayback()
      return
    }

    if (audioSummary.audioUrl && audioRef.current) {
      setProgress(0)
      audioRef.current.currentTime = 0
      void audioRef.current.play()
      setIsPlaying(true)
      return
    }

    if (
      audioSummary.status === "failed" ||
      audioSummary.provider === "fallback"
    ) {
      startSpeechFallback()
      return
    }

    setIsRequestingAudio(true)

    try {
      const updatedAudioSummary = await ensureRelayAudio(relay.slug)

      if (updatedAudioSummary?.audioUrl) {
        setPendingAutoplay(true)
        return
      }

      startSpeechFallback()
    } finally {
      setIsRequestingAudio(false)
    }
  }

  const providerLabel =
    audioSummary?.status === "generating" || isRequestingAudio
      ? "Generating audio"
      : audioSummary?.provider === "elevenlabs"
        ? "ElevenLabs live"
        : audioSummary?.provider === "fallback"
          ? "Relay-specific fallback"
          : "Generates on first play"
  const voiceLabel =
    audioSummary?.voiceName ||
    (audioSummary?.provider === "fallback"
      ? "Relay-specific fallback voice"
      : "Configured ElevenLabs voice")

  return (
    <div
      id="audio-summary"
      className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,32,0.76),rgba(7,13,24,0.92))] px-5 py-5 shadow-[0_24px_80px_rgba(2,6,23,0.34)]"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(45,211,191,0.18)] bg-[rgba(17,56,64,0.3)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[rgba(163,252,239,0.94)]">
              <AudioLines className="size-3.5" />
              Voice summary
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-white/78">
              <RadioTower className="size-3.5" />
              {providerLabel}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">
              Relay spoken summary
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[rgba(205,214,231,0.84)]">
              {audioSummary?.script || relay.oneLineSummary}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-[rgba(186,198,223,0.72)]">
            <span>{voiceLabel}</span>
            <span className="h-1 w-1 rounded-full bg-white/30" />
            <span>{durationLabel}</span>
            <span className="h-1 w-1 rounded-full bg-white/30" />
            <span>
              Updated{" "}
              {new Date(
                audioSummary?.lastGeneratedAt || relay.updatedAt
              ).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>

          {audioSummary?.fallbackReason || audioSummary?.errorMessage ? (
            <p className="text-xs leading-6 text-[rgba(255,204,213,0.8)]">
              {audioSummary.provider === "fallback"
                ? `Fallback active for this relay${audioSummary.requestedVoiceId ? ` after voice ${audioSummary.requestedVoiceId} failed` : ""}.`
                : audioSummary.errorMessage}
            </p>
          ) : null}
        </div>

        <div className="w-full max-w-md space-y-4 rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
          <div className="flex items-end gap-1">
            {waveformBars.map((height, index) => (
              <motion.span
                key={`${height}-${index}`}
                className="w-2 rounded-full bg-[linear-gradient(180deg,rgba(181,148,255,0.44),rgba(104,240,229,0.95))]"
                style={{ height }}
                animate={{
                  opacity: isPlaying ? [0.4, 1, 0.4] : 0.45,
                  scaleY: isPlaying ? [0.72, 1, 0.72] : 0.85,
                }}
                transition={{
                  duration: 1.8,
                  delay: index * 0.04,
                  repeat: Number.POSITIVE_INFINITY,
                }}
              />
            ))}
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-white/6">
            <motion.div
              className="h-full rounded-full bg-[linear-gradient(90deg,rgba(104,240,229,0.9),rgba(181,148,255,0.92))]"
              animate={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <Button
              onClick={handlePlay}
              size="lg"
              disabled={!audioSummary?.script || audioSummary?.status === "generating"}
              className="h-11 rounded-full bg-[linear-gradient(135deg,rgba(57,208,193,1),rgba(125,239,228,0.88))] px-5 text-[rgba(4,19,28,0.94)] hover:brightness-105 disabled:opacity-60"
            >
              {isRequestingAudio || audioSummary?.status === "generating" ? (
                <>
                  <AudioLines className="size-4 animate-pulse" />
                  Generating Audio
                </>
              ) : isPlaying ? (
                <>
                  <Pause className="size-4" />
                  Pause Summary
                </>
              ) : (
                <>
                  <Play className="size-4" />
                  Play Summary
                </>
              )}
            </Button>
            <div className="text-right text-xs text-[rgba(153,167,193,0.72)]">
              <p>Playback progress</p>
              <p className="mt-1 text-sm text-white/86">
                {Math.round(progress)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {audioSummary?.audioUrl ? (
        <audio
          key={audioIdentity}
          ref={audioRef}
          src={audioSummary.audioUrl}
          onTimeUpdate={() => {
            if (!audioRef.current || Number.isNaN(audioRef.current.duration)) {
              return
            }

            setProgress(
              (audioRef.current.currentTime / audioRef.current.duration) * 100
            )
          }}
          onEnded={() => {
            setIsPlaying(false)
            setProgress(100)
          }}
          className="hidden"
        />
      ) : null}
    </div>
  )
}
