"use client"

import { useEffect, useRef, useState } from "react"

type PermissionStateValue = "granted" | "prompt" | "denied" | "unsupported"

type SpeechRecognitionResultLike = {
  isFinal: boolean
  0: {
    transcript: string
  }
}

type SpeechRecognitionEventLike = {
  resultIndex: number
  results: SpeechRecognitionResultLike[]
}

type SpeechRecognitionLike = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onstart: (() => void) | null
  onend: (() => void) | null
  onerror: ((event: { error?: string }) => void) | null
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

type UseComposeMicrophoneOptions = {
  onTranscriptCaptured: (text: string) => void
}

export function useComposeMicrophone({
  onTranscriptCaptured,
}: UseComposeMicrophoneOptions) {
  const onTranscriptCapturedRef = useRef(onTranscriptCaptured)
  const recognitionConstructor =
    typeof window !== "undefined"
      ? window.SpeechRecognition ?? window.webkitSpeechRecognition
      : undefined
  const [isSupported] = useState(Boolean(recognitionConstructor))
  const [isListening, setIsListening] = useState(false)
  const [permissionState, setPermissionState] =
    useState<PermissionStateValue>(
      Boolean(recognitionConstructor) ? "prompt" : "unsupported"
    )
  const [errorMessage, setErrorMessage] = useState(
    Boolean(recognitionConstructor)
      ? ""
      : "Microphone transcription is unavailable in this browser."
  )
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  useEffect(() => {
    onTranscriptCapturedRef.current = onTranscriptCaptured
  }, [onTranscriptCaptured])

  useEffect(() => {
    const RecognitionConstructor = recognitionConstructor

    if (!RecognitionConstructor) {
      return
    }

    const recognition = new RecognitionConstructor()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"
    recognition.onstart = () => {
      setErrorMessage("")
      setIsListening(true)
    }
    recognition.onend = () => {
      setIsListening(false)
    }
    recognition.onerror = (event) => {
      const code = event.error ?? "unknown"

      if (code === "not-allowed" || code === "service-not-allowed") {
        setPermissionState("denied")
        setErrorMessage("Microphone permission was denied.")
      } else {
        setErrorMessage("Microphone capture could not start.")
      }

      setIsListening(false)
    }
    recognition.onresult = (event) => {
      const capturedSegments: string[] = []

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]

        if (result?.isFinal) {
          capturedSegments.push(result[0]?.transcript ?? "")
        }
      }

      const capturedText = capturedSegments.join(" ").trim()

      if (capturedText) {
        onTranscriptCapturedRef.current(capturedText)
      }
    }

    recognitionRef.current = recognition

    const permissionsApi = navigator.permissions

    if (!permissionsApi?.query) {
      return () => {
        recognition.stop()
      }
    }

    let permissionStatus:
      | {
          state: PermissionStateValue
          onchange: (() => void) | null
        }
      | undefined

    void permissionsApi
      .query({ name: "microphone" as PermissionName })
      .then((status) => {
        const nextPermissionStatus = status as NonNullable<typeof permissionStatus>
        permissionStatus = nextPermissionStatus
        setPermissionState(status.state as PermissionStateValue)
        nextPermissionStatus.onchange = () => {
          setPermissionState(status.state as PermissionStateValue)
        }
      })
      .catch(() => {
        setPermissionState("prompt")
      })

    return () => {
      recognition.stop()

      if (permissionStatus) {
        permissionStatus.onchange = null
      }
    }
  }, [recognitionConstructor])

  function toggleListening() {
    if (!recognitionRef.current || permissionState === "denied") {
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      return
    }

    setErrorMessage("")

    try {
      recognitionRef.current.start()
    } catch {
      setErrorMessage("Microphone capture could not start.")
      setIsListening(false)
    }
  }

  return {
    isSupported,
    isListening,
    permissionState,
    errorMessage,
    toggleListening,
  }
}
