import { AlertTriangle, Siren } from "lucide-react"

import { cn } from "@/lib/utils"
import type { CaseStatus } from "@/types/relay"

type EscalationBannerProps = {
  rule: {
    title: string
    condition: string
    action: string
  }
  status: CaseStatus
  className?: string
}

export function EscalationBanner({
  rule,
  status,
  className,
}: EscalationBannerProps) {
  const urgent = status === "Escalate"

  return (
    <div
      className={cn(
        "rounded-[28px] border px-5 py-5 backdrop-blur-sm",
        urgent
          ? "border-[rgba(251,113,133,0.26)] bg-[linear-gradient(135deg,rgba(102,30,48,0.7),rgba(22,20,30,0.86))]"
          : "border-[rgba(245,158,11,0.22)] bg-[linear-gradient(135deg,rgba(96,62,14,0.5),rgba(22,20,30,0.84))]",
        className
      )}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/82">
            {urgent ? (
              <Siren className="size-3.5 text-[rgba(255,191,204,0.95)]" />
            ) : (
              <AlertTriangle className="size-3.5 text-[rgba(252,211,125,0.95)]" />
            )}
            {urgent ? "Escalation active" : "Escalation logic armed"}
          </div>
          <div>
            <h3 className="text-xl font-semibold tracking-[-0.02em] text-white">
              {rule.title}
            </h3>
            <p className="mt-2 text-sm leading-7 text-[rgba(225,231,243,0.88)]">
              {rule.condition}
            </p>
          </div>
        </div>
        <div className="max-w-md rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[rgba(153,167,193,0.76)]">
            Action
          </p>
          <p className="mt-2 text-sm leading-6 text-[rgba(225,231,243,0.86)]">
            {rule.action}
          </p>
        </div>
      </div>
    </div>
  )
}
