import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-6 md:px-8 lg:px-10">
      <div className="rounded-[32px] border border-white/10 bg-[rgba(7,13,24,0.72)] px-6 py-6 md:px-8">
        <Skeleton className="h-6 w-44 bg-white/8" />
        <Skeleton className="mt-6 h-14 w-full max-w-3xl bg-white/8" />
        <Skeleton className="mt-4 h-6 w-full max-w-2xl bg-white/8" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-[520px] rounded-[32px] bg-white/8" />
        <Skeleton className="h-[520px] rounded-[32px] bg-white/8" />
      </div>
    </main>
  )
}
