'use client'

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent
} from 'react'

import { createPortal } from 'react-dom'

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExpandIcon,
  ZoomInIcon,
  ZoomOutIcon
} from 'lucide-react'
import { PageFlip } from 'page-flip'
import 'page-flip/src/Style/stPageFlip.css'

import { Button } from '@/components/ui/button'
import Lightbox from '@/components/app/lightbox'
import AudioMark from '@/components/livro/audio-mark'
import AudioQr from '@/components/livro/audio-qr'
import BookCover, { BookBack, coverColors } from '@/components/livro/book-cover'
import {
  PAGE_FORMATS,
  blockClassName,
  contentSize,
  blockHeight,
  contributorLabel,
  paginate,
  type FlowBlock,
  type Page,
  type PageFormat
} from '@/components/livro/paginate'

import { PAPER_STYLE } from '@/lib/lvh/paper'
import type { Book } from '@/lib/lvh/types'
import { cn } from '@/lib/utils'

const MAX_SCALE = 1.35
// Zoom por cima do tamanho que cabe na tela: 100% é o livro inteiro visível
const ZOOM_STEPS = [0.75, 1, 1.25, 1.5, 2]
// Tinta: marrom-grafite quente, como tinta de gráfica, nunca preto puro
export const INK = '#2a231c'

const listNames = (names: string[]) =>
  names.length > 1 ? `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}` : names[0]

// Foto impressa e colada na página: borda branca do tamanho da foto, sem cortar nada.
// Um clique abre a foto inteira no centro da tela
const PhotoPrint = ({
  block,
  maxWidth,
  maxHeight,
  still
}: {
  block: Extract<FlowBlock, { type: 'photo' }>
  maxWidth: number
  maxHeight: number
  still?: boolean
}) => {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])

  return (
    <>
      <button
        type='button'
        onClick={() => setOpen(true)}
        disabled={still}
        aria-label={`Ampliar a foto: ${block.alt}`}
        className={cn(
          'inline-flex cursor-zoom-in flex-col disabled:cursor-default disabled:hover:scale-100 rounded-[2.5px] bg-[#fdfbf6] p-[7px] shadow-[0_1px_2px_rgb(60_45_30/0.12),0_3px_10px_rgb(60_45_30/0.16)] transition-transform hover:scale-[1.02]',
          block.caption || still ? 'pb-2' : 'pb-[7px]'
        )}
        style={{ transform: `rotate(${block.tilt * 1.2}deg)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={block.src}
          alt={block.alt}
          className='h-auto w-auto rounded-[1.5px]'
          style={{ maxWidth, maxHeight }}
        />
        {/* Impresso, a foto leva o código do arquivo no ZIP: P047-F1 */}
        {(block.caption || still) && (
          <span className='font-heading mt-2 w-0 min-w-full truncate text-center text-[9.5px] text-[#8a7f72] italic'>
            {still && <span className='font-sans not-italic tracking-wide'>{block.code}</span>}
            {still && block.caption && ' · '}
            {block.caption}
          </span>
        )}
      </button>
      {open && <Lightbox src={block.src} alt={block.alt} onClose={close} />}
    </>
  )
}

// Espaço para colar a foto de verdade: um quadro tracejado do tamanho exato da foto.
// A foto continua ali, invisível, só para dar a medida; dentro do quadro vai a pista de qual foto colar
export const PhotoSlot = ({
  block,
  maxWidth,
  maxHeight
}: {
  block: Extract<FlowBlock, { type: 'photo' }>
  maxWidth: number
  maxHeight: number
}) => (
  <div className='relative inline-flex flex-col'>
    <div className='relative rounded-[2px] border border-dashed border-[#a99a82] p-[7px]'>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={block.src}
        alt=''
        aria-hidden='true'
        className='invisible h-auto w-auto'
        style={{ maxWidth, maxHeight }}
      />
      <div className='absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-6 text-center'>
        <span className='text-[7.5px] font-medium tracking-[0.22em] text-[#9a8f80] uppercase'>Cole aqui a foto</span>
        {/* Sem legenda embaixo, a pergunta da resposta diz qual foto vai aqui */}
        {!block.caption && (
          <span className='font-heading line-clamp-2 text-[10px] text-[#8a7f72] italic'>{block.alt}</span>
        )}
      </div>
    </div>
    <span className='font-heading mt-2 w-0 min-w-full truncate text-center text-[9.5px] text-[#8a7f72] italic'>
      <span className='font-sans not-italic tracking-wide'>{block.code}</span>
      {block.caption && ` · ${block.caption}`}
    </span>
  </div>
)

// Com audioLinks, a página é a versão impressa: a voz vira QR code e as fotos deixam de ser clicáveis
const FlowBlockView = ({
  block,
  author,
  width,
  audioLinks,
  photoSlots
}: {
  block: FlowBlock
  author: string
  width: number
  audioLinks?: Record<number, string>
  photoSlots?: boolean
}) => {
  const className = blockClassName(block)
  const height = blockHeight(block)

  switch (block.type) {
    case 'question':
      return <p className={className}>{block.text}</p>
    case 'contributor':
      return <p className={className}>{contributorLabel(block.name)}</p>
    case 'paragraph':
      return <p className={className}>{block.text}</p>
    case 'photo':
      return (
        <div className={className} style={{ height }}>
          {photoSlots ? (
            <PhotoSlot block={block} maxWidth={width - 24} maxHeight={(height ?? 0) - 40} />
          ) : (
            <PhotoPrint
              block={block}
              maxWidth={width - 24}
              maxHeight={(height ?? 0) - 40}
              still={Boolean(audioLinks)}
            />
          )}
        </div>
      )
    case 'rule':
      return <div aria-hidden='true' className={className} style={{ height }} />
    case 'audio':
      return (
        <div className={className} style={{ height }}>
          {audioLinks ? (
            <AudioQr audio={block.audio} author={author} url={audioLinks[block.questionId]} code={block.code} />
          ) : (
            <AudioMark audio={block.audio} author={author} />
          )}
        </div>
      )
  }
}

// Borda do papel: um fio mais escuro e um leve sombreado para dentro, para a folha não terminar num corte seco
const PAPER_EDGE = 'inset 0 0 0 0.5px rgb(60 45 30 / 0.12), inset 0 0 10px rgb(60 45 30 / 0.07)'

export const PageView = ({
  page,
  index,
  book,
  chapterPages,
  format,
  onGoTo,
  single,
  audioLinks,
  paperColor,
  photoSlots
}: {
  page: Page
  index: number
  book: Book
  chapterPages: Record<string, number>
  format: PageFormat
  onGoTo?: (index: number) => void
  single: boolean
  audioLinks?: Record<number, string>
  // Cor lisa no lugar da textura: no PDF a textura vira imagem e deixa o arquivo pesado
  paperColor?: string
  // Quadros tracejados no lugar das fotos, para colar as fotos de papel
  photoSlots?: boolean
}) => {
  const content = contentSize(format)
  const outer: CSSProperties = index % 2 === 1 ? { left: format.marginX } : { right: format.marginX }
  // Cantos levemente arredondados só do lado de fora: a lombada continua reta, como num livro de verdade
  const corners = single ? 'rounded-[3px]' : index % 2 === 1 ? 'rounded-l-[3px]' : 'rounded-r-[3px]'

  if (page.type === 'back') {
    return (
      <BookBack
        color={book.coverColor}
        className={cn('aspect-auto h-full', single ? 'rounded-[5px]' : 'rounded-l-[5px]')}
      />
    )
  }

  if (page.type === 'cover') {
    return (
      <BookCover
        author={book.author}
        color={book.coverColor}
        photo={book.coverPhoto}
        year={book.year}
        className='aspect-auto h-full rounded-r-[5px]'
      />
    )
  }

  const verso = index % 2 === 1
  const showFolio = page.type === 'content' || page.type === 'contents'

  if (page.type === 'endpaper') {
    // Guarda: o papel colorido logo depois da capa
    return (
      <div
        className={cn('size-full', corners)}
        style={{
          backgroundColor: coverColors[book.coverColor].cloth,
          backgroundImage:
            'radial-gradient(rgb(255 255 255 / 0.09) 1.2px, transparent 1.4px), radial-gradient(rgb(255 255 255 / 0.05) 1.2px, transparent 1.4px)',
          backgroundSize: '18px 18px',
          backgroundPosition: '0 0, 9px 9px'
        }}
      />
    )
  }

  return (
    <div
      className={cn('book-type relative size-full', corners)}
      style={{
        ...(paperColor ? { backgroundColor: paperColor } : PAPER_STYLE),
        color: INK,
        padding: `${format.marginY}px ${format.marginX}px`,
        boxShadow: paperColor ? undefined : PAPER_EDGE
      }}
    >
      {page.type === 'content' && (
        <span
          className='book-ink absolute top-7 text-[7.5px] font-medium tracking-[0.22em] text-[#9a8f80] uppercase'
          style={outer}
        >
          {verso ? book.author : page.chapterTitle}
        </span>
      )}

      {page.type === 'dedication' && (
        <div className='book-ink flex h-full items-start justify-center pt-[30%] text-center'>
          <p className='font-heading max-w-[260px] text-[17px] leading-[1.5] whitespace-pre-line italic'>{page.text}</p>
        </div>
      )}

      {page.type === 'title' && (
        <div className='book-ink flex h-full flex-col items-center text-center'>
          <div className='flex flex-1 flex-col items-center justify-center gap-4'>
            <span className='font-heading text-[30px] leading-[1.1] text-balance'>{book.author}</span>
            <span aria-hidden='true' className='bg-earth h-px w-8' />
            <span className='font-heading text-[15px] text-[#6b6156] italic'>para a minha família</span>
          </div>
          <span className='text-[7.5px] font-medium tracking-[0.25em] text-[#9a8f80] uppercase'>
            Lá Vem História · {book.year}
          </span>
        </div>
      )}

      {page.type === 'contents' && (
        <div className='book-ink flex flex-col gap-8 pt-[12%]'>
          <p className='font-heading text-[24px]'>Sumário</p>
          <ol className='flex flex-col gap-2.5'>
            {book.chapters.map(chapter => (
              <li key={chapter.id}>
                <button
                  type='button'
                  onClick={() => onGoTo?.(chapterPages[chapter.id])}
                  className='hover:text-earth flex w-full cursor-pointer items-baseline gap-2 text-left text-[13px] transition-colors'
                >
                  <span className='text-earth w-5 text-[9px] font-medium tabular-nums'>
                    {String(chapter.number).padStart(2, '0')}
                  </span>
                  <span className='font-heading'>{chapter.title}</span>
                  <span
                    aria-hidden='true'
                    className='mx-1 flex-1 -translate-y-[3px] border-b border-dotted border-[#cfc4b1]'
                  />
                  <span className='font-heading tabular-nums'>{chapterPages[chapter.id] + 1}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}

      {page.type === 'chapter' && (
        <div className='book-ink flex flex-col gap-3 pt-[28%]'>
          <span className='text-earth text-[8px] font-medium tracking-[0.25em] uppercase'>Capítulo</span>
          <span className='font-heading text-earth text-[64px] leading-none font-light'>{page.number}</span>
          <span className='font-heading mt-2 text-[30px] leading-[1.15] text-balance'>{page.title}</span>
          <span aria-hidden='true' className='bg-earth mt-3 h-px w-8' />
        </div>
      )}

      {page.type === 'content' && (
        <div className='flow-root' style={{ width: content.width }}>
          {page.blocks.map((block, blockIndex) => (
            <FlowBlockView
              key={blockIndex}
              block={block}
              author={book.author}
              width={content.width}
              audioLinks={audioLinks}
              photoSlots={photoSlots}
            />
          ))}
        </div>
      )}

      {page.type === 'colophon' && (
        <div className='book-ink flex h-full flex-col items-center justify-end gap-3 pb-6 text-center text-[10px] leading-[1.7] text-[#6b6156]'>
          <span aria-hidden='true' className='bg-earth mb-2 h-px w-8' />
          <p className='font-heading max-w-[250px] italic'>
            Este livro foi escrito por {book.author} em {book.year}, a partir das perguntas do Lá Vem História.
          </p>
          {book.contributors.length > 0 && (
            <p className='font-heading max-w-[250px] italic'>Com lembranças de {listNames(book.contributors)}.</p>
          )}
          <p className='mt-2 text-[7.5px] font-medium tracking-[0.22em] text-[#9a8f80] uppercase'>
            Composto em Fraunces
          </p>
        </div>
      )}

      {showFolio && (
        <span className='book-ink font-heading absolute bottom-7 text-[10px] text-[#9a8f80]' style={outer}>
          {index + 1}
        </span>
      )}
    </div>
  )
}

// Sombra do livro sobre a mesa; acompanha o formato das páginas, inclusive a capa sozinha
const BOOK_SHADOW = 'drop-shadow(0 22px 26px rgb(50 38 24 / 0.28))'

// Botões de vidro escuro do modo de leitura: legíveis sobre madeira, tecido ou noite
const glassButtonClassName =
  'pointer-events-auto flex cursor-pointer items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md transition-[background-color,opacity] hover:bg-black/50 disabled:pointer-events-none disabled:opacity-0'

// Duração da virada de página, também usada para o livro deslizar ao abrir e fechar
const FLIP_MS = 650

// Folga ao redor do livro: cabe a sombra e a folha que se levanta ao virar, sem cortes nem rolagem
const STAGE_PAD_X = 56
const STAGE_PAD_Y = 40
// No modo de leitura sobra espaço para as setas dos lados e o número da página embaixo
const IMMERSIVE_PAD_X = 112
const IMMERSIVE_PAD_Y = 84

type BookReaderProps = {
  book: Book
  // Modo de leitura em tela cheia: sem barra fixa, com setas e número da página que aparecem e somem
  immersive?: boolean
  controlsVisible?: boolean
  // Sombra do livro sobre a superfície escolhida
  shadow?: string
  // A folha começou a virar: hora do som de papel
  onFlipStart?: () => void
  // Na página do livro: abre o modo de leitura (pelo "Abrir o livro" da capa e pelo botão de tela cheia)
  onOpenImmersive?: () => void
}

const BookReader = ({
  book,
  immersive = false,
  controlsVisible = true,
  shadow = BOOK_SHADOW,
  onFlipStart,
  onOpenImmersive
}: BookReaderProps) => {
  const [narrow, setNarrow] = useState(false)
  // No celular, o livro ocupa quase a tela toda: as setas descem para o rodapé
  const padX = immersive ? (narrow ? 12 : IMMERSIVE_PAD_X) : STAGE_PAD_X
  const padY = immersive ? (narrow ? 72 : IMMERSIVE_PAD_Y) : STAGE_PAD_Y
  const flipStartRef = useRef(onFlipStart)

  flipStartRef.current = onFlipStart
  const measureRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ x: number; y: number; left: number; top: number; moved: boolean } | null>(null)
  const [layout, setLayout] = useState<ReturnType<typeof paginate> | null>(null)
  const [frame, setFrame] = useState({ width: 0, height: 0 })
  const [current, setCurrent] = useState(0)
  const [zoom, setZoom] = useState(1)
  // Enquanto a folha vira, os botões esperam: evita cliques acumulados fora de sincronia
  const [flipping, setFlipping] = useState(false)
  const hostRef = useRef<HTMLDivElement>(null)
  const flipRef = useRef<PageFlip | null>(null)
  const currentRef = useRef(0)
  // Livro maior que o quadro (com zoom): dá para arrastar a vista com o mouse
  const [hasOverflow, setHasOverflow] = useState(false)
  const [dragging, setDragging] = useState(false)

  // Telas estreitas usam o formato de bolso; a paginação muda junto com o formato
  const formatName = frame.width === 0 ? null : frame.width < 600 ? 'pocket' : 'book'
  const format = PAGE_FORMATS[formatName ?? 'book']
  const content = contentSize(format)

  // Pagina só depois das fontes carregarem e do tamanho da tela ser conhecido
  useEffect(() => {
    if (!formatName) return

    let active = true

    document.fonts.ready.then(() => {
      if (active && measureRef.current) setLayout(paginate(book, measureRef.current, PAGE_FORMATS[formatName]))
    })

    return () => {
      active = false
    }
  }, [book, formatName])

  useLayoutEffect(() => {
    const element = frameRef.current

    if (!element) return

    const measure = () => {
      setFrame({ width: element.clientWidth, height: element.clientHeight })
      setNarrow(element.clientWidth < 640)
      setHasOverflow(element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1)
    }
    const observer = new ResizeObserver(measure)

    // Mede já na montagem: o observador pode demorar a responder com a aba em segundo plano
    measure()
    observer.observe(element)
    if (stageRef.current) observer.observe(stageRef.current)

    return () => observer.disconnect()
  }, [])

  // Arrastar só começa depois de alguns pixels, para cliques no sumário e nas fotos continuarem valendo
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const element = frameRef.current

    if (!canPan || !element || event.pointerType !== 'mouse' || event.button !== 0) return

    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      left: element.scrollLeft,
      top: element.scrollTop,
      moved: false
    }
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    const element = frameRef.current

    if (!drag || !element) return

    const dx = event.clientX - drag.x
    const dy = event.clientY - drag.y

    if (!drag.moved && Math.hypot(dx, dy) < 4) return

    if (!drag.moved) {
      drag.moved = true
      element.setPointerCapture(event.pointerId)
      setDragging(true)
    }

    element.scrollLeft = drag.left - dx
    element.scrollTop = drag.top - dy
  }

  const handlePointerUp = () => {
    const element = frameRef.current

    // Depois de arrastar, o clique que o navegador dispara ao soltar não deve abrir nada
    if (dragRef.current?.moved && element) {
      element.addEventListener('click', event => event.stopPropagation(), { capture: true, once: true })
    }

    dragRef.current = null
    setDragging(false)
  }

  const pages = layout?.pages ?? []
  const isSpread = frame.width >= 820

  // Livro aberto: capa sozinha, depois páginas aos pares (esquerda ímpar, direita par)
  const lastIndex = pages.length - 1
  const spreads: number[][] = isSpread
    ? [
        [0],
        ...Array.from({ length: Math.max(0, (lastIndex - 1) / 2) }, (_, index) => [1 + index * 2, 2 + index * 2]),
        [lastIndex]
      ]
    : pages.map((_, index) => [index])

  const spreadIndex = Math.max(
    0,
    spreads.findIndex(spread => spread.includes(current))
  )
  const visible = spreads[spreadIndex] ?? []
  const isCover = visible.length === 1 && visible[0] === 0
  const isBack = visible.length === 1 && visible[0] === lastIndex && lastIndex > 0

  const pagesWide = isSpread ? 2 : 1
  const scale =
    Math.max(
      0,
      Math.min(
        MAX_SCALE,
        (frame.width - padX * 2) / (format.width * pagesWide),
        (frame.height - padY * 2) / format.height
      )
    ) * zoom

  const zoomIndex = ZOOM_STEPS.indexOf(zoom)
  // Só dá para arrastar com zoom: sem zoom o livro cabe inteiro e a folha virando nunca cria rolagem
  const canPan = zoom > 1 && hasOverflow
  const zoomIn = () => setZoom(ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, zoomIndex + 1)])
  const zoomOut = () => setZoom(ZOOM_STEPS[Math.max(0, zoomIndex - 1)])

  currentRef.current = current

  // A virada começa pelo canto de baixo: direito ao avançar, esquerdo ao voltar
  const goTo = useCallback((index: number) => {
    const flip = flipRef.current

    if (!flip) return
    setCurrent(index)
    flip.flip(index, 'bottom')
  }, [])
  const previous = () => {
    if (!flipRef.current || spreadIndex === 0) return
    setCurrent(spreads[spreadIndex - 1][0])
    flipRef.current.flipPrev('bottom')
  }
  const next = () => {
    if (!flipRef.current || spreadIndex >= spreads.length - 1) return
    setCurrent(spreads[spreadIndex + 1][0])
    flipRef.current.flipNext('bottom')
  }

  // Uma div por página, criada fora do React: a biblioteca de virada move essas divs pelo DOM,
  // e o conteúdo de cada página entra nelas por portal
  const pageElements = useMemo(() => (layout ? layout.pages.map(() => document.createElement('div')) : []), [layout])

  useEffect(() => {
    const host = hostRef.current

    if (!host || pageElements.length === 0) return

    const root = document.createElement('div')

    host.appendChild(root)
    // Capa e contracapa são duras; o miolo é papel e curva ao virar
    pageElements.forEach((element, index) => {
      element.dataset.density = index === 0 || index === pageElements.length - 1 ? 'hard' : 'soft'
    })

    const flip = new PageFlip(root, {
      width: format.width,
      height: format.height,
      size: 'fixed',
      autoSize: true,
      showCover: true,
      usePortrait: !isSpread,
      // No modo de leitura dá para pegar o canto da folha e arrastar, ou deslizar o dedo; links e botões
      // dentro das páginas continuam recebendo o clique
      useMouseEvents: immersive,
      clickEventForward: true,
      mobileScrollSupport: false,
      swipeDistance: 30,
      drawShadow: true,
      maxShadowOpacity: 0.35,
      flippingTime: FLIP_MS,
      startPage: currentRef.current
    })

    flip.loadFromHTML(pageElements)
    flip.on('flip', event => setCurrent(Number(event.data)))
    flip.on('changeState', event => {
      setFlipping(event.data !== 'read')
      if (event.data === 'flipping') flipStartRef.current?.()
    })
    flipRef.current = flip

    return () => {
      flipRef.current = null
      flip.destroy()
    }
  }, [pageElements, format, isSpread, immersive])

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest('input, textarea')) return
      if (event.key === 'ArrowRight') document.getElementById('livro-proxima')?.click()
      if (event.key === 'ArrowLeft') document.getElementById('livro-anterior')?.click()
      if (event.key === '+' || event.key === '=') document.getElementById('livro-zoom-mais')?.click()
      if (event.key === '-') document.getElementById('livro-zoom-menos')?.click()
    }

    window.addEventListener('keydown', handleKey)

    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const pageLabel = `${
    isCover
      ? 'Capa'
      : isBack
        ? 'Contracapa'
        : visible.length > 1
          ? `Páginas ${visible[0] + 1}–${visible[1] + 1}`
          : `Página ${(visible[0] ?? 0) + 1}`
  } de ${pages.length}`

  const bookWidth = format.width * pagesWide
  // Fechado, o livro aparece centralizado; ao abrir, desliza junto com a capa até o centro
  const closedShift = isSpread && isCover ? -format.width / 2 : isSpread && isBack ? format.width / 2 : 0

  return (
    // Sem fundo próprio: o livro fica aberto sobre o creme da página, como numa mesa
    <div className={cn('flex min-h-0 flex-1 flex-col', immersive ? 'relative' : 'px-2 pb-24 sm:px-8')}>
      {/* Área invisível onde os blocos são medidos, com a mesma tinta das páginas */}
      <div
        ref={measureRef}
        aria-hidden='true'
        className='book-type pointer-events-none invisible absolute top-0 left-0 flow-root'
        style={{ width: content.width, color: INK }}
      />

      {/* Altura fixa e rolagem própria: com zoom, o livro passa do quadro e dá para arrastar a vista */}
      <div
        ref={frameRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDragStart={event => canPan && event.preventDefault()}
        className={cn(
          'min-h-0 flex-1',
          zoom > 1 ? 'overflow-auto' : 'overflow-hidden',
          canPan && (dragging ? 'cursor-grabbing select-none' : 'cursor-grab')
        )}
      >
        <div
          ref={stageRef}
          className='flex min-h-full w-max min-w-full items-center justify-center'
          style={{ padding: `${padY}px ${padX}px` }}
        >
          {layout && scale > 0 && (
            <div
              style={{
                width: bookWidth * scale,
                height: format.height * scale,
                filter: shadow,
                transform: `translateX(${closedShift * scale}px)`,
                transition: `transform ${FLIP_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`
              }}
            >
              <div
                ref={hostRef}
                className='origin-top-left'
                style={{ width: bookWidth, height: format.height, transform: `scale(${scale})` }}
              />
            </div>
          )}
        </div>
      </div>

      {pageElements.map((element, index) =>
        createPortal(
          <>
            <PageView
              page={pages[index]}
              index={index}
              book={book}
              chapterPages={layout?.chapterPages ?? {}}
              format={format}
              onGoTo={goTo}
              single={!isSpread}
            />
            {/* Dobra do miolo: sombra junto à costura */}
            {isSpread && index > 0 && index < lastIndex && (
              <span
                aria-hidden='true'
                className='pointer-events-none absolute inset-y-0 w-[14%]'
                style={
                  index % 2 === 1
                    ? {
                        right: 0,
                        background:
                          'linear-gradient(to left, rgb(60 45 30 / 0.16), rgb(60 45 30 / 0.04) 40%, transparent)'
                      }
                    : {
                        left: 0,
                        background:
                          'linear-gradient(to right, rgb(60 45 30 / 0.2), rgb(60 45 30 / 0.05) 40%, transparent)'
                      }
                }
              />
            )}
          </>,
          element,
          `pagina-${index}`
        )
      )}

      {immersive && (
        // Setas grandes dos lados e o número da página embaixo, em vidro escuro para ler sobre qualquer fundo.
        // Somem junto com o resto quando o mouse para
        <div
          className={cn(
            'pointer-events-none absolute inset-0 transition-opacity duration-500',
            controlsVisible ? 'opacity-100' : 'opacity-0'
          )}
        >
          <button
            id='livro-anterior'
            type='button'
            onClick={previous}
            disabled={!layout || flipping || spreadIndex === 0}
            aria-label='Página anterior'
            className={cn(
              glassButtonClassName,
              'absolute bottom-4 left-4 size-12 sm:top-1/2 sm:bottom-auto sm:left-6 sm:size-14 sm:-translate-y-1/2'
            )}
          >
            <ChevronLeftIcon className='size-6' />
          </button>
          <button
            id='livro-proxima'
            type='button'
            onClick={next}
            disabled={!layout || flipping || spreadIndex >= spreads.length - 1}
            aria-label={isCover ? 'Abrir o livro' : 'Próxima página'}
            className={cn(
              glassButtonClassName,
              'absolute right-4 bottom-4 size-12 sm:top-1/2 sm:right-6 sm:bottom-auto sm:size-14 sm:-translate-y-1/2'
            )}
          >
            <ChevronRightIcon className='size-6' />
          </button>
          <span className='absolute bottom-7 left-1/2 -translate-x-1/2 rounded-full bg-black/35 px-4 py-2 text-xs font-medium text-white tabular-nums backdrop-blur-md'>
            {pageLabel}
          </span>
        </div>
      )}

      {/* Barra fixa no rodapé, como na tela de pergunta: navegação e zoom sempre no mesmo lugar */}
      {!immersive && (
        <nav
          aria-label='Páginas do livro'
          className='bg-background/90 border-foreground fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur'
        >
          <div className='mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6'>
            <Button
              id='livro-anterior'
              variant='outline'
              className='h-12 gap-2 px-5'
              onClick={previous}
              disabled={!layout || flipping || spreadIndex === 0}
            >
              <ArrowLeftIcon />
              <span className='max-sm:sr-only'>Anterior</span>
            </Button>

            <div className='flex flex-col items-center gap-1.5'>
              <div className='bg-sand flex items-center rounded-full p-1'>
                <button
                  id='livro-zoom-menos'
                  type='button'
                  onClick={zoomOut}
                  disabled={zoomIndex <= 0}
                  aria-label='Diminuir zoom'
                  className='hover:bg-stone flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent'
                >
                  <ZoomOutIcon className='size-4' />
                </button>
                <button
                  type='button'
                  onClick={() => setZoom(1)}
                  aria-label='Voltar ao tamanho da tela'
                  title='Voltar ao tamanho da tela'
                  className='w-14 cursor-pointer text-center text-xs font-medium tabular-nums'
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  id='livro-zoom-mais'
                  type='button'
                  onClick={zoomIn}
                  disabled={zoomIndex >= ZOOM_STEPS.length - 1}
                  aria-label='Aumentar zoom'
                  className='hover:bg-stone flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent'
                >
                  <ZoomInIcon className='size-4' />
                </button>
                {onOpenImmersive && (
                  <button
                    type='button'
                    onClick={onOpenImmersive}
                    aria-label='Ler em tela cheia'
                    title='Ler em tela cheia'
                    className='hover:bg-stone ml-1 flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors'
                  >
                    <ExpandIcon className='size-4' />
                  </button>
                )}
              </div>
              <span className='text-muted-foreground text-xs tabular-nums'>{pageLabel}</span>
            </div>

            <Button
              id='livro-proxima'
              variant='honey'
              className='h-12 gap-2 px-5'
              // Na capa, "Abrir o livro" leva ao modo de leitura quando ele existe
              onClick={isCover && onOpenImmersive ? onOpenImmersive : next}
              disabled={!layout || flipping || spreadIndex >= spreads.length - 1}
            >
              <span className='max-sm:sr-only'>{isCover ? 'Abrir o livro' : 'Próxima'}</span>
              <ArrowRightIcon />
            </Button>
          </div>
        </nav>
      )}
    </div>
  )
}

export default BookReader
