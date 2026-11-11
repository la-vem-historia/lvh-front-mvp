'use client'

import { useCallback, useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { CircleArrowDownIcon, InfoIcon, PaletteIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { eyebrowClassName, pageTitleClassName } from '@/components/app/page-heading'
import { useUser } from '@/components/app/session'
import BookReader from '@/components/livro/book-reader'
import ComoLerEpub from '@/components/livro/como-ler-epub'
import Compartilhar from '@/components/livro/compartilhar'
import LeituraImersiva from '@/components/livro/leitura-imersiva'
import LivroImpresso from '@/components/livro/livro-impresso'
import Personalizar from '@/components/livro/personalizar'

import { getAudioLinks, getBook, getChapters } from '@/lib/lvh/api'
import type { Book, UserBook } from '@/lib/lvh/types'

// Um botão só para baixar: o PDF para imprimir, o EPUB para leitores digitais ou a pasta do livro
// (página que abre sem internet, fotos e áudios com os códigos impressos no livro)
const Baixar = ({ book }: { book: Book }) => {
  const user = useUser()
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  // Passo a passo para mandar o EPUB ao Kindle, ao Apple Livros e aos outros leitores
  const [epubGuide, setEpubGuide] = useState(false)

  // Link de cada voz, o mesmo do QR code do livro impresso, para o EPUB levar até o áudio
  const voiceLinks = async () => {
    const ids = book.chapters.flatMap(chapter =>
      chapter.entries.filter(entry => entry.answer?.audio).map(entry => entry.question.id)
    )
    const tokens = await getAudioLinks(ids)

    return Object.fromEntries(
      Object.entries(tokens).map(([id, token]) => [id, `${window.location.origin}/ouvir/${token}`])
    )
  }

  const build = async (kind: 'zip' | 'epub', info: UserBook) => {
    if (kind === 'zip') return (await import('@/lib/lvh/zip')).buildBookZip(book, info)

    return (await import('@/lib/lvh/epub')).buildBookEpub(book, info, await voiceLinks())
  }

  // O arquivo é montado no navegador e baixado direto, sem passar por servidor
  const save = async (kind: 'zip' | 'epub') => {
    if (!user.activeBook) return

    setPending(true)
    setError(null)

    try {
      const { blob, filename } = await build(kind, user.activeBook)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      setError(`Não deu para montar o ${kind.toUpperCase()}. Tente de novo.`)
    }

    setPending(false)
  }

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger
          render={<Button type='button' variant='outline' size='cta' className='min-w-0 gap-2' disabled={pending} />}
        >
          {pending ? 'Preparando…' : 'Baixar'}
          <CircleArrowDownIcon className='size-5' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='center' sideOffset={8} className='rounded-2xl p-1.5'>
          <DropdownMenuItem
            onClick={() => router.push('/app/livro/imprimir')}
            className='flex-col items-start gap-0.5 rounded-xl px-3 py-2.5'
          >
            <span className='text-sm font-medium'>PDF</span>
            <span className='text-muted-foreground text-xs'>Para imprimir o livro</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => save('epub')} className='items-start gap-3 rounded-xl py-2.5 pr-1.5 pl-3'>
            <span className='flex flex-1 flex-col gap-0.5'>
              <span className='text-sm font-medium'>EPUB</span>
              <span className='text-muted-foreground text-xs'>Para Kindle e outros leitores</span>
            </span>
            {/* Abre o passo a passo sem baixar: o clique não chega ao item */}
            <button
              type='button'
              aria-label='Como mandar o EPUB para o Kindle e outros leitores'
              onClick={event => {
                event.stopPropagation()
                setMenuOpen(false)
                setEpubGuide(true)
              }}
              className='text-muted-foreground hover:text-foreground hover:bg-background -my-1 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full'
            >
              <InfoIcon className='size-4' />
            </button>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => save('zip')} className='flex-col items-start gap-0.5 rounded-xl px-3 py-2.5'>
            <span className='text-sm font-medium'>ZIP</span>
            <span className='text-muted-foreground text-xs'>O livro com fotos e áudios</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ComoLerEpub
        open={epubGuide}
        onOpenChange={setEpubGuide}
        onDownload={() => {
          setEpubGuide(false)
          save('epub')
        }}
      />
      {error && (
        <span role='alert' className='text-destructive text-sm'>
          {error}
        </span>
      )}
    </>
  )
}

const Livro = () => {
  const user = useUser()
  const [book, setBook] = useState<Book | null>(null)
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null)
  const [customizing, setCustomizing] = useState(false)
  // Modo de leitura em tela cheia, aberto pelo "Abrir o livro" da capa ou pelo botão de tela cheia
  const [reading, setReading] = useState(false)
  const closeReading = useCallback(() => setReading(false), [])

  useEffect(() => {
    getBook(user).then(setBook)
    getChapters(user).then(chapters =>
      setTotalQuestions(chapters.reduce((total, chapter) => total + chapter.questions.length, 0))
    )
  }, [user])

  if (!book) return null

  const answered = book.chapters.reduce((total, chapter) => total + chapter.entries.length, 0)

  return (
    // Altura da tela menos o header: com o livro inteiro visível, a página não rola.
    // Uma pré-visualização: o título e as ações à esquerda, a capa do livro à direita. Folhear é no modo de leitura
    <div className='mx-auto flex h-[calc(100svh-5rem)] min-h-[36rem] w-full max-w-7xl flex-col gap-8 px-4 pt-8 sm:px-6 lg:flex-row lg:gap-16 lg:px-16'>
      <div className='flex flex-col gap-8 lg:w-64 lg:shrink-0'>
        <div className='flex flex-col gap-3'>
          <p className={eyebrowClassName}>O livro</p>
          <h1 className={pageTitleClassName}>O seu livro</h1>
          <p className='text-muted-foreground text-base'>
            O livro cresce a cada resposta.
            <br />
            Hoje ele tem {answered}
            {totalQuestions ? ` de ${totalQuestions}` : ''}{' '}
            {answered === 1 && !totalQuestions ? 'resposta' : 'respostas'}.
          </p>
        </div>

        {answered > 0 ? (
          <div className='flex flex-wrap items-center gap-3 lg:flex-col lg:items-stretch lg:[&_button]:w-full'>
            <Button
              type='button'
              variant='outline'
              size='cta'
              className='min-w-0 gap-2'
              onClick={() => setCustomizing(true)}
            >
              Personalizar
              <PaletteIcon className='size-5' />
            </Button>
            <Baixar book={book} />
            <Compartilhar />
            <LivroImpresso />
          </div>
        ) : (
          <div className='flex flex-col items-start gap-6'>
            <p className='text-muted-foreground text-base'>
              O seu livro ainda está em branco. Responda a primeira pergunta e veja a sua história começar a tomar forma
              aqui.
            </p>
            <Button render={<Link href='/app' />} nativeButton={false} variant='honey' size='cta'>
              Ir para as perguntas
            </Button>
          </div>
        )}
      </div>

      {customizing && <Personalizar open onOpenChange={setCustomizing} />}

      {reading && <LeituraImersiva book={book} caption={`Um livro de ${book.author}`} onClose={closeReading} />}

      {/* Um leitor por vez: enquanto o modo de leitura está aberto, o da página sai de cena */}
      {answered > 0 && (
        <div className='flex min-h-0 min-w-0 flex-1 flex-col'>
          {!reading && <BookReader book={book} onOpenImmersive={() => setReading(true)} />}
        </div>
      )}
    </div>
  )
}

export default Livro
