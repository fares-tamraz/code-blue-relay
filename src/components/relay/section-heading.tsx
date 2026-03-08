import { cn } from "@/lib/utils"

type SectionHeadingProps = {
  eyebrow?: string
  title: string
  description?: string
  align?: "left" | "center"
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-3xl space-y-3",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[rgba(153,167,193,0.82)]">
          {eyebrow}
        </p>
      ) : null}
      <div className="space-y-3">
        <h2 className="text-3xl font-semibold tracking-[-0.03em] text-white md:text-5xl">
          {title}
        </h2>
        {description ? (
          <p className="text-base leading-7 text-[rgba(186,198,223,0.8)] md:text-lg">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  )
}
