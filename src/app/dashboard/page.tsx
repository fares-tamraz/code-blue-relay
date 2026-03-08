import { AppHeader } from "@/components/relay/app-header"
import { DashboardContent } from "@/components/relay/dashboard-content"

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-6 md:px-8 lg:px-10">
      <AppHeader
        title="Active cases, structured for the incoming shift."
        description="Every card keeps the incoming team focused on what changed, what stayed unresolved, and what was carried forward from the previous shift."
        ctaHref="/compose"
        ctaLabel="Compose New Relay"
      />

      <DashboardContent />
    </main>
  )
}
