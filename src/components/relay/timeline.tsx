import { formatClinicalStamp } from "@/lib/relay"
import { cn } from "@/lib/utils"
import type { TimelineEvent } from "@/types/relay"

type TimelineProps = {
  events: TimelineEvent[]
}

const toneClasses = {
  handoff: "bg-[rgba(125,239,228,0.92)] shadow-[0_0_18px_rgba(45,211,191,0.45)]",
  memory: "bg-[rgba(196,178,255,0.92)] shadow-[0_0_18px_rgba(167,139,250,0.4)]",
  warning: "bg-[rgba(252,211,125,0.92)] shadow-[0_0_18px_rgba(245,158,11,0.42)]",
  escalation:
    "bg-[rgba(255,189,202,0.94)] shadow-[0_0_20px_rgba(251,113,133,0.45)]",
}

export function Timeline({ events }: TimelineProps) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-[rgba(10,18,32,0.72)] px-5 py-5 shadow-[0_24px_80px_rgba(2,6,23,0.34)]">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[rgba(153,167,193,0.76)]">
          Case timeline
        </p>
        <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">
          Relay updates across the shift
        </h3>
      </div>

      <div className="mt-6 space-y-5">
        {events.map((event, index) => (
          <div key={event.id} className="relative pl-8">
            {index < events.length - 1 ? (
              <div className="absolute top-8 left-[11px] h-[calc(100%+0.75rem)] w-px bg-[linear-gradient(180deg,rgba(111,138,180,0.35),rgba(111,138,180,0))]" />
            ) : null}
            <span
              className={cn(
                "absolute top-1 left-0 h-[22px] w-[22px] rounded-full border border-white/12",
                toneClasses[event.tone]
              )}
            />
            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-base font-semibold text-white">
                    {event.title}
                  </h4>
                  <p className="mt-1 text-sm leading-6 text-[rgba(204,214,233,0.8)]">
                    {event.description}
                  </p>
                </div>
                <div className="text-right text-xs text-[rgba(153,167,193,0.74)]">
                  <p>{formatClinicalStamp(event.timestamp)}</p>
                  <p className="mt-1 uppercase tracking-[0.2em]">{event.actor}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
