import type { ReactNode } from "react"
import { CornerDownRight } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toneClassMap } from "@/lib/relay"
import { cn } from "@/lib/utils"
import type { SignalTone } from "@/types/relay"

type RelayPanelProps = {
  title: string
  eyebrow?: string
  items?: string[]
  tone?: SignalTone
  className?: string
  children?: ReactNode
}

export function RelayPanel({
  title,
  eyebrow,
  items,
  tone = "teal",
  className,
  children,
}: RelayPanelProps) {
  return (
    <Card
      className={cn(
        "rounded-[28px] border border-white/10 bg-[rgba(10,18,32,0.7)] py-0 shadow-[0_24px_80px_rgba(2,6,23,0.3)]",
        className
      )}
    >
      <CardHeader className="space-y-3 px-5 pt-5 pb-4">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[rgba(153,167,193,0.76)]">
            {eyebrow}
          </p>
        ) : null}
        <CardTitle className="text-2xl font-semibold tracking-[-0.03em] text-white">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        {items ? (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item}
                className="flex gap-3 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3"
              >
                <span
                  className={cn(
                    "mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                    toneClassMap[tone]
                  )}
                >
                  <CornerDownRight className="size-3.5" />
                </span>
                <span className="text-sm leading-6 text-[rgba(218,227,242,0.84)]">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
