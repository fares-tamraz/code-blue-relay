import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6 py-10">
      <div className="w-full rounded-[34px] border border-white/10 bg-[rgba(9,17,30,0.78)] p-8 text-center shadow-[0_24px_80px_rgba(2,6,23,0.32)]">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[rgba(153,167,193,0.74)]">
          Relay not found
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white">
          This case does not exist in the demo memory rail.
        </h1>
        <p className="mt-4 text-sm leading-7 text-[rgba(186,198,223,0.78)]">
          Open the dashboard to continue the demo with the seeded caseboard.
        </p>
        <Button
          asChild
          size="lg"
          className="mt-8 h-11 rounded-full bg-[linear-gradient(135deg,rgba(57,208,193,1),rgba(125,239,228,0.88))] px-6 text-[rgba(4,19,28,0.94)] hover:brightness-105"
        >
          <Link href="/dashboard">Open Dashboard</Link>
        </Button>
      </div>
    </main>
  )
}
