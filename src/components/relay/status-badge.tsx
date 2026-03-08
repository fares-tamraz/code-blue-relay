import { Badge } from "@/components/ui/badge"
import { getStatusMeta } from "@/lib/relay"
import { cn } from "@/lib/utils"
import type { CaseStatus } from "@/types/relay"

type StatusBadgeProps = {
  status: CaseStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const meta = getStatusMeta(status)

  return (
    <Badge
      className={cn(
        "rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.22em] uppercase",
        meta.chipClassName,
        className
      )}
    >
      {meta.label}
    </Badge>
  )
}
