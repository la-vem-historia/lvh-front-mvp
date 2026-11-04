'use client'

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BookmarkIcon,
  ImagePlusIcon,
  MicIcon,
  SquareIcon,
  UserPlusIcon,
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

const toolClassName = 'h-10 gap-2 px-4 text-sm'

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

  // Links dos primeiros passos apontam para #ferramentas ou #convidar, que só existem depois de carregar
  useEffect(() => {
    if (!context || !window.location.hash) return

    const target = window.location.hash === '#convidar' ? 'colaboradores' : window.location.hash.slice(1)

    document.getElementById(target)?.scrollIntoView({ block: 'start' })
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
    <div className='mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 pt-10 pb-36 sm:px-6 lg:pt-16'>
      <div className='flex items-center justify-between text-sm'>
        <Link href='/app' className='text-muted-foreground hover:text-foreground flex items-center gap-2'>
          <ArrowLeftIcon className='size-4' />
          Capítulos
        </Link>
        <div className='flex items-center gap-4'>
          <span role='status' className='text-muted-foreground text-xs'>
            {statusLabel[status]}
          </span>
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

      <div className='flex flex-col gap-4'>
        <p className={eyebrowClassName}>
          {chapter.title}{' '}
          <span className='text-muted-foreground font-normal'>
            · {position + 1} de {chapter.questions.length}
          </span>
        </p>
        <h1 className={pageTitleClassName}>{question.text}</h1>
      </div>

      <div className='flex flex-col gap-4'>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={event => updateText(event.target.value)}
          aria-label='Sua resposta'
          placeholder='Escreva aqui, do seu jeito. Não precisa ser perfeito.'
          className='border-border placeholder:text-muted-foreground/70 h-64 w-full resize-none overflow-y-auto border-t bg-transparent pt-6 text-lg leading-relaxed outline-none'
        />

        <div id='ferramentas' className='flex scroll-mt-40 flex-wrap gap-2'>
          {dictation.supported && (
            <Button
              type='button'
              variant={dictation.listening ? 'default' : 'outline'}
              className={toolClassName}
              onClick={dictation.listening ? dictation.stop : dictation.start}
            >
              <MicIcon />
              {dictation.listening ? 'Parar ditado' : 'Ditar'}
            </Button>
          )}
          {recorder.supported && !audio && (
            <Button
              type='button'
              variant={recorder.recording ? 'default' : 'outline'}
              className={toolClassName}
              onClick={recorder.recording ? recorder.stop : recorder.start}
            >
              {recorder.recording ? <SquareIcon /> : <span className='bg-earth size-2.5 rounded-full' />}
              {recorder.recording
                ? `Parar gravação · ${formatSeconds(recorder.seconds)} / ${formatSeconds(recorder.maxSeconds)}`
                : 'Gravar sua voz'}
            </Button>
          )}
          {/* Sempre à vista: com a foto já adicionada, fica desativado e o balão explica como trocar */}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type='button'
                  variant='outline'
                  aria-disabled={photoFull}
                  className={cn(
                    toolClassName,
                    photoFull && 'cursor-not-allowed opacity-45 hover:translate-y-0 hover:shadow-none'
                  )}
                  onClick={() => !photoFull && fileInput.current?.click()}
                />
              }
            >
              <ImagePlusIcon />
              Adicionar foto
            </TooltipTrigger>
            <TooltipContent side='bottom' sideOffset={8} className='max-w-60 rounded-lg px-3 py-2 text-center text-sm'>
              {photoFull ? 'Esta resposta já tem uma foto. Para usar outra, remova a atual.' : 'Uma foto por resposta.'}
            </TooltipContent>
          </Tooltip>
          {/* Convite é ocasional: fica no fim da linha, afastado das ferramentas de escrita */}
          <Button
            type='button'
            variant='outline'
            className={cn(toolClassName, 'sm:ml-auto')}
            aria-expanded={inviting}
            onClick={toggleInvite}
          >
            <UserPlusIcon />
            Convidar para responder
          </Button>
          <input
            ref={fileInput}
            type='file'
            accept='image/*'
            onChange={addPhoto}
            className='hidden'
            aria-label='Escolher uma foto'
          />
        </div>

        {dictation.listening && (
          <p className='text-muted-foreground text-sm'>
            Ouvindo… fale naturalmente. O texto aparece no fim de cada frase.
          </p>
        )}
        {(recorder.error || error) && <p className='text-destructive text-sm'>{recorder.error ?? error}</p>}
      </div>

      {audio && (
        <div className='border-border flex flex-col gap-3 border-t pt-6'>
          <div className='flex items-center justify-between text-sm'>
            <span className='font-medium'>Sua voz · {formatSeconds(audio.seconds)}</span>
            <button
              type='button'
              onClick={removeAudio}
              className='text-muted-foreground cursor-pointer underline underline-offset-4'
            >
              Remover
            </button>
          </div>
          <audio controls src={audio.url} className='w-full' />
        </div>
      )}

      {photos.length > 0 && (
        // Miniaturas com a proporção original: nada de corte, a foto inteira aparece
        <div className='border-border flex flex-wrap items-start gap-4 border-t pt-6'>
          {photos.map((photo, index) => (
            <div key={photo.slice(-32)} className='flex w-full flex-col gap-3 sm:w-auto'>
              <div className='relative w-fit'>
                <button
                  type='button'
                  onClick={() => setOpenPhoto(photo)}
                  aria-label={`Ampliar a foto ${index + 1}`}
                  className='block cursor-zoom-in'
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo}
                    alt={captions[index] || `Foto ${index + 1} da resposta`}
                    className='h-56 w-auto max-w-full rounded-xl object-contain shadow-[0_2px_10px_rgb(60_45_30/0.15)] sm:h-64'
                  />
                </button>
                <button
                  type='button'
                  onClick={() => removePhoto(index)}
                  aria-label={`Remover foto ${index + 1}`}
                  className='bg-background/90 hover:bg-background absolute top-2 right-2 flex size-8 cursor-pointer items-center justify-center rounded-full'
                >
                  <XIcon className='size-4' />
                </button>
              </div>
              <label className='flex flex-col gap-1.5'>
                <span className='text-sm font-medium'>
                  Legenda <span className='text-muted-foreground font-normal'>(opcional)</span>
                </span>
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
                  placeholder='Ex.: O casamento dos meus pais, 1958'
                  className='border-input bg-background placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-ring/50 h-11 w-full rounded-full border px-4 text-sm outline-none focus-visible:ring-3 sm:w-80'
                />
              </label>
            </div>
          ))}
          <p className='text-muted-foreground w-full text-xs'>
            Uma foto por resposta. Para usar outra, remova esta no ×. Sem legenda, a foto entra no livro sem texto.
          </p>
        </div>
      )}

      {openPhoto && <Lightbox src={openPhoto} alt={question.text} onClose={closePhoto} />}

      <ColaboradoresPergunta
        questionId={questionId}
        questionText={question.text}
        inviting={inviting}
        onInvitingChange={setInviting}
      />

      {/* Barra fixa no rodapé: Anterior e Próxima ficam sempre no mesmo lugar, para passar várias
          perguntas em sequência sem mover o mouse */}
      <nav
        aria-label='Perguntas'
        className='bg-background/90 border-foreground fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur'
      >
        <div className='mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6'>
          {previous ? (
            <Button
              render={<Link href={`/app/pergunta/${previous.id}`} />}
              nativeButton={false}
              variant='outline'
              className='h-12 gap-2 px-5'
            >
              <ArrowLeftIcon />
              Anterior
              <span className='flex gap-1 pointer-coarse:hidden max-sm:hidden'>
                <Kbd>⇧</Kbd>
                <Kbd>{modifier}</Kbd>
                <Kbd>↵</Kbd>
              </span>
            </Button>
          ) : (
            <span />
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
