import type { Metadata } from "next"
import type { ReactNode } from "react"

import "./globals.css"

export const metadata: Metadata = {
  title: "Code Blue Relay",
  description:
    "Voice-first clinical handoff that transforms spoken relay into persistent care continuity, escalation logic, and voice-ready case memory.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  )
}
