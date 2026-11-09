'use client'

import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'

import Image, { type StaticImageData } from 'next/image'
import { PlayIcon } from 'lucide-react'

import BookCover from '@/components/livro/book-cover'

import { PAPER_STYLE } from '@/lib/lvh/paper'
import { cn } from '@/lib/utils'

import fotoAmigos from '@/assets/landing/fotos/amigos.jpg'
import fotoIrmaos from '@/assets/landing/fotos/irmaos.jpg'
import fotoTriciclo from '@/assets/landing/fotos/triciclo.jpg'

// Tudo em cqw: a cena escala junto com a coluna do hero, do celular ao desktop
// A cena é um pouco mais alta que larga (10:11). O livro é o protagonista; as lembranças só espiam por trás dele
const SCENE_HEIGHT = 110
const BOOK_WIDTH = 60
const BOOK = {
  left: (100 - BOOK_WIDTH) / 2,
  top: (SCENE_HEIGHT - (BOOK_WIDTH * 622) / 440) / 2,
  width: BOOK_WIDTH
}
// Aberto, o par de páginas teria o dobro da largura: o livro encolhe um pouco para caber na cena e
// desliza meia página para a direita, para as duas páginas ficarem no centro
const OPEN_SCALE = 92 / (BOOK_WIDTH * 2)
const OPEN_SHIFT = (BOOK_WIDTH * OPEN_SCALE) / 2
const EASE = 'cubic-bezier(0.6, 0.05, 0.3, 1)'

// Forma de onda decorativa da voz gravada
const BARS = [
  0.35, 0.6, 0.45, 0.8, 0.55, 0.9, 0.4, 0.7, 1, 0.65, 0.5, 0.85, 0.45, 0.6, 0.95, 0.7, 0.4, 0.75, 0.55, 0.85, 0.5, 0.65,
  0.35, 0.6, 0.45, 0.3
]

const Waveform = () => (
  <span className='flex h-full items-center gap-[1.2cqw]'>
    {BARS.map((height, index) => (
      <span key={index} className='w-[1.2cqw] rounded-full bg-current' style={{ height: `${height * 100}%` }} />
    ))}
  </span>
)

const PlayMark = ({ className }: { className?: string }) => (
  <span className={cn('bg-earth flex shrink-0 items-center justify-center rounded-full text-white', className)}>
    <PlayIcon className='ml-[8%] size-[40%]' fill='currentColor' />
  </span>
)

// Foto revelada, com a borda clara e uma legenda à mão
const Print = ({ src, caption }: { src: StaticImageData; caption: string }) => (
  <div className='rounded-[1.5cqw] bg-page-photo p-[5cqw] pb-[4cqw] shadow-[0_2cqw_5cqw_-1.5cqw_rgb(50_38_24/0.4)]'>
    <Image src={src} alt='' sizes='12rem' className='aspect-[4/5] h-auto w-full object-cover' />
    <p className='font-heading mt-[3cqw] text-center text-[7.5cqw] text-page-muted italic'>{caption}</p>
  </div>
)

type Drift = {
  // Posição e largura na cena; o deslocamento é para dentro do livro e volta
  left: number
  top: number
  width: number
  rotate: number
  drift: [number, number]
  duration: number
  delay: number
}

// Cada lembrança respira para dentro e para fora do livro. Com o livro aberto, elas se recolhem
const Keepsake = ({ open, item, children }: { open: boolean; item: Drift; children: ReactNode }) => (
  <div
    aria-hidden='true'
    className={cn(
      'absolute transition-[opacity,scale] duration-700 ease-out motion-reduce:transition-none',
      open && 'scale-90 opacity-0'
    )}
    style={{ left: `${item.left}cqw`, top: `${item.top}cqw`, width: `${item.width}cqw` }}
  >
    <div
      className='@container [animation:keepsake-drift_var(--drift-duration)_ease-in-out_var(--drift-delay)_infinite] motion-reduce:[animation:none]'
      style={
        {
          rotate: `${item.rotate}deg`,
          '--drift-x': `${item.drift[0]}cqw`,
          '--drift-y': `${item.drift[1]}cqw`,
          '--drift-duration': `${item.duration}s`,
          '--drift-delay': `${item.delay}s`
        } as CSSProperties
      }
    >
      {children}
    </div>
  </div>
)

const KEEPSAKES: Record<'voz' | 'triciclo' | 'amigos' | 'recado', Drift> = {
  voz: { left: 25, top: 2, width: 50, rotate: 3, drift: [0, 6], duration: 11, delay: 0 },
  triciclo: { left: 1, top: 38, width: 27, rotate: -9, drift: [7, 1], duration: 13, delay: -4 },
  amigos: { left: 72, top: 27, width: 27, rotate: 7, drift: [-7, 0], duration: 12, delay: -7 },
  recado: { left: 40, top: 90, width: 46, rotate: -4, drift: [-2, -5], duration: 14, delay: -2 }
}

// Página do livro de exemplo: o mesmo papel e a mesma tinta do leitor do app
const Page = ({ side, number, children }: { side: 'left' | 'right'; number: number; children: ReactNode }) => (
  <div
    className={cn(
      '@container relative flex aspect-[440/622] w-full flex-col overflow-hidden px-[9cqw] pt-[10cqw] pb-[7cqw] text-night',
      side === 'left' ? 'rounded-l-[3px]' : 'rounded-r-[3px]'
    )}
    style={PAPER_STYLE}
  >
    {/* Sombra da dobra, no lado da lombada */}
    <span
      aria-hidden='true'
      className={cn('absolute inset-y-0 w-[14cqw]', side === 'left' ? 'right-0' : 'left-0')}
      style={{
        background: `linear-gradient(to ${side === 'left' ? 'left' : 'right'}, rgb(60 45 30 / 0.22), transparent)`
      }}
    />
    <div className='book-type relative flex flex-1 flex-col gap-[4cqw]'>{children}</div>
    <span className='book-ink book-type font-heading relative text-center text-[4cqw] text-page-muted'>{number}</span>
  </div>
)

const Question = ({ children }: { children: ReactNode }) => (
  <h3 className='book-ink font-heading text-[7.6cqw] leading-[1.2] font-medium text-balance'>{children}</h3>
)

const AnswerText = ({ children }: { children: ReactNode }) => (
  <p className='book-ink font-heading text-justify text-[5.4cqw] leading-[1.5] hyphens-auto'>{children}</p>
)

// O hero da landing: o livro de exemplo fechado, com fotos, voz e recado saindo das páginas.
// Passando o mouse (ou tocando, no celular) ele abre e mostra duas páginas
const HeroLivro = () => {
  const [open, setOpen] = useState(false)
  const pointer = useRef<string>('')

  const hover = (event: PointerEvent, next: boolean) => {
    if (event.pointerType === 'mouse') setOpen(next)
  }

  // No mouse quem abre é o hover; o clique só alterna no toque e no teclado
  const click = () => {
    if (pointer.current !== 'mouse') setOpen(current => !current)
    pointer.current = ''
  }

  const key = (event: KeyboardEvent) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    setOpen(current => !current)
  }

  const turn = { transitionDuration: '900ms', transitionTimingFunction: EASE }

  return (
    <div className='flex w-full justify-center'>
      <div
        role='button'
        tabIndex={0}
        aria-expanded={open}
        aria-label={open ? 'Fechar o livro de exemplo' : 'Abrir o livro de exemplo de Maria Oliveira'}
        onPointerEnter={event => hover(event, true)}
        onPointerLeave={event => hover(event, false)}
        onPointerDown={event => (pointer.current = event.pointerType)}
        onClick={click}
        onKeyDown={key}
        className='focus-visible:ring-ring/50 @container relative aspect-[10/11] w-full max-w-[36rem] lg:max-w-[calc((100svh-10rem)*10/11)] 2xl:max-w-[min(calc((100svh-10rem)*10/11),46rem)] cursor-pointer rounded-2xl outline-none select-none focus-visible:ring-3'
      >
        <Keepsake open={open} item={KEEPSAKES.voz}>
          <div
            className='flex items-center gap-[4cqw] rounded-[3cqw] px-[5cqw] py-[4cqw] shadow-[0_2cqw_5cqw_-2cqw_rgb(50_38_24/0.35)]'
            style={PAPER_STYLE}
          >
            <PlayMark className='size-[13cqw]' />
            <div className='flex min-w-0 flex-1 flex-col gap-[2cqw]'>
              <span className='font-heading text-[5.2cqw] text-page-muted italic'>A voz de Maria · 1:24</span>
              <span className='h-[7cqw] text-[#b9ab8f]'>
                <Waveform />
              </span>
            </div>
          </div>
        </Keepsake>

        <Keepsake open={open} item={KEEPSAKES.triciclo}>
          <Print src={fotoTriciclo} caption='O primeiro triciclo' />
        </Keepsake>

        <Keepsake open={open} item={KEEPSAKES.amigos}>
          <Print src={fotoAmigos} caption='Rio, 1961' />
        </Keepsake>

        <Keepsake open={open} item={KEEPSAKES.recado}>
          <div
            className='flex flex-col gap-[3cqw] rounded-[2.5cqw] px-[7cqw] py-[6cqw] shadow-[0_2cqw_5cqw_-2cqw_rgb(50_38_24/0.35)]'
            style={PAPER_STYLE}
          >
            {/* A assinatura fica no pé: é a parte do recado que aparece por baixo do livro */}
            <p className='font-heading text-[6.4cqw] leading-[1.35] text-night italic'>
              “Vó, conta de novo a história do baile de carnaval?”
            </p>
            <span className='text-earth text-[3.6cqw] font-medium tracking-[0.2em] uppercase'>Recado da Lia</span>
          </div>
        </Keepsake>

        {/* O livro: desliza meia página para a direita enquanto a capa gira, e o par de páginas fica no centro */}
        <div
          className='absolute z-10 transition-transform motion-reduce:transition-none'
          style={{
            ...turn,
            left: `${BOOK.left}cqw`,
            top: `${BOOK.top}cqw`,
            width: `${BOOK.width}cqw`,
            transform: open ? `translateX(${OPEN_SHIFT}cqw) scale(${OPEN_SCALE})` : 'none',
            perspective: '2400px'
          }}
        >
          <div className='shadow-[0_24px_44px_-24px_rgb(50_38_24/0.55)]'>
            <Page side='right' number={13}>
              <Question>Como você conheceu o vovô?</Question>
              <AnswerText>
                Num baile de carnaval, em 1962. Ele pisou no meu pé duas vezes e, na terceira, pediu desculpas com um
                sorriso que eu nunca esqueci.
              </AnswerText>
              <div className='flex items-center gap-[3cqw] border-y border-page-line py-[3cqw]'>
                <PlayMark className='size-[11cqw]' />
                <div className='flex min-w-0 flex-1 flex-col gap-[1.5cqw]'>
                  <span className='font-heading text-[4.2cqw] text-page-muted italic'>A voz de Maria · 1:24</span>
                  <span className='h-[5.5cqw] text-[#c9bda4]'>
                    <Waveform />
                  </span>
                </div>
              </div>
              <AnswerText>Até hoje, quando toca marchinha, ele me tira para dançar.</AnswerText>
            </Page>
          </div>

          {/* A capa gira pela lombada; no verso dela fica a página da esquerda */}
          <div
            className='absolute inset-0 origin-left transition-transform [transform-style:preserve-3d] motion-reduce:transition-none'
            style={{ ...turn, transform: open ? 'rotateY(-180deg)' : 'none' }}
          >
            <div className='absolute inset-0 [backface-visibility:hidden]'>
              <BookCover
                author='Maria Oliveira'
                year={2026}
                className='rounded-r-[5px] shadow-[4px_2px_0_-1px_#f5f0e3,7px_4px_0_-1px_#e6dfcd,0_30px_50px_-24px_rgb(50_38_24/0.6)]'
              />
            </div>
            <div className='absolute inset-0 shadow-[0_24px_44px_-24px_rgb(50_38_24/0.55)] [transform:rotateY(180deg)] [backface-visibility:hidden]'>
              <Page side='left' number={12}>
                <span className='book-ink text-earth text-[3.8cqw] font-medium tracking-[0.2em] uppercase'>
                  Capítulo 2 · Sua infância
                </span>
                <Question>Qual é a sua lembrança mais antiga?</Question>
                <AnswerText>
                  O cheiro do pão no forno da minha avó. Eu ficava na ponta dos pés para ver a massa crescer.
                </AnswerText>
                <div className='mx-auto mt-[1cqw] w-[38cqw] -rotate-2 bg-page p-[2cqw] pb-[1.5cqw] shadow-[0_1px_2px_rgb(60_45_30/0.12),0_3px_10px_rgb(60_45_30/0.16)]'>
                  <Image src={fotoIrmaos} alt='' sizes='10rem' className='aspect-[4/5] h-auto w-full object-cover' />
                  <p className='font-heading mt-[1.5cqw] text-center text-[3.8cqw] text-page-muted italic'>
                    Eu e o Zé, 1958
                  </p>
                </div>
              </Page>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroLivro
