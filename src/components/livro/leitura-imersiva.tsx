'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { createPortal } from 'react-dom'

import { ExpandIcon, ShrinkIcon, Volume2Icon, VolumeXIcon, XIcon } from 'lucide-react'

import BookReader from '@/components/livro/book-reader'
import { CENAS, CENA_PADRAO, type CenaId } from '@/components/livro/cenas'
import { playPageTurn } from '@/components/livro/som-pagina'

import type { Book } from '@/lib/lvh/types'
import { cn } from '@/lib/utils'

// Preferências de quem lê, guardadas só neste navegador
const CENA_KEY = 'lvh:leitura-cena'
const SOM_KEY = 'lvh:leitura-som'
// Tempo parado até os controles sumirem e ficar só o livro
const IDLE_MS = 2200

const readPreference = <T extends string>(key: string, fallback: T): T => {
  try {
    return (window.localStorage.getItem(key) as T | null) ?? fallback
  } catch {
    return fallback
  }
}

const savePreference = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Sem storage, a escolha vale só até fechar a página
  }
}

const glassClassName =
  'flex items-center rounded-full bg-black/35 text-white backdrop-blur-md shadow-[0_8px_24px_-12px_rgb(0_0_0/0.6)]'
const iconButtonClassName =
  'flex size-10 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-white/15 [&_svg]:size-[1.125rem]'

type LeituraImersivaProps = {
  book: Book
  // Texto discreto no canto: de quem é o livro e, no link de convidado, quem está lendo
  caption?: string
  onClose: () => void
}

// Modo de leitura: o livro aberto sobre uma superfície (madeira, toalha, linho ou noite), em tela cheia,
// sem nada do site em volta. Os controles aparecem ao mexer o mouse ou tocar, e somem sozinhos
const LeituraImersiva = ({ book, caption, onClose }: LeituraImersivaProps) => {
  const [cena, setCena] = useState<CenaId>(() => readPreference<CenaId>(CENA_KEY, CENA_PADRAO))
  const [sound, setSound] = useState(() => readPreference(SOM_KEY, 'ligado') === 'ligado')
  const [visible, setVisible] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const idleTimer = useRef<number | undefined>(undefined)
  const hovering = useRef(false)

  const scene = CENAS.find(item => item.id === cena) ?? CENAS[0]

  // Qualquer movimento mostra os controles; parado, eles somem (menos com o mouse em cima deles)
  const wake = useCallback(() => {
    setVisible(true)
    window.clearTimeout(idleTimer.current)
    idleTimer.current = window.setTimeout(() => {
      if (!hovering.current) setVisible(false)
    }, IDLE_MS)
  }, [])

  useEffect(() => {
    // Os controles já começam à vista; só o relógio para escondê-los é que liga aqui
    idleTimer.current = window.setTimeout(() => {
      if (!hovering.current) setVisible(false)
    }, IDLE_MS)

    // A página de trás não rola enquanto o livro está aberto
    // e o espaço reservado da barra de rolagem some, para a superfície ir de ponta a ponta
    const root = document.documentElement
    const overflow = root.style.overflow
    const gutter = root.style.scrollbarGutter

    root.style.overflow = 'hidden'
    root.style.scrollbarGutter = 'auto'

    const handleKey = (event: KeyboardEvent) => {
      wake()
      if (event.key === 'Escape' && !document.fullscreenElement) onClose()
    }
    const handleFullscreen = () => setFullscreen(Boolean(document.fullscreenElement))

    window.addEventListener('keydown', handleKey)
    document.addEventListener('fullscreenchange', handleFullscreen)

    return () => {
      window.clearTimeout(idleTimer.current)
      root.style.overflow = overflow
      root.style.scrollbarGutter = gutter
      window.removeEventListener('keydown', handleKey)
      document.removeEventListener('fullscreenchange', handleFullscreen)
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    }
  }, [wake, onClose])

  const chooseScene = (id: CenaId) => {
    setCena(id)
    savePreference(CENA_KEY, id)
  }

  const toggleSound = () => {
    const next = !sound

    setSound(next)
    savePreference(SOM_KEY, next ? 'ligado' : 'desligado')
    // Ao ligar, toca uma vez: confirma o som e libera o áudio no navegador
    if (next) playPageTurn()
  }

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    else document.documentElement.requestFullscreen().catch(() => {})
  }

  const handleFlipStart = useCallback(() => {
    if (sound) playPageTurn()
  }, [sound])

  return createPortal(
    <div
      role='dialog'
      aria-modal='true'
      aria-label={`Lendo ${caption ?? 'o livro'}`}
      onPointerMove={wake}
      onPointerDown={wake}
      className={cn('fixed inset-0 z-[70] flex flex-col', !visible && 'cursor-none')}
      style={scene.style}
    >
      {/* Luz de abajur: o centro mais claro, as bordas caindo para a sombra */}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0'
        style={{
          background:
            'radial-gradient(ellipse 70% 65% at 50% 46%, rgb(255 236 200 / 0.16), transparent 70%), radial-gradient(ellipse at 50% 50%, transparent 45%, rgb(20 12 4 / 0.5) 100%)'
        }}
      />

      <BookReader book={book} immersive controlsVisible={visible} shadow={scene.shadow} onFlipStart={handleFlipStart} />

      {/* Barra de cima: quem é o livro à esquerda; fundos, som, tela cheia e sair à direita */}
      <div
        onPointerEnter={() => (hovering.current = true)}
        onPointerLeave={() => (hovering.current = false)}
        className={cn(
          'absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 transition-opacity duration-500 sm:p-5',
          visible ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        {caption ? (
          <span className={cn(glassClassName, 'min-w-0 px-4 py-2.5 text-sm max-sm:hidden')}>
            <span className='truncate'>{caption}</span>
          </span>
        ) : (
          <span />
        )}

        <div className='flex flex-wrap items-center justify-end gap-2'>
          <div role='radiogroup' aria-label='Fundo da leitura' className={cn(glassClassName, 'gap-1.5 p-1.5')}>
            {CENAS.map(item => (
              <button
                key={item.id}
                type='button'
                role='radio'
                aria-checked={cena === item.id}
                aria-label={item.label}
                title={item.label}
                onClick={() => chooseScene(item.id)}
                className={cn(
                  'size-7 cursor-pointer rounded-full ring-offset-2 ring-offset-black/40 transition-[box-shadow,scale] hover:scale-110',
                  cena === item.id ? 'ring-2 ring-white' : 'ring-1 ring-white/30'
                )}
                style={item.swatch}
              />
            ))}
          </div>

          <div className={cn(glassClassName, 'gap-0.5 p-1')}>
            <button
              type='button'
              onClick={toggleSound}
              aria-pressed={sound}
              aria-label={sound ? 'Desligar o som das páginas' : 'Ligar o som das páginas'}
              title={sound ? 'Desligar o som das páginas' : 'Ligar o som das páginas'}
              className={iconButtonClassName}
            >
              {sound ? <Volume2Icon /> : <VolumeXIcon />}
            </button>
            <button
              type='button'
              onClick={toggleFullscreen}
              aria-label={fullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
              title={fullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
              className={cn(iconButtonClassName, 'max-sm:hidden')}
            >
              {fullscreen ? <ShrinkIcon /> : <ExpandIcon />}
            </button>
            <button
              type='button'
              onClick={onClose}
              aria-label='Fechar o livro'
              title='Fechar o livro (Esc)'
              className={iconButtonClassName}
            >
              <XIcon />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default LeituraImersiva
