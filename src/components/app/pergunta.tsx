'use client'

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BookmarkIcon,
  ImageIcon,
  MicIcon,
  PauseIcon,
  PlayIcon,
  SquareIcon,
  XIcon
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import ColaboradoresPergunta from '@/components/app/colaboradores-pergunta'
import Lightbox from '@/components/app/lightbox'
import { eyebrowClassName, pageTitleClassName } from '@/components/app/page-heading'
import { useUser } from '@/components/app/session'
import { useDictation } from '@/components/app/use-dictation'
import { useRecorder } from '@/components/app/use-recorder'

import { getAnswer, getBookmarks, getQuestionContext, saveAnswer, setBookmark } from '@/lib/lvh/api'
import { formatSeconds, resizeImage } from '@/lib/lvh/media'
import type { AnswerChanges, AudioRecording, QuestionContext } from '@/lib/lvh/types'
import { cn } from '@/lib/utils'

// Uma foto por resposta: para trocar, a pessoa remove a atual
const MAX_PHOTOS = 1
const SAVE_DELAY = 700

type Status = 'idle' | 'saving' | 'saved' | 'error'

const statusLabel: Record<Status, string> = {
  idle: '',
  saving: 'Salvando…',
  saved: 'Salvo',
  error: 'Não foi possível salvar'
}

// Botão redondo só com ícone, com o nome num balão. Ligado (ditando, gravando, convidando) fica escuro
const ToolButton = ({
  label,
  pressed,
  disabled,
  onClick,
  className,
  children
}: {
  label: string
  pressed?: boolean
  disabled?: boolean
  onClick: () => void
  className?: string
  children: ReactNode
}) => (
  <Tooltip>
    <TooltipTrigger
      render={
        <button
          type='button'
          aria-label={label}
          aria-pressed={pressed}
          aria-disabled={disabled}
          onClick={() => !disabled && onClick()}
          className={cn(
            'flex size-11 cursor-pointer items-center justify-center rounded-full transition-colors [&_svg]:size-[1.375rem]',
            pressed ? 'bg-ink text-cream' : 'hover:bg-background',
            disabled && 'cursor-not-allowed opacity-40 hover:bg-transparent',
            className
          )}
        />
      }
    >
      {children}
    </TooltipTrigger>
    <TooltipContent side='bottom' sideOffset={8} className='max-w-60 rounded-lg px-3 py-2 text-center text-sm'>
      {label}
    </TooltipContent>
  </Tooltip>
)

const RemoveButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button
    type='button'
    onClick={onClick}
    aria-label={label}
    className='text-muted-foreground hover:bg-sand hover:text-foreground flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors'
  >
    <XIcon className='size-4' />
  </button>
)

// Recado de voz compacto, no lugar do player do navegador: tocar, ver o avanço e remover
const VoiceNote = ({ audio, onRemove }: { audio: AudioRecording; onRemove: () => void }) => {
  const player = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const progress = audio.seconds ? Math.min(current / audio.seconds, 1) : 0

  const toggle = () => {
    const element = player.current

    if (!element) return
    if (element.paused) element.play().catch(() => setPlaying(false))
    else element.pause()
  }

  return (
    <div className='bg-background flex h-14 min-w-0 flex-1 basis-64 items-center gap-3 rounded-full p-1.5 pr-2'>
      <audio
        ref={player}
        src={audio.url}
        preload='metadata'
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false)
          setCurrent(0)
        }}
        onTimeUpdate={event => setCurrent(event.currentTarget.currentTime)}
      />
      <button
        type='button'
        onClick={toggle}
        aria-label={playing ? 'Pausar a sua voz' : 'Ouvir a sua voz'}
        className='bg-honey text-ink flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-[#f0b43c]'
      >
        {playing ? <PauseIcon className='size-4 fill-current' /> : <PlayIcon className='ml-0.5 size-4 fill-current' />}
      </button>
      <div className='flex min-w-0 flex-1 flex-col gap-1.5'>
        <span className='text-sm font-medium'>Sua voz</span>
        <div className='bg-sand h-1 overflow-hidden rounded-full'>
          <div className='bg-ink h-full rounded-full' style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
      <span className='text-muted-foreground shrink-0 text-xs tabular-nums'>
        {playing || current ? `${formatSeconds(Math.floor(current))} / ` : ''}
        {formatSeconds(audio.seconds)}
      </span>
      <RemoveButton label='Remover a gravação' onClick={onRemove} />
    </div>
  )
}

// Ondas de som dentro de um quadrado: gravar a própria voz
const VoiceIcon = () => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={1.75}
    strokeLinecap='round'
    aria-hidden='true'
  >
    <rect x='3' y='3' width='18' height='18' rx='4' />
    <path d='M8 10.5v3M10.67 8.5v7M13.33 9.5v5M16 11v2' />
  </svg>
)

// Pessoa com um coração: chamar alguém da família para responder junto
const InviteIcon = () => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={1.75}
    strokeLinecap='round'
    strokeLinejoin='round'
    aria-hidden='true'
  >
    <circle cx='10' cy='8' r='4.5' />
    <path d='M3 21a7 7 0 0 1 10.5-6.06' />
    <path d='M18.5 21s-3.5-2.06-3.5-4.35a1.9 1.9 0 0 1 3.5-1.03 1.9 1.9 0 0 1 3.5 1.03c0 2.29-3.5 4.35-3.5 4.35z' />
  </svg>
)

// Coluna da tela de escrever: 858px de conteúdo, a mesma largura para a pergunta e para a barra de baixo
const columnClassName = 'mx-auto w-full max-w-[56.625rem] px-4 sm:px-6'

// Tecla do atalho no sistema de quem usa: ⌘ no Mac, Ctrl no resto
const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)

const Kbd = ({ children }: { children: string }) => (
  <kbd className='border-current/25 min-w-5 rounded-[5px] border px-1 font-sans text-[11px] leading-[18px] font-medium opacity-70'>
    {children}
  </kbd>
)

const Pergunta = ({ questionId }: { questionId: number }) => {
  const user = useUser()
  const [context, setContext] = useState<QuestionContext | null | undefined>(undefined)
  const [text, setText] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [captions, setCaptions] = useState<string[]>([])
  const captionTimer = useRef<number | undefined>(undefined)
  const [audio, setAudio] = useState<AudioRecording | undefined>()
  // #convidar (vindo dos primeiros passos) já abre o convite
  const [inviting, setInviting] = useState(() => typeof window !== 'undefined' && window.location.hash === '#convidar')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [openPhoto, setOpenPhoto] = useState<string | null>(null)
  const [bookmarked, setBookmarked] = useState(false)
  const [peopleCount, setPeopleCount] = useState(0)
  const closePhoto = useCallback(() => setOpenPhoto(null), [])
  const textRef = useRef('')
  const saveTimer = useRef<number | undefined>(undefined)
  const fileInput = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

  useEffect(() => {
    Promise.all([getQuestionContext(user, questionId), getAnswer(questionId), getBookmarks()]).then(
      ([nextContext, answer, bookmarks]) => {
        setContext(nextContext)
        setBookmarked(bookmarks.includes(questionId))
        textRef.current = answer?.text ?? ''
        setText(textRef.current)
        setPhotos(answer?.photos ?? [])
        setCaptions(answer?.photoCaptions ?? [])
        setAudio(answer?.audio)
      }
    )
  }, [user, questionId])

  const toggleBookmark = () => {
    setBookmarked(!bookmarked)
    setBookmark(questionId, !bookmarked)
  }

  // Links dos primeiros passos apontam para #ferramentas, que só existe depois de carregar.
  // #convidar não rola: ele já abre o modal de convite
  useEffect(() => {
    if (!context || !window.location.hash || window.location.hash === '#convidar') return

    document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ block: 'start' })
  }, [context])

  // Ao abrir a pergunta, o cursor já espera no fim da resposta: dá para escrever sem tocar no mouse.
  // No celular não, para o teclado não cobrir a pergunta assim que a tela abre
  useEffect(() => {
    const textarea = textareaRef.current

    if (!context || !textarea || window.location.hash || !window.matchMedia('(pointer: fine)').matches) return

    textarea.focus()
    textarea.setSelectionRange(textarea.value.length, textarea.value.length)
  }, [context])

  // ⌘/Ctrl + Enter vai para a próxima pergunta; com Shift, volta para a anterior.
  // Tab fica livre para o que sempre fez: andar pelos botões de ditar, gravar e adicionar foto
  useEffect(() => {
    if (!context) return

    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || !(event.metaKey || event.ctrlKey) || event.altKey) return
      // Legenda da foto e formulário de convite têm o próprio Enter
      if (event.target instanceof HTMLElement && event.target.closest('input, select, form')) return

      const target = event.shiftKey
        ? context.previous && `/app/pergunta/${context.previous.id}`
        : context.next
          ? `/app/pergunta/${context.next.id}`
          : '/app'

      if (!target) return
      event.preventDefault()
      router.push(target)
    }

    window.addEventListener('keydown', handleKey)

    return () => window.removeEventListener('keydown', handleKey)
  }, [context, router])

  // O mesmo botão abre e fecha o convite
  const toggleInvite = () => {
    if (inviting) return setInviting(false)

    // O próprio formulário rola até o botão de enviar quando termina de abrir
    setInviting(true)
  }

  const persist = (changes: AnswerChanges) => {
    setStatus('saving')
    setError(null)
    saveAnswer(questionId, changes)
      .then(() => setStatus('saved'))
      .catch((reason: Error) => {
        setStatus('error')
        setError(reason.message)
      })
  }

  // Texto salva sozinho depois de uma pausa na digitação
  const scheduleTextSave = (value: string) => {
    window.clearTimeout(saveTimer.current)
    setStatus('saving')
    saveTimer.current = window.setTimeout(() => {
      saveTimer.current = undefined
      persist({ text: value })
    }, SAVE_DELAY)
  }

  // Ao sair da tela com digitação pendente, salva na hora
  useEffect(
    () => () => {
      if (saveTimer.current === undefined) return
      window.clearTimeout(saveTimer.current)
      saveAnswer(questionId, { text: textRef.current }).catch(() => {})
    },
    [questionId]
  )

  const updateText = (value: string) => {
    textRef.current = value
    setText(value)
    scheduleTextSave(value)
  }

  const dictation = useDictation(spoken => {
    const current = textRef.current

    updateText(current ? `${current.replace(/\s*$/, '')} ${spoken}` : spoken)
  })

  const recorder = useRecorder(recording => {
    setAudio(recording)
    persist({ audio: recording })
  })

  const removeAudio = () => {
    setAudio(undefined)
    persist({ audio: undefined })
  }

  const addPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    event.target.value = ''
    if (!file || photos.length >= MAX_PHOTOS) return

    const next = [...photos, await resizeImage(file)]
    const nextCaptions = next.map((_, photoIndex) => captions[photoIndex] ?? '')

    setPhotos(next)
    setCaptions(nextCaptions)
    persist({ photos: next, photoCaptions: nextCaptions })
  }

  const removePhoto = (index: number) => {
    const next = photos.filter((_, photoIndex) => photoIndex !== index)
    const nextCaptions = captions.filter((_, photoIndex) => photoIndex !== index)

    setPhotos(next)
    setCaptions(nextCaptions)
    persist({ photos: next, photoCaptions: nextCaptions })
  }

  // Legenda opcional: salva sozinha depois de uma pausa, como o texto da resposta
  const updateCaption = (index: number, value: string) => {
    const next = photos.map((_, photoIndex) => (photoIndex === index ? value : (captions[photoIndex] ?? '')))

    setCaptions(next)
    window.clearTimeout(captionTimer.current)
    setStatus('saving')
    captionTimer.current = window.setTimeout(() => {
      captionTimer.current = undefined
      persist({ photoCaptions: next })
    }, SAVE_DELAY)
  }

  const photoFull = photos.length >= MAX_PHOTOS

  if (context === undefined) return null

  if (context === null) {
    return (
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-24 sm:px-6'>
        <h1 className={pageTitleClassName}>Pergunta não encontrada.</h1>
        <Button render={<Link href='/app' />} nativeButton={false} variant='honey' size='cta' className='w-fit'>
          Voltar aos capítulos
        </Button>
      </div>
    )
  }

  const { question, chapter, position, previous, next, nextChapter } = context
  const modifier = isMac() ? '⌘' : 'Ctrl'

  return (
    <div className={cn(columnClassName, 'flex flex-col')}>
      {/* A tela tem a altura da janela, menos o cabeçalho (5rem), e não rola: o cartão de resposta ocupa o que sobra
          e para com uma folga antes da barra Anterior/Próxima (80px). O texto rola dentro dele, e as outras lembranças
          ficam no modal de convite */}
      <div className='flex h-[calc(100svh-5rem)] min-h-[30rem] flex-col gap-6 pt-6 pb-[13.75rem] [@media(max-height:820px)]:gap-5 [@media(max-height:820px)]:pt-4 [@media(max-height:820px)]:pb-28 max-sm:pb-28'>
        <div className='flex items-center justify-between text-sm'>
          <Link href='/app' className='text-muted-foreground hover:text-foreground flex items-center gap-2'>
            <ArrowLeftIcon className='size-4' />
            Capítulos
          </Link>
          <span role='status' className='text-muted-foreground text-xs'>
            {statusLabel[status]}
          </span>
        </div>

        <div className='flex flex-col gap-2'>
          <p className={eyebrowClassName}>
            {chapter.title}{' '}
            <span className='text-muted-foreground font-normal'>
              · {position + 1} de {chapter.questions.length}
            </span>
          </p>
          {/* O título vai até perto do marcador e só quebra quando não cabe; o marcador fica no alto, na altura da primeira linha */}
          <div className='flex items-start justify-between gap-2'>
            <h1 className={cn(pageTitleClassName, 'text-wrap')}>{question.text}</h1>
            {/* Marcador de livro: separa a pergunta para voltar depois, com uma foto ou uma lembrança melhor */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type='button'
                    aria-pressed={bookmarked}
                    aria-label={bookmarked ? 'Desmarcar a pergunta' : 'Marcar para voltar depois'}
                    onClick={toggleBookmark}
                    className={cn(
                      'hover:bg-sand flex size-10 cursor-pointer items-center justify-center rounded-full transition-colors',
                      bookmarked ? 'text-poppy' : 'text-muted-foreground hover:text-foreground'
                    )}
                  />
                }
              >
                <BookmarkIcon className='size-5' fill={bookmarked ? 'currentColor' : 'none'} />
              </TooltipTrigger>
              <TooltipContent side='bottom' sideOffset={6} className='rounded-lg px-3 py-2 text-sm'>
                {bookmarked ? 'Marcada. Ela fica em Marcadas, no painel.' : 'Marcar para voltar depois'}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* A resposta fica num cartão: o texto ocupa quase tudo e as ferramentas moram no rodapé dele.
          Ditar fica sozinho à esquerda, porque escreve no próprio campo; voz, foto e convite ficam juntos à direita */}
        <div className='bg-paper border-border/70 focus-within:border-border flex min-h-0 flex-1 flex-col rounded-[2rem] border shadow-[0_28px_50px_-34px_rgb(60_45_30/0.35)] transition-colors'>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={event => updateText(event.target.value)}
            aria-label='Sua resposta'
            placeholder='Deixe fluir. Conte a sua história…'
            className='placeholder:text-muted-foreground/70 min-h-0 w-full flex-1 resize-none overflow-y-auto bg-transparent px-6 pt-6 text-lg leading-relaxed outline-none placeholder:italic sm:px-8 sm:pt-8 sm:text-xl'
          />

          {/* Anexos ficam dentro do cartão, logo acima das ferramentas: quem grava ou adiciona uma foto
              vê o resultado na hora, sem precisar rolar a página */}
          {(audio || photos.length > 0) && (
            <div className='flex flex-wrap gap-2 px-4 sm:px-5'>
              {audio && <VoiceNote audio={audio} onRemove={removeAudio} />}
              {photos.map((photo, index) => (
                <div
                  key={photo.slice(-32)}
                  className='bg-background flex h-14 min-w-0 flex-1 basis-64 items-center gap-3 rounded-full p-1.5 pr-2'
                >
                  <button
                    type='button'
                    onClick={() => setOpenPhoto(photo)}
                    aria-label={`Ampliar a foto ${index + 1}`}
                    className='shrink-0 cursor-zoom-in'
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo}
                      alt={captions[index] || `Foto ${index + 1} da resposta`}
                      className='size-11 rounded-full object-cover'
                    />
                  </button>
                  <input
                    value={captions[index] ?? ''}
                    onChange={event => updateCaption(index, event.target.value)}
                    // Enter confirma: sai do campo, e o onBlur salva na hora
                    onKeyDown={event => {
                      if (event.key !== 'Enter') return
                      event.preventDefault()
                      event.currentTarget.blur()
                    }}
                    onBlur={() => {
                      // Ao sair do campo, salva na hora para não perder a legenda ao trocar de página
                      if (captionTimer.current === undefined) return
                      window.clearTimeout(captionTimer.current)
                      captionTimer.current = undefined
                      persist({ photoCaptions: captions })
                    }}
                    maxLength={90}
                    aria-label='Legenda da foto (opcional)'
                    placeholder='Legenda da foto (opcional)'
                    className='placeholder:text-muted-foreground/70 min-w-0 flex-1 bg-transparent text-sm outline-none'
                  />
                  <RemoveButton label={`Remover foto ${index + 1}`} onClick={() => removePhoto(index)} />
                </div>
              ))}
            </div>
          )}

          {(recorder.error || error) && (
            <p className='text-destructive px-6 pt-3 text-sm sm:px-8'>{recorder.error ?? error}</p>
          )}

          <div id='ferramentas' className='flex scroll-mt-40 items-center justify-between gap-3 p-4 sm:p-5'>
            {dictation.supported ? (
              <div className='flex min-w-0 items-center gap-3'>
                <ToolButton
                  label={dictation.listening ? 'Parar ditado' : 'Ditar: fale e o texto aparece'}
                  pressed={dictation.listening}
                  onClick={dictation.listening ? dictation.stop : dictation.start}
                  className={cn(!dictation.listening && 'bg-sand hover:bg-stone/60')}
                >
                  <MicIcon />
                </ToolButton>
                {dictation.listening && (
                  <span role='status' className='text-muted-foreground truncate text-sm'>
                    Ouvindo… o texto aparece no fim de cada frase.
                  </span>
                )}
              </div>
            ) : (
              <span />
            )}

            <div className='bg-sand flex items-center gap-1 rounded-full p-1'>
              {recorder.supported && !audio && (
                <ToolButton
                  label={recorder.recording ? 'Parar gravação' : 'Gravar sua voz'}
                  pressed={recorder.recording}
                  onClick={recorder.recording ? recorder.stop : recorder.start}
                  className={cn(recorder.recording && 'w-auto gap-2 px-4')}
                >
                  {recorder.recording ? (
                    <>
                      <SquareIcon className='fill-current' />
                      <span className='text-sm tabular-nums'>
                        {formatSeconds(recorder.seconds)} / {formatSeconds(recorder.maxSeconds)}
                      </span>
                    </>
                  ) : (
                    <VoiceIcon />
                  )}
                </ToolButton>
              )}
              {/* Com a foto já adicionada, fica desativado e o balão explica como trocar */}
              <ToolButton
                label={photoFull ? 'Esta resposta já tem uma foto. Para usar outra, remova a atual.' : 'Adicionar foto'}
                disabled={photoFull}
                onClick={() => fileInput.current?.click()}
              >
                <ImageIcon />
              </ToolButton>
              {/* Com convidados, o número aparece no botão: as respostas deles ficam no modal */}
              <ToolButton
                label={peopleCount ? `Outras lembranças (${peopleCount})` : 'Convidar alguém para responder'}
                pressed={inviting}
                onClick={toggleInvite}
                className='relative'
              >
                <InviteIcon />
                {peopleCount > 0 && (
                  <span className='bg-moss text-cream absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full text-[0.625rem] font-semibold tabular-nums'>
                    {peopleCount}
                  </span>
                )}
              </ToolButton>
            </div>
            <input
              ref={fileInput}
              type='file'
              accept='image/*'
              onChange={addPhoto}
              className='hidden'
              aria-label='Escolher uma foto'
            />
          </div>
        </div>
      </div>

      {openPhoto && <Lightbox src={openPhoto} alt={question.text} onClose={closePhoto} />}

      <ColaboradoresPergunta
        questionId={questionId}
        questionText={question.text}
        inviting={inviting}
        onInvitingChange={setInviting}
        onPeopleChange={setPeopleCount}
      />

      {/* Barra fixa no rodapé: Anterior e Próxima ficam sempre no mesmo lugar, para passar várias
          perguntas em sequência sem mover o mouse */}
      <nav aria-label='Perguntas' className='bg-background/90 fixed inset-x-0 bottom-0 z-40 backdrop-blur'>
        {/* Os dois botões juntos no centro, a 24px um do outro */}
        <div className={cn(columnClassName, 'flex items-center justify-center gap-6 py-4')}>
          {previous && (
            <Button
              render={<Link href={`/app/pergunta/${previous.id}`} />}
              nativeButton={false}
              variant='ghost'
              className='hover:bg-sand h-12 gap-2 px-4'
            >
              <ArrowLeftIcon />
              Anterior
              <span className='flex gap-1 pointer-coarse:hidden max-sm:hidden'>
                <Kbd>⇧</Kbd>
                <Kbd>{modifier}</Kbd>
                <Kbd>↵</Kbd>
              </span>
            </Button>
          )}
          {next ? (
            <Button
              render={<Link href={`/app/pergunta/${next.id}`} />}
              nativeButton={false}
              variant='honey'
              className='h-12 gap-2 px-5'
            >
              <span className='flex gap-1 pointer-coarse:hidden max-sm:hidden'>
                <Kbd>{modifier}</Kbd>
                <Kbd>↵</Kbd>
              </span>
              {nextChapter ? `Próximo capítulo: ${nextChapter.title}` : 'Próxima'}
              <ArrowRightIcon />
            </Button>
          ) : (
            <Button render={<Link href='/app' />} nativeButton={false} variant='honey' className='h-12 px-5'>
              Voltar aos capítulos
            </Button>
          )}
        </div>
      </nav>
    </div>
  )
}

export default Pergunta
