'use client'

import { useMemo, useRef, useState } from 'react'

import { PauseIcon, PlayIcon } from 'lucide-react'

import { formatSeconds } from '@/lib/lvh/media'
import type { AudioRecording } from '@/lib/lvh/types'
import { cn } from '@/lib/utils'

const BARS = 42

// Forma de onda decorativa, sempre a mesma para o mesmo áudio
const waveform = (seed: string) => {
  let hash = 0

  for (let index = 0; index < seed.length; index += 97) hash = (hash * 31 + seed.charCodeAt(index)) | 0

  return Array.from({ length: BARS }, (_, index) => {
    hash = (hash * 1103515245 + 12345) | 0

    const noise = ((hash >>> 16) & 0xff) / 255
    const envelope = Math.sin((index / (BARS - 1)) * Math.PI) * 0.6 + 0.4

    return Math.max(0.15, noise * envelope)
  })
}

// Player da voz dentro da página do livro: play, onda e duração
const AudioMark = ({ audio, author }: { audio: AudioRecording; author: string }) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const bars = useMemo(() => waveform(audio.url), [audio.url])

  const toggle = () => {
    const element = audioRef.current

    if (!element) return
    if (element.paused) element.play()
    else element.pause()
  }

  return (
    <div className='flex h-full items-center gap-3 border-y border-[#e5dccb] px-1'>
      <button
        type='button'
        onClick={toggle}
        aria-label={playing ? 'Pausar' : `Ouvir a voz de ${author}`}
        className='bg-earth flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-white transition-transform hover:scale-105'
      >
        {playing ? (
          <PauseIcon className='size-3.5' fill='currentColor' />
        ) : (
          <PlayIcon className='ml-0.5 size-3.5' fill='currentColor' />
        )}
      </button>
      <div className='flex min-w-0 flex-1 flex-col gap-1.5'>
        <span className='font-heading text-[10.5px] italic text-[#6b6156]'>
          A voz de {author} · {formatSeconds(audio.seconds)}
        </span>
        <span aria-hidden='true' className='flex h-5 items-center gap-[2px]'>
          {bars.map((height, index) => (
            <span
              key={index}
              className={cn('w-[2px] flex-1 rounded-full', index / BARS < progress ? 'bg-earth' : 'bg-[#d8ccb6]')}
              style={{ height: `${height * 100}%` }}
            />
          ))}
        </span>
      </div>
      <audio
        ref={audioRef}
        src={audio.url}
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
  )
}

export default AudioMark
