import { NextResponse } from "next/server"

import { generateStructuredMemory } from "@/lib/ai/generate-structured-memory"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    transcript?: string
  }

  const transcript = payload.transcript?.trim() ?? ""

  if (!transcript) {
    return NextResponse.json(
      {
        error: "Transcript is required.",
      },
      { status: 400 }
    )
  }

  const structuredMemory = await generateStructuredMemory({
    transcript,
  })

  return NextResponse.json({
    structuredMemory,
  })
}
