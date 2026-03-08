import { notFound } from "next/navigation"

import { AppHeader } from "@/components/relay/app-header"
import { CaseDetailClient } from "@/components/relay/case-detail-client"
import { getCaseById } from "@/data/demo-cases"

type CasePageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function CasePage({ params }: CasePageProps) {
  const { id } = await params
  const caseData = getCaseById(id)

  if (!caseData) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-6 md:px-8 lg:px-10">
      <AppHeader
        title={`${caseData.patientName} relay`}
        description="Open the full continuity layer: spoken handoff, structured memory, carried-forward concerns, escalation thresholds, and the voice-ready summary."
        ctaHref="/dashboard"
        ctaLabel="Back to Dashboard"
      />

      <section className="mt-6">
        <CaseDetailClient initialCase={caseData} />
      </section>
    </main>
  )
}
