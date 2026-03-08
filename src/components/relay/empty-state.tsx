import { Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"

type EmptyStateProps = {
  title: string
  description: string
  className?: string
}

export function EmptyState({
  title,
  description,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[260px] flex-col items-center justify-center rounded-[28px] border border-white/10 bg-[rgba(10,18,32,0.6)] px-8 text-center",
        className
      )}
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-full border border-[rgba(110,147,201,0.22)] bg-[radial-gradient(circle_at_center,rgba(73,208,196,0.22),rgba(10,18,32,0.2))] text-[rgba(161,244,235,0.95)]">
        <Sparkles className="size-5" />
      </div>
      <h3 className="text-xl font-semibold tracking-[-0.02em] text-white">
        {title}
      </h3>
      <p className="mt-3 max-w-md text-sm leading-6 text-[rgba(186,198,223,0.72)]">
        {description}
      </p>
    </div>
  )
}
