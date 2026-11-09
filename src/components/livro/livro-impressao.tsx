'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import Link from 'next/link'
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, FileIcon, LayoutGridIcon, XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { eyebrowClassName, pageTitleClassName } from '@/components/app/page-heading'
import { useUser } from '@/components/app/session'
import { INK, PageView } from '@/components/livro/book-reader'
import { PAGE_FORMATS, contentSize, paginate, type Page } from '@/components/livro/paginate'

import { getAudioLinks, getBook } from '@/lib/lvh/api'
import { PAPER } from '@/lib/lvh/paper'
import type { Book } from '@/lib/lvh/types'
import { cn } from '@/lib/utils'

const FORMAT = PAGE_FORMATS.print
// Na impressão, a página lógica (440px) ocupa os 148 mm da folha A5
const PRINT_ZOOM = (148 / 25.4) * (96 / FORMAT.width)

// Na tela, as mesmas páginas de dois jeitos: uma fileira de páginas grandes, rolando de lado, ou uma grade
// de miniaturas, seis por linha. Clicar em qualquer uma abre a página ampliada
const VIEWS = [
  { value: 'paginas', label: 'Páginas', Icon: FileIcon },
  { value: 'miniaturas', label: 'Miniaturas', Icon: LayoutGridIcon }
] as const

const PAGES_ZOOM = 0.8

type View = (typeof VIEWS)[number]['value']

const PAPERS = [
  { value: 'creme', label: 'Papel creme', hint: 'Para ler na tela, com a cor do livro.', color: PAPER },
  {
    value: 'branco',
    label: 'Papel branco',
    hint: 'Para levar à gráfica, que imprime sobre o próprio papel.',
    color: '#fff'
  }
] as const

type Paper = (typeof PAPERS)[number]['value']

const PHOTO_MODES = [
  {
    value: 'impressas',
    label: 'Imprimir as fotos',
    short: 'fotos impressas',
    hint: 'Elas saem no papel, junto com o texto. É só imprimir e encadernar.'
  },
  {
    value: 'colar',
    label: 'Deixar espaço para colar',
    short: 'espaço para colar as fotos',
    hint: 'No lugar de cada foto, um quadro tracejado do mesmo tamanho, com a legenda. Depois é só colar as fotos de papel, como num álbum de família.'
  }
] as const

type PhotoMode = (typeof PHOTO_MODES)[number]['value']

// Arquivo da gráfica: o servidor abre esta página com ?grafica=frente ou ?grafica=fundo e imprime o livro
// duas vezes. A frente traz só texto e fotos, em vetor; o fundo traz o resto (fios, sombras, QR codes),
// que o motor da gráfica achata em imagem. Quem usa o site nunca vê este modo
type CamadaGrafica = 'frente' | 'fundo'

const lerCamadaGrafica = (): CamadaGrafica | null => {
  const camada = new URLSearchParams(window.location.search).get('grafica')

  return camada === 'frente' || camada === 'fundo' ? camada : null
}

const semAssinatura = () => () => {}

// No miolo impresso, capa, guarda e contracapa não entram: vão para o arquivo da capa. Capa e guarda viram
// páginas em branco, para cada página continuar do mesmo lado (par ou ímpar) e com o mesmo número
const paginasDaGrafica = (pages: Page[]): Page[] =>
  pages
    .filter(page => page.type !== 'back')
    .map(page => (page.type === 'cover' || page.type === 'endpaper' ? { type: 'blank' } : page))

// Linhas cinza fazendo as vezes de texto na miniatura
const TextLines = ({ count }: { count: number }) => (
  <span aria-hidden='true' className='flex flex-col gap-[3px]'>
    {Array.from({ length: count }, (_, index) => (
      <span key={index} className={cn('h-[2px] rounded-full bg-[#cbbfa9]', index === count - 1 ? 'w-2/3' : 'w-full')} />
    ))}
  </span>
)

// Miniatura de uma página com a foto da própria pessoa: impressa ou no quadro tracejado
const PageExample = ({ photo, mode }: { photo: string; mode: PhotoMode }) => (
  <span
    aria-hidden='true'
    className='flex h-[124px] w-[88px] shrink-0 flex-col gap-2 rounded-[2px] px-2.5 py-3 shadow-[0_2px_8px_rgb(50_38_24/0.18)]'
    style={{ backgroundColor: PAPER }}
  >
    <span className='h-[3px] w-3/4 rounded-full bg-[#8a7f72]' />
    <TextLines count={3} />
    <span className='flex flex-1 items-center justify-center'>
      {mode === 'impressas' ? (
        <span className='-rotate-2 bg-[#fdfbf6] p-[3px] shadow-[0_1px_3px_rgb(60_45_30/0.25)]'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt='' className='h-9 w-12 object-cover' />
        </span>
      ) : (
        // A foto de papel chegando ao quadro, ainda torta, como na hora de colar
        <span className='relative flex h-[42px] w-[54px] items-center justify-center border border-dashed border-[#a99a82]'>
          <span className='absolute top-[-9px] left-[14px] rotate-[8deg] bg-[#fdfbf6] p-[2px] shadow-[0_4px_8px_rgb(60_45_30/0.3)]'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt='' className='h-8 w-11 object-cover' />
          </span>
        </span>
      )}
    </span>
    <TextLines count={2} />
  </span>
)

const optionClassName = (selected: boolean) =>
  cn(
    'flex w-full cursor-pointer items-center gap-5 rounded-2xl border p-4 text-left transition-colors',
    selected ? 'border-moss bg-moss text-cream' : 'border-border hover:border-foreground/40'
  )

const hintClassName = (selected: boolean) =>
  cn('text-xs text-pretty', selected ? 'text-cream/80' : 'text-muted-foreground')

// Página ampliada sobre a tela, como a foto no painel de perguntas. Setas (ou ← e →) folheiam o livro
const PageZoom = ({
  index,
  count,
  renderPage,
  onChange,
  onClose
}: {
  index: number
  count: number
  renderPage: (index: number, zoom: number) => ReactNode
  onChange: (index: number) => void
  onClose: () => void
}) => {
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    // A página inteira cabe na tela, com espaço para as setas e o contador
    const fit = () =>
      setZoom(Math.min((window.innerHeight - 112) / FORMAT.height, (window.innerWidth - 144) / FORMAT.width, 1.6))
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft' && index > 0) onChange(index - 1)
      if (event.key === 'ArrowRight' && index < count - 1) onChange(index + 1)
    }
    const overflow = document.body.style.overflow

    fit()
    document.body.style.overflow = 'hidden'
    window.addEventListener('resize', fit)
    window.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('resize', fit)
      window.removeEventListener('keydown', handleKey)
    }
  }, [index, count, onChange, onClose])

  const arrowClassName =
    'absolute top-1/2 flex size-12 -translate-y-1/2 cursor-pointer items-center justify-center text-white/80 transition-colors hover:text-white disabled:pointer-events-none disabled:opacity-30'

  return createPortal(
    <div
      role='dialog'
      aria-modal='true'
      aria-label={`Página ${index + 1} de ${count}`}
      onClick={onClose}
      className='animate-in fade-in-0 fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-black/70 backdrop-blur-sm duration-200 print:hidden'
    >
      <div onClick={event => event.stopPropagation()} className='animate-in zoom-in-95 shadow-2xl duration-200'>
        {renderPage(index, zoom)}
      </div>
      <span className='text-sm text-white/80 tabular-nums'>
        {index + 1} de {count}
      </span>
      <button
        type='button'
        aria-label='Página anterior'
        disabled={index === 0}
        onClick={event => {
          event.stopPropagation()
          onChange(index - 1)
        }}
        className={cn(arrowClassName, 'left-2 sm:left-6')}
      >
        <ChevronLeftIcon className='size-8' strokeWidth={1.5} />
      </button>
      <button
        type='button'
        aria-label='Próxima página'
        disabled={index === count - 1}
        onClick={event => {
          event.stopPropagation()
          onChange(index + 1)
        }}
        className={cn(arrowClassName, 'right-2 sm:right-6')}
      >
        <ChevronRightIcon className='size-8' strokeWidth={1.5} />
      </button>
      <button
        type='button'
        onClick={onClose}
        aria-label='Fechar página'
        className='absolute top-4 right-4 flex size-10 cursor-pointer items-center justify-center text-white/80 transition-colors hover:text-white'
      >
        <XIcon className='size-6' strokeWidth={1.5} />
      </button>
    </div>,
    document.body
  )
}

// O livro inteiro, página por página, pronto para "Salvar como PDF" na janela de impressão do navegador
const LivroImpressao = () => {
  const user = useUser()
  const measureRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [book, setBook] = useState<Book | null>(null)
  const [audioLinks, setAudioLinks] = useState<Record<number, string>>({})
  const [layout, setLayout] = useState<ReturnType<typeof paginate> | null>(null)
  const [paper, setPaper] = useState<Paper>('creme')
  const [photoMode, setPhotoMode] = useState<PhotoMode>('impressas')
  const [view, setView] = useState<View>('paginas')
  const [optionsOpen, setOptionsOpen] = useState(false)
  // Página ampliada na tela (null: nenhuma) e largura de uma coluna da grade, para encaixar as miniaturas
  const [zoomed, setZoomed] = useState<number | null>(null)
  const [cellWidth, setCellWidth] = useState(0)
  const closeZoom = useCallback(() => setZoomed(null), [])
  const grafica = useSyncExternalStore(semAssinatura, lerCamadaGrafica, () => null)

  // O CSS de impressão de cada camada depende deste atributo (globals.css)
  useEffect(() => {
    if (!grafica) return

    document.documentElement.dataset.grafica = grafica

    return () => {
      delete document.documentElement.dataset.grafica
    }
  }, [grafica])

  useEffect(() => {
    getBook(user).then(async next => {
      const withAudio = next.chapters.flatMap(chapter =>
        chapter.entries.filter(entry => entry.answer?.audio).map(entry => entry.question.id)
      )

      setAudioLinks(await getAudioLinks(withAudio))
      setBook(next)
    })
  }, [user])

  useEffect(() => {
    if (!book) return

    let active = true

    document.fonts.ready.then(() => {
      if (active && measureRef.current) setLayout(paginate(book, measureRef.current, FORMAT))
    })

    return () => {
      active = false
    }
  }, [book])

  // Na grade, cada miniatura ocupa a coluna inteira: mede a coluna e encolhe a página na mesma proporção
  useEffect(() => {
    const grid = scrollerRef.current

    if (view !== 'miniaturas' || !grid) return

    const measure = () => setCellWidth((grid.firstElementChild as HTMLElement | null)?.clientWidth ?? 0)
    const observer = new ResizeObserver(measure)

    measure()
    observer.observe(grid)

    return () => observer.disconnect()
  }, [view, layout])

  // Setas para quem usa mouse comum, que não rola de lado
  const scrollBy = (direction: 1 | -1) => {
    const scroller = scrollerRef.current

    scroller?.scrollBy({ left: direction * scroller.clientWidth * 0.8, behavior: 'smooth' })
  }

  // O nome do arquivo sugerido pelo navegador vem do título da página: troca só enquanto a janela de impressão está aberta.
  // O painel fecha antes, para não sair no PDF
  const savePdf = () => {
    setOptionsOpen(false)
    window.setTimeout(() => {
      const previous = document.title

      if (book) document.title = `${book.author}, a minha história`
      window.print()
      document.title = previous
    }, 300)
  }

  const origin = typeof window === 'undefined' ? '' : window.location.origin
  const links = Object.fromEntries(Object.entries(audioLinks).map(([id, token]) => [id, `${origin}/ouvir/${token}`]))
  const audioCount = Object.keys(audioLinks).length
  const photos = book?.chapters.flatMap(chapter => chapter.entries.flatMap(entry => entry.answer?.photos ?? [])) ?? []
  const zoom = view === 'paginas' ? PAGES_ZOOM : cellWidth / FORMAT.width || 0.3
  // Para a gráfica, sempre papel branco (o creme vem do próprio papel) e fotos impressas
  const paperOption = PAPERS.find(option => option.value === (grafica ? 'branco' : paper)) ?? PAPERS[0]
  const photoOption = PHOTO_MODES.find(option => option.value === (grafica ? 'impressas' : photoMode)) ?? PHOTO_MODES[0]
  const pages = layout ? (grafica ? paginasDaGrafica(layout.pages) : layout.pages) : []

  // A mesma página serve à fileira, à grade, à ampliação e ao PDF; só o tamanho na tela muda.
  // Ampliada, ela não leva a classe do PDF, para não sair duas vezes na impressão
  const renderPage = (index: number, screenZoom: number, zoomedIn = false) =>
    book &&
    layout && (
      <div
        className={cn(
          'relative shrink-0 overflow-hidden [&>*]:rounded-none!',
          zoomedIn
            ? '[zoom:var(--screen-zoom)]'
            : 'livro-folha shadow-[0_8px_24px_rgb(50_38_24/0.18)] print:shadow-none'
        )}
        style={
          {
            width: FORMAT.width,
            height: FORMAT.height,
            '--print-zoom': PRINT_ZOOM,
            '--screen-zoom': screenZoom
          } as CSSProperties
        }
      >
        <PageView
          page={pages[index]}
          index={index}
          book={book}
          chapterPages={layout.chapterPages}
          format={FORMAT}
          onGoTo={zoomedIn ? setZoomed : undefined}
          single
          audioLinks={links}
          paperColor={paperOption.color}
          photoSlots={photoOption.value === 'colar'}
        />
      </div>
    )

  return (
    <div className='flex flex-col'>
      <div
        ref={measureRef}
        aria-hidden='true'
        className='book-type pointer-events-none invisible absolute top-0 left-0 flow-root'
        style={{ width: contentSize(FORMAT).width, color: INK }}
      />

      <div className='mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pt-8 sm:px-6 lg:px-16 print:hidden'>
        <Link
          href='/app/livro'
          className='text-muted-foreground hover:text-foreground flex w-fit items-center gap-2 text-sm transition-colors'
        >
          <ArrowLeftIcon className='size-4' />
          Voltar ao livro
        </Link>

        <div className='flex flex-wrap items-end justify-between gap-8'>
          <div className='flex max-w-xl flex-col gap-3'>
            <p className={eyebrowClassName}>Baixar o livro</p>
            <h1 className={pageTitleClassName}>Um PDF para guardar, imprimir e passar adiante.</h1>
            <p className='text-muted-foreground text-base text-pretty'>
              Em formato A5, o tamanho de um livro de verdade.{' '}
              {audioCount > 0
                ? `${audioCount === 1 ? 'A resposta gravada ganha' : `As ${audioCount} respostas gravadas ganham`} um QR code: quem ler o livro impresso aponta o celular e ouve a sua voz.`
                : 'Quando você gravar uma resposta, ela ganha um QR code para ser ouvida a partir do papel.'}
            </p>
          </div>

          <Button type='button' variant='honey' size='cta' disabled={!layout} onClick={() => setOptionsOpen(true)}>
            Salvar em PDF
          </Button>
        </div>

        {/* Barra do visualizador: as escolhas de impressão resumidas e a troca entre páginas e miniaturas */}
        <div className='border-foreground flex flex-wrap items-center justify-between gap-4 border-t pt-4'>
          <p className='text-muted-foreground text-sm'>
            {layout ? `${layout.pages.length} páginas` : 'Montando as páginas…'}
            {' · '}
            {paperOption.label.toLowerCase()}
            {photos.length > 0 && `, ${photoOption.short}`}
            {' · '}
            <button
              type='button'
              onClick={() => setOptionsOpen(true)}
              className='text-foreground cursor-pointer underline underline-offset-4'
            >
              Alterar
            </button>
          </p>

          <div className='flex items-center gap-3'>
            <div role='radiogroup' aria-label='Visualização' className='bg-sand flex rounded-full p-1'>
              {VIEWS.map(({ value, label, Icon }) => (
                <Tooltip key={value}>
                  <TooltipTrigger
                    render={
                      <button
                        type='button'
                        role='radio'
                        aria-checked={view === value}
                        aria-label={label}
                        onClick={() => setView(value)}
                        className={cn(
                          'flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors',
                          view === value
                            ? 'bg-background text-foreground shadow-button-soft'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      />
                    }
                  >
                    <Icon className='size-4' />
                  </TooltipTrigger>
                  <TooltipContent side='bottom' sideOffset={6} className='rounded-lg px-3 py-2 text-sm'>
                    {label}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Na tela, uma fileira que rola de lado ou uma grade de seis por linha; na impressão, uma página por folha A5 */}
      {book && layout && (
        <div
          ref={scrollerRef}
          tabIndex={view === 'paginas' ? 0 : undefined}
          aria-label='Páginas do livro'
          className={cn(
            'pt-6 outline-none print:block print:max-w-none print:overflow-visible print:p-0',
            view === 'paginas'
              ? 'flex snap-x snap-mandatory items-start gap-8 overflow-x-auto pb-6 max-sm:pb-16 scroll-px-4 px-4 sm:scroll-px-6 sm:px-6 lg:scroll-px-[max(4rem,calc((100vw-80rem)/2+4rem))] lg:px-[max(4rem,calc((100vw-80rem)/2+4rem))]'
              : 'mx-auto grid w-full max-w-7xl pb-16 grid-cols-3 gap-x-6 gap-y-8 px-4 sm:grid-cols-4 sm:px-6 lg:grid-cols-6 lg:px-16'
          )}
        >
          {pages.map((page, index) => (
            // Um botão por cima da página inteira abre a página ampliada. A página fica inerte:
            // os links do sumário e os botões das fotos não roubam o clique nem o foco
            <div
              key={index}
              data-page={index}
              className='group relative flex shrink-0 snap-start flex-col items-center gap-2 print:block'
            >
              <div inert className='transition-transform group-hover:-translate-y-1 print:transform-none'>
                {renderPage(index, zoom)}
              </div>
              {view === 'miniaturas' && (
                <span className='text-muted-foreground text-xs tabular-nums print:hidden'>{index + 1}</span>
              )}
              <button
                type='button'
                onClick={() => setZoomed(index)}
                aria-label={`Ampliar a página ${index + 1}`}
                className='absolute inset-0 cursor-zoom-in print:hidden'
              />
            </div>
          ))}
        </div>
      )}

      {/* Setas centralizadas embaixo da fileira, só nela: a grade não rola de lado */}
      {view === 'paginas' && layout && (
        <div className='flex justify-center gap-2 pb-16 max-sm:hidden print:hidden'>
          <Button
            type='button'
            variant='outline'
            size='icon'
            className='size-10'
            aria-label='Voltar'
            onClick={() => scrollBy(-1)}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            type='button'
            variant='outline'
            size='icon'
            className='size-10'
            aria-label='Avançar'
            onClick={() => scrollBy(1)}
          >
            <ChevronRightIcon />
          </Button>
        </div>
      )}

      {zoomed !== null && layout && (
        <PageZoom
          index={zoomed}
          count={layout.pages.length}
          renderPage={(index, pageZoom) => renderPage(index, pageZoom, true)}
          onChange={setZoomed}
          onClose={closeZoom}
        />
      )}

      <Sheet open={optionsOpen} onOpenChange={setOptionsOpen}>
        {/* Fundo sem desfoque: as páginas atrás continuam nítidas e mostram cada escolha */}
        <SheetContent
          overlayClassName='bg-black/5 supports-backdrop-filter:backdrop-blur-none print:hidden'
          className='bg-background w-full gap-0 overflow-y-auto sm:max-w-md print:hidden'
        >
          <SheetHeader className='gap-3 p-6 pt-10'>
            <SheetTitle className='font-heading text-display font-normal'>Antes de salvar</SheetTitle>
            <SheetDescription className='text-base'>
              Escolha como o livro sai no papel. As páginas ao lado mudam enquanto você escolhe.
            </SheetDescription>
          </SheetHeader>

          <section className='border-border flex flex-col gap-4 border-t p-6'>
            <h3 className='text-sm font-medium'>Papel</h3>
            <div role='radiogroup' aria-label='Papel' className='flex flex-col gap-3'>
              {PAPERS.map(option => (
                <button
                  key={option.value}
                  type='button'
                  role='radio'
                  aria-checked={paper === option.value}
                  onClick={() => setPaper(option.value)}
                  className={optionClassName(paper === option.value)}
                >
                  <span
                    aria-hidden='true'
                    className='border-border size-8 shrink-0 rounded-full border'
                    style={{ backgroundColor: option.color }}
                  />
                  <span className='flex flex-col gap-1'>
                    <span className='text-sm font-medium'>{option.label}</span>
                    <span className={hintClassName(paper === option.value)}>{option.hint}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Só aparece quando o livro tem fotos; o exemplo usa uma foto da própria pessoa */}
          {photos.length > 0 && (
            <section className='border-border flex flex-col gap-4 border-t p-6'>
              <div className='flex flex-col gap-1'>
                <h3 className='text-sm font-medium'>Fotos</h3>
                <p className='text-muted-foreground text-sm text-pretty'>
                  {photos.length === 1 ? 'O seu livro tem 1 foto.' : `O seu livro tem ${photos.length} fotos.`} Elas
                  podem sair impressas ou dar lugar às fotos originais, coladas à mão.
                </p>
              </div>
              <div role='radiogroup' aria-label='Fotos' className='flex flex-col gap-3'>
                {PHOTO_MODES.map(option => (
                  <button
                    key={option.value}
                    type='button'
                    role='radio'
                    aria-checked={photoMode === option.value}
                    onClick={() => setPhotoMode(option.value)}
                    className={optionClassName(photoMode === option.value)}
                  >
                    <PageExample photo={photos[0]} mode={option.value} />
                    <span className='flex flex-col gap-1'>
                      <span className='text-sm font-medium'>{option.label}</span>
                      <span className={hintClassName(photoMode === option.value)}>{option.hint}</span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          <div className='bg-background border-border sticky bottom-0 mt-auto flex flex-col gap-3 border-t p-6'>
            <Button type='button' variant='honey' size='cta' className='w-full' onClick={savePdf}>
              Salvar em PDF
            </Button>
            <p className='text-muted-foreground text-center text-xs text-pretty'>
              Na janela que abrir, escolha “Salvar como PDF” no destino.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default LivroImpressao
