'use client'

import { useEffect, useRef, useState } from 'react'

// A Web Speech API ainda não tem tipos no TypeScript; só o que usamos dela
type RecognitionResult = { isFinal: boolean; 0: { transcript: string } }

type Recognition = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: { resultIndex: number; results: ArrayLike<RecognitionResult> }) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
}

type RecognitionConstructor = new () => Recognition

const getRecognition = () => {
  const speech = window as unknown as {
    SpeechRecognition?: RecognitionConstructor
    webkitSpeechRecognition?: RecognitionConstructor
  }

  return speech.SpeechRecognition ?? speech.webkitSpeechRecognition
}

// Ditado: a fala vira texto (o áudio não é guardado; para isso existe a gravação)
export function useDictation(onText: (text: string) => void) {
  const [supported] = useState(() => Boolean(getRecognition()))
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<Recognition | null>(null)
  const onTextRef = useRef(onText)

  useEffect(() => {
    onTextRef.current = onText
  })

  useEffect(() => () => recognitionRef.current?.abort(), [])

  const start = () => {
    const SpeechRecognition = getRecognition()

    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()

    recognition.lang = 'pt-BR'
    recognition.continuous = true
    recognition.interimResults = false
    recognition.onresult = event => {
      for (let index = event.resultIndex; index < event.results.length; index++) {
        const result = event.results[index]

        if (result.isFinal) onTextRef.current(result[0].transcript.trim())
      }
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  const stop = () => recognitionRef.current?.stop()

  return { supported, listening, start, stop }
}
