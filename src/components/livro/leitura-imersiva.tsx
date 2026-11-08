'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { createPortal } from 'react-dom'

import { Popover } from '@base-ui/react/popover'
import { ExpandIcon, ListIcon, ShrinkIcon, SlidersHorizontalIcon, XIcon } from 'lucide-react'

import BookReader from '@/components/livro/book-reader'
import { CENAS, CENA_PADRAO, type CenaId } from '@/components/livro/cenas'

import type { Book } from '@/lib/lvh/types'
import { cn } from '@/lib/utils'

// Preferências de quem lê, guardadas só neste navegador
const CENA_KEY = 'lvh:leitura-cena'
const PAGINAS_KEY = 'lvh:leitura-paginas'
const VIRADA_KEY = 'lvh:leitura-virada'
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
const sectionTitleClassName = 'text-[0.6875rem] font-medium tracking-[0.12em] text-white/60 uppercase'
const iconButtonClassName =
  'flex size-10 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-white/15 [&_svg]:size-[1.125rem]'

type LeituraImersivaProps = {
  book: Book
  // Texto discreto no canto: de quem é o livro e, no link de convidado, quem está lendo
  caption?: string
  onClose: () => void
}

// Modo de leitura: o livro aberto sobre uma superfície (madeira ou linho), em tela cheia,
// sem nada do site em volta. Os controles aparecem ao mexer o mouse ou tocar, e somem sozinhos
const LeituraImersiva = ({ book, caption, onClose }: LeituraImersivaProps) => {
  // Um fundo salvo que deixou de existir volta para o padrão, com a bolinha certa marcada
  const [cena, setCena] = useState<CenaId>(() => {
    const saved = readPreference<CenaId>(CENA_KEY, CENA_PADRAO)

    return CENAS.some(item => item.id === saved) ? saved : CENA_PADRAO
  })
  const [paginas, setPaginas] = useState(() => readPreference<'duas' | 'uma'>(PAGINAS_KEY, 'duas'))
  const [virada, setVirada] = useState(() => readPreference(VIRADA_KEY, 'ligada') === 'ligada')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsOpenRef = useRef(false)
  const [indexOpen, setIndexOpen] = useState(false)
  const indexOpenRef = useRef(false)
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
      if (!hovering.current && !settingsOpenRef.current && !indexOpenRef.current) setVisible(false)
    }, IDLE_MS)
  }, [])

  // Índice com capítulos e busca: enquanto aberto, os controles não somem
  const openIndex = useCallback(
    (open: boolean) => {
      indexOpenRef.current = open
      setIndexOpen(open)
      wake()
    },
    [wake]
  )

  useEffect(() => {
    // Os controles já começam à vista; só o relógio para escondê-los é que liga aqui
    idleTimer.current = window.setTimeout(() => {
      if (!hovering.current && !settingsOpenRef.current && !indexOpenRef.current) setVisible(false)
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
      // Com os ajustes abertos, o Esc fecha só o painel
      if (event.key === 'Escape' && !document.fullscreenElement && !settingsOpenRef.current) {
        if (indexOpenRef.current) openIndex(false)
        else onClose()
      }
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
  }, [wake, onClose, openIndex])

  const chooseScene = (id: CenaId) => {
    setCena(id)
    savePreference(CENA_KEY, id)
  }

  const choosePaginas = (value: 'duas' | 'uma') => {
    setPaginas(value)
    savePreference(PAGINAS_KEY, value)
  }

  const toggleVirada = () => {
    const next = !virada

    setVirada(next)
    savePreference(VIRADA_KEY, next ? 'ligada' : 'desligada')
  }

  const openSettings = (open: boolean) => {
    settingsOpenRef.current = open
    setSettingsOpen(open)
    wake()
  }

  // Com uma página só, a folha não tem como virar como num livro aberto: a página apenas troca
  const singlePage = paginas === 'uma'
  const animate = virada && !singlePage

  const swatches = (kind: 'textura' | 'cor') => (
    <div role='radiogroup' aria-label={kind === 'textura' ? 'Texturas' : 'Cores'} className='flex gap-2'>
      {CENAS.filter(item => item.kind === kind).map(item => (
        <button
          key={item.id}
          type='button'
          role='radio'
          aria-checked={cena === item.id}
          aria-label={item.label}
          title={item.label}
          onClick={() => chooseScene(item.id)}
          className={cn(
            'size-9 cursor-pointer rounded-full ring-offset-2 ring-offset-[#2a2420] transition-[box-shadow,scale] hover:scale-110',
            cena === item.id ? 'ring-2 ring-white' : 'ring-1 ring-white/25'
          )}
          style={item.swatch}
        />
      ))}
    </div>
  )

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    else document.documentElement.requestFullscreen().catch(() => {})
  }

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

      <BookReader
        book={book}
        immersive
        controlsVisible={visible}
        shadow={scene.shadow}
        singlePage={singlePage}
        animate={animate}
        indexOpen={indexOpen}
        onIndexOpenChange={openIndex}
      />

      {/* Barra de cima: quem é o livro à esquerda; ajustes, tela cheia e sair à direita */}
      <div
        onPointerEnter={() => (hovering.current = true)}
        onPointerLeave={() => (hovering.current = false)}
        className={cn(
          'absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 transition-opacity duration-500 sm:p-5',
          visible ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <div className='flex min-w-0 items-center gap-2'>
          <button
            type='button'
            onClick={() => openIndex(!indexOpen)}
            aria-expanded={indexOpen}
            className={cn(
              glassClassName,
              'cursor-pointer gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-black/50',
              indexOpen && 'bg-black/55'
            )}
          >
            <ListIcon className='size-4' />
            Índice
          </button>
          {caption && (
            <span className={cn(glassClassName, 'min-w-0 px-4 py-2.5 text-sm max-md:hidden')}>
              <span className='truncate'>{caption}</span>
            </span>
          )}
        </div>

        <div className='flex flex-wrap items-center justify-end gap-2'>
          <div className={cn(glassClassName, 'gap-0.5 p-1')}>
            {/* Ajustes da leitura: fundo, uma ou duas páginas e a animação da folha */}
            <Popover.Root open={settingsOpen} onOpenChange={openSettings}>
              <Popover.Trigger
                aria-label='Ajustes da leitura'
                title='Ajustes da leitura'
                className={cn(iconButtonClassName, settingsOpen && 'bg-white/15')}
              >
                <SlidersHorizontalIcon />
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Positioner side='bottom' align='end' sideOffset={10} className='z-[80]'>
                  <Popover.Popup
                    onPointerEnter={() => (hovering.current = true)}
                    onPointerLeave={() => (hovering.current = false)}
                    className='flex w-[19rem] flex-col gap-5 rounded-3xl bg-[#2a2420]/90 p-5 text-white shadow-[0_24px_60px_-20px_rgb(0_0_0/0.7)] backdrop-blur-xl outline-none'
                  >
                    <section className='flex flex-col gap-3'>
                      <p className={sectionTitleClassName}>Fundo</p>
                      <div className='flex flex-col gap-2'>
                        <span className='text-sm text-white/80'>Texturas</span>
                        {swatches('textura')}
                      </div>
                      <div className='flex flex-col gap-2'>
                        <span className='text-sm text-white/80'>Cores</span>
                        {swatches('cor')}
                      </div>
                    </section>

                    {/* Em telas estreitas só cabe uma página, então a escolha nem aparece */}
                    <section className='flex flex-col gap-3 max-[819px]:hidden'>
                      <p className={sectionTitleClassName}>Páginas</p>
                      <div role='radiogroup' aria-label='Páginas' className='flex rounded-full bg-white/10 p-1'>
                        {(
                          [
                            ['duas', 'Duas páginas'],
                            ['uma', 'Uma página']
                          ] as const
                        ).map(([value, label]) => (
                          <button
                            key={value}
                            type='button'
                            role='radio'
                            aria-checked={paginas === value}
                            onClick={() => choosePaginas(value)}
                            className={cn(
                              'flex-1 cursor-pointer rounded-full px-3 py-2 text-sm transition-colors',
                              paginas === value ? 'bg-white text-[#2a2420]' : 'text-white/80 hover:text-white'
                            )}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </section>

                    <section className='flex flex-col gap-2'>
                      <div className='flex items-center justify-between gap-4'>
                        <span id='virada-label' className='text-sm'>
                          Animação de virar a página
                        </span>
                        <button
                          type='button'
                          role='switch'
                          aria-checked={animate}
                          aria-labelledby='virada-label'
                          disabled={singlePage}
                          onClick={toggleVirada}
                          className={cn(
                            'relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors disabled:cursor-default disabled:opacity-40',
                            animate ? 'bg-honey' : 'bg-white/20'
                          )}
                        >
                          <span
                            className={cn(
                              'absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform',
                              animate && 'translate-x-5'
                            )}
                          />
                        </button>
                      </div>
                      {singlePage && (
                        <p className='text-xs text-pretty text-white/60'>
                          Com uma página por vez, a página troca sem animação.
                        </p>
                      )}
                    </section>
                  </Popover.Popup>
                </Popover.Positioner>
              </Popover.Portal>
            </Popover.Root>
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
