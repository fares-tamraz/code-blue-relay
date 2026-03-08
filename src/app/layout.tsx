import type { Metadata } from "next"
import type { ReactNode } from "react"

import { RelayStoreProvider } from "@/components/relay/relay-store-provider"

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
      <body>
        <RelayStoreProvider>{children}</RelayStoreProvider>
      </body>
    </html>
  )
}
