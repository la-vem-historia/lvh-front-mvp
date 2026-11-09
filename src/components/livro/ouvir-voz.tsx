'use client'

import { useEffect, useRef, useState } from 'react'

import Link from 'next/link'
import { PauseIcon, PlayIcon } from 'lucide-react'

import Logo from '@/components/shadcn-studio/logo'
import { eyebrowClassName, pageTitleClassName } from '@/components/app/page-heading'

import { getSharedAudio } from '@/lib/lvh/api'
import { formatSeconds } from '@/lib/lvh/media'
import type { AudioRecording } from '@/lib/lvh/types'

// Quem aponta o celular para o QR code do livro impresso chega aqui: a pergunta e a voz, nada mais
const OuvirVoz = ({ token }: { token: string }) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [shared, setShared] = useState<{ author: string; question: string; audio: AudioRecording } | null | undefined>(
    undefined
  )
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    getSharedAudio(token).then(setShared)
  }, [token])

  const toggle = () => {
    const element = audioRef.current

    if (!element) return
    if (element.paused) element.play()
    else element.pause()
  }

  return (
    <div className='flex min-h-svh flex-col'>
      <header>
        <div className='mx-auto flex h-20 max-w-3xl items-center px-4 sm:px-6'>
          <Link href='/'>
            <Logo className='[&_svg]:h-[2.125rem]' />
          </Link>
        </div>
      </header>

      <main className='mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-10 px-4 pb-24 sm:px-6'>
        {shared === null && (
          <div className='flex max-w-md flex-col gap-4'>
            <h1 className={pageTitleClassName}>Este áudio não está disponível.</h1>
            <p className='text-muted-foreground text-base'>
              O código pode estar danificado, ou quem escreveu o livro apagou esta gravação.
            </p>
          </div>
        )}

        {shared && (
          <>
            <div className='flex flex-col gap-4'>
              <p className={eyebrowClassName}>Do livro de {shared.author}</p>
              <h1 className={pageTitleClassName}>{shared.question}</h1>
            </div>

            <div className='flex items-center gap-5'>
              <button
                type='button'
                onClick={toggle}
                aria-label={playing ? 'Pausar' : `Ouvir a voz de ${shared.author}`}
                className='bg-honey text-foreground flex size-20 shrink-0 cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-105'
              >
                {playing ? (
                  <PauseIcon className='size-7' fill='currentColor' />
                ) : (
                  <PlayIcon className='ml-1 size-7' fill='currentColor' />
                )}
              </button>
              <div className='flex min-w-0 flex-1 flex-col gap-2'>
                <span className='text-base'>
                  A voz de {shared.author} · {formatSeconds(shared.audio.seconds)}
                </span>
                <span className='bg-stone h-1 overflow-hidden rounded-full'>
                  <span className='bg-moss block h-full' style={{ width: `${progress * 100}%` }} />
                </span>
              </div>
              <audio
                ref={audioRef}
                src={shared.audio.url}
                preload='metadata'
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => {
                  setPlaying(false)
                  setProgress(0)
                }}
                onTimeUpdate={event => {
                  const { currentTime, duration } = event.currentTarget

                  if (duration) setProgress(currentTime / duration)
                }}
              />
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default OuvirVoz
