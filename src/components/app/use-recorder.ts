'use client'

import { useEffect, useRef, useState } from 'react'

import { blobToDataUrl } from '@/lib/lvh/media'
import type { AudioRecording } from '@/lib/lvh/types'

// Gravação de voz: guarda o áudio de verdade, para a família ouvir depois
export function useRecorder(onDone: (recording: AudioRecording) => void, maxSeconds = 180) {
  const [supported] = useState(() => 'MediaRecorder' in window && Boolean(navigator.mediaDevices?.getUserMedia))
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const onDoneRef = useRef(onDone)

  useEffect(() => {
    onDoneRef.current = onDone
  })

  useEffect(
    () => () => {
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
    },
    []
  )

  const start = async () => {
    setError(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: Blob[] = []
      const startedAt = Date.now()

      const timer = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startedAt) / 1000)

        setSeconds(elapsed)
        if (elapsed >= maxSeconds && recorder.state === 'recording') recorder.stop()
      }, 250)

      recorder.ondataavailable = event => chunks.push(event.data)
      recorder.onstop = async () => {
        window.clearInterval(timer)
        stream.getTracks().forEach(track => track.stop())
        setRecording(false)

        const blob = new Blob(chunks, { type: recorder.mimeType })

        onDoneRef.current({
          url: await blobToDataUrl(blob),
          seconds: Math.max(1, Math.round((Date.now() - startedAt) / 1000))
        })
      }

      recorderRef.current = recorder
      recorder.start()
      setSeconds(0)
      setRecording(true)
    } catch {
      setError('Não foi possível usar o microfone. Verifique a permissão do navegador.')
    }
  }

  const stop = () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
  }

  return { supported, recording, seconds, maxSeconds, error, start, stop }
}
