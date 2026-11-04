// Ditado, como no site (src/components/app/use-dictation.ts): a fala vira texto no fim de cada frase e o áudio
// não é guardado (para isso existe a gravação). Usa o reconhecimento de fala do sistema, em português
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition'
import { useEffect, useRef, useState } from 'react'

export function useDictation(onText: (text: string) => void) {
  const [listening, setListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const onTextRef = useRef(onText)

  useEffect(() => {
    onTextRef.current = onText
  })

  // Ao sair da pergunta, para de ouvir
  useEffect(() => () => ExpoSpeechRecognitionModule.abort(), [])

  useSpeechRecognitionEvent('result', event => {
    const transcript = event.results[0]?.transcript.trim()

    if (event.isFinal && transcript) onTextRef.current(transcript)
  })
  useSpeechRecognitionEvent('end', () => setListening(false))
  useSpeechRecognitionEvent('error', event => {
    setListening(false)
    // "no-speech" e "aborted" são só silêncio ou parada: não são erro para quem está ditando
    if (event.error !== 'no-speech' && event.error !== 'aborted') setError('Não foi possível ouvir. Tente de novo.')
  })

  const start = async () => {
    setError(null)

    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync()

    if (!permission.granted) {
      setError('Para ditar, permita o microfone e o reconhecimento de fala nos Ajustes.')

      return
    }

    ExpoSpeechRecognitionModule.start({ lang: 'pt-BR', continuous: true, interimResults: false, addsPunctuation: true })
    setListening(true)
  }

  const stop = () => ExpoSpeechRecognitionModule.stop()

  return { supported: ExpoSpeechRecognitionModule.isRecognitionAvailable(), listening, error, start, stop }
}
