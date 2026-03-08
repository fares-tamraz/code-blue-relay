import { demoCases, getCaseById } from "@/data/demo-cases"
import type { Case, StructuredMemory } from "@/types/relay"

const BACKBOARD_API_KEY = process.env.BACKBOARD_API_KEY

export const isBackboardConfigured = Boolean(BACKBOARD_API_KEY)

export type MemoryAdapter = {
  listCases: () => Promise<Case[]>
  getCaseMemory: (caseId: string) => Promise<StructuredMemory | null>
}

function createMockMemoryAdapter(): MemoryAdapter {
  return {
    async listCases() {
      return demoCases
    },
    async getCaseMemory(caseId) {
      return getCaseById(caseId)?.structuredMemory ?? null
    },
  }
}

export function getMemoryAdapter(): MemoryAdapter {
  if (!BACKBOARD_API_KEY) {
    return createMockMemoryAdapter()
  }

  return {
    async listCases() {
      try {
        const response = await fetch("https://api.backboard.example/v1/cases", {
          headers: {
            Authorization: `Bearer ${BACKBOARD_API_KEY}`,
          },
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("Backboard listCases failed")
        }

        return (await response.json()) as Case[]
      } catch {
        return demoCases
      }
    },
    async getCaseMemory(caseId) {
      try {
        const response = await fetch(
          `https://api.backboard.example/v1/cases/${caseId}/memory`,
          {
            headers: {
              Authorization: `Bearer ${BACKBOARD_API_KEY}`,
            },
            cache: "no-store",
          }
        )

        if (!response.ok) {
          throw new Error("Backboard getCaseMemory failed")
        }

        return (await response.json()) as StructuredMemory
      } catch {
        return getCaseById(caseId)?.structuredMemory ?? null
      }
    },
  }
}
