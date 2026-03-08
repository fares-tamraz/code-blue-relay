import Link from "next/link"
import { Activity, ArrowRight, AudioLines, DatabaseZap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { isBackboardConfigured } from "@/lib/backboard"
import { isElevenLabsConfigured } from "@/lib/elevenlabs"
import { isSupabaseConfigured } from "@/lib/supabase"
import { cn } from "@/lib/utils"

type AppHeaderProps = {
  title: string
  description: string
  className?: string
  ctaHref?: string
  ctaLabel?: string
}

const statusPills = [
  {
    key: "relay",
    icon: Activity,
    label: "Continuity rail live",
    variant: "live",
  },
  {
    key: "voice",
    icon: AudioLines,
    label: isElevenLabsConfigured ? "ElevenLabs armed" : "Voice mock-ready",
    variant: isElevenLabsConfigured ? "live" : "soft",
  },
  {
    key: "memory",
    icon: DatabaseZap,
    label: isBackboardConfigured
      ? "Backboard adapter live"
      : isSupabaseConfigured
        ? "Supabase scaffolded"
        : "Mock memory service",
    variant: isBackboardConfigured || isSupabaseConfigured ? "live" : "soft",
  },
] as const

export function AppHeader({
  title,
  description,
  className,
  ctaHref,
  ctaLabel,
}: AppHeaderProps) {
  return (
    <header
      className={cn(
        "rounded-[32px] border border-white/10 bg-[rgba(7,13,24,0.72)] px-6 py-6 shadow-[0_30px_120px_rgba(2,6,23,0.45)] backdrop-blur-xl md:px-8",
        className
      )}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/90"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-[radial-gradient(circle_at_center,rgba(97,251,239,0.32),rgba(7,13,24,0.6))] text-[rgba(152,248,238,0.96)]">
                <span className="h-2.5 w-2.5 rounded-full bg-current shadow-[0_0_18px_rgba(91,242,230,0.75)]" />
              </span>
              Code Blue Relay
            </Link>
            <span className="rounded-full border border-[rgba(45,211,191,0.18)] bg-[rgba(17,56,64,0.3)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[rgba(153,247,236,0.92)]">
              Midnight clinical intelligence
            </span>
          </div>
          <div className="max-w-3xl space-y-2">
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
              {title}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-[rgba(186,198,223,0.8)] md:text-base">
              {description}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
            {statusPills.map((pill) => {
              const Icon = pill.icon
              return (
                <div
                  key={pill.key}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium backdrop-blur-sm",
                    pill.variant === "live"
                      ? "border-[rgba(45,211,191,0.18)] bg-[rgba(22,72,72,0.28)] text-[rgba(164,252,238,0.94)]"
                      : "border-white/10 bg-white/5 text-[rgba(186,198,223,0.78)]"
                  )}
                >
                  <Icon className="size-3.5" />
                  {pill.label}
                </div>
              )
            })}
          </div>
          {ctaHref && ctaLabel ? (
            <div className="flex justify-start lg:justify-end">
              <Button
                asChild
                size="lg"
                className="h-11 rounded-full bg-[linear-gradient(135deg,rgba(57,208,193,1),rgba(125,239,228,0.88))] px-5 text-[rgba(4,19,28,0.94)] hover:brightness-105"
              >
                <Link href={ctaHref}>
                  {ctaLabel}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
