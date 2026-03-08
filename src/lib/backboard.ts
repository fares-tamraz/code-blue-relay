const BACKBOARD_API_KEY = process.env.BACKBOARD_API_KEY
const BACKBOARD_BASE_URL = process.env.BACKBOARD_BASE_URL ?? "https://api.backboard.io"

export const isBackboardConfigured = Boolean(BACKBOARD_API_KEY)

type BackboardGenerationRequest = {
  systemPrompt: string
  userPrompt: string
}

async function createAssistant(systemPrompt: string) {
  const response = await fetch(`${BACKBOARD_BASE_URL}/assistants`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": BACKBOARD_API_KEY!,
    },
    body: JSON.stringify({
      name: "Code Blue Relay Structured Memory",
      system_prompt: systemPrompt,
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Backboard assistant creation failed with ${response.status}`)
  }

  const payload = (await response.json()) as {
    assistant_id?: string
    id?: string
  }

  return payload.assistant_id ?? payload.id ?? ""
}

async function createThread(assistantId: string) {
  const response = await fetch(
    `${BACKBOARD_BASE_URL}/assistants/${assistantId}/threads`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": BACKBOARD_API_KEY!,
      },
      body: JSON.stringify({}),
      cache: "no-store",
    }
  )

  if (!response.ok) {
    throw new Error(`Backboard thread creation failed with ${response.status}`)
  }

  const payload = (await response.json()) as {
    thread_id?: string
    id?: string
  }

  return payload.thread_id ?? payload.id ?? ""
}

async function createMessage(threadId: string, userPrompt: string) {
  const formData = new URLSearchParams()
  formData.set("content", userPrompt)
  formData.set("stream", "false")

  const response = await fetch(`${BACKBOARD_BASE_URL}/threads/${threadId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-API-Key": BACKBOARD_API_KEY!,
    },
    body: formData,
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Backboard message creation failed with ${response.status}`)
  }

  const payload = (await response.json()) as {
    content?: string
    message?: {
      content?: string
    }
  }

  return payload.content ?? payload.message?.content ?? ""
}

export async function generateStructuredMemoryWithBackboard({
  systemPrompt,
  userPrompt,
}: BackboardGenerationRequest) {
  if (!BACKBOARD_API_KEY) {
    throw new Error("Backboard is not configured")
  }

  const assistantId = await createAssistant(systemPrompt)

  if (!assistantId) {
    throw new Error("Backboard assistant ID missing")
  }

  const threadId = await createThread(assistantId)

  if (!threadId) {
    throw new Error("Backboard thread ID missing")
  }

  const content = await createMessage(threadId, userPrompt)

  if (!content) {
    throw new Error("Backboard returned empty content")
  }

  return content
}
