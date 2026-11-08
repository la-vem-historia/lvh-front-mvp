'use client'

import { useCallback, useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ChevronDownIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { eyebrowClassName, pageTitleClassName } from '@/components/app/page-heading'
import { useUser } from '@/components/app/session'
import BookReader from '@/components/livro/book-reader'
import Compartilhar from '@/components/livro/compartilhar'
import LeituraImersiva from '@/components/livro/leitura-imersiva'
import Personalizar from '@/components/livro/personalizar'

import { getBook, getChapters } from '@/lib/lvh/api'
import type { Book } from '@/lib/lvh/types'

// Um botão só para baixar: o PDF para imprimir ou a pasta do livro (página que abre sem internet,
// fotos e áudios com os códigos impressos no livro)
const Baixar = ({ book }: { book: Book }) => {
  const user = useUser()
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const downloadZip = async () => {
    if (!user.activeBook) return

    setPending(true)
    setError(null)

    try {
      const { buildBookZip } = await import('@/lib/lvh/zip')
      const { blob, filename } = await buildBookZip(book, user.activeBook)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('Não deu para montar o ZIP. Tente de novo.')
    }

    setPending(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button type='button' variant='outline' size='cta' className='min-w-0 gap-2' disabled={pending} />}
        >
          {pending ? 'Preparando…' : 'Baixar'}
          <ChevronDownIcon className='size-4' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='center' sideOffset={8} className='rounded-2xl p-1.5'>
          <DropdownMenuItem
            onClick={() => router.push('/app/livro/imprimir')}
            className='flex-col items-start gap-0.5 rounded-xl px-3 py-2.5'
          >
            <span className='text-sm font-medium'>PDF</span>
            <span className='text-muted-foreground text-xs'>Para imprimir o livro</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={downloadZip} className='flex-col items-start gap-0.5 rounded-xl px-3 py-2.5'>
            <span className='text-sm font-medium'>ZIP</span>
            <span className='text-muted-foreground text-xs'>O livro com fotos e áudios</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
    // No computador, três colunas: o título à esquerda, o livro no meio e as ações à direita
    <div className='mx-auto flex h-[calc(100svh-5rem)] min-h-[36rem] w-full max-w-7xl flex-col gap-6 px-4 pt-8 sm:px-6 lg:flex-row lg:gap-10 lg:px-16'>
      <div className='flex flex-col gap-6 lg:w-64 lg:shrink-0'>
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

        {/* Convite discreto enquanto a pessoa ainda não personalizou o livro */}
        {answered > 0 && !user.bookName && !user.dedication && (
          <div className='bg-sand flex flex-col items-start gap-3 rounded-2xl px-5 py-4'>
            <p className='text-sm'>
              Confirme o nome que vai na capa e, se quiser, escreva uma dedicatória para quem vai ler.
            </p>
            <button
              type='button'
              onClick={() => setCustomizing(true)}
              className='cursor-pointer text-sm font-medium underline underline-offset-4'
            >
              Personalizar o livro
            </button>
          </div>
        )}
      </div>

      {customizing && <Personalizar open onOpenChange={setCustomizing} />}

      {reading && <LeituraImersiva book={book} caption={`Um livro de ${book.author}`} onClose={closeReading} />}

      {answered > 0 ? (
        <>
          {/* Um leitor por vez: enquanto o modo de leitura está aberto, o da página sai de cena */}
          <div className='flex min-h-0 min-w-0 flex-1 flex-col max-lg:order-last'>
            {!reading && <BookReader book={book} onOpenImmersive={() => setReading(true)} />}
          </div>

          <div className='flex flex-wrap items-center gap-3 lg:w-64 lg:shrink-0 lg:flex-col lg:items-stretch lg:justify-center lg:pb-24 lg:[&_button]:w-full'>
            <Button type='button' variant='outline' size='cta' className='min-w-0' onClick={() => setCustomizing(true)}>
              Personalizar
            </Button>
            <Baixar book={book} />
            <Compartilhar />
          </div>
        </>
      ) : (
        <div className='border-border flex flex-col items-start gap-6 border-t pt-10 lg:flex-1 lg:border-t-0 lg:pt-0'>
          <p className='text-muted-foreground max-w-md text-base'>
            O seu livro ainda está em branco. Responda a primeira pergunta e veja a sua história começar a tomar forma
            aqui.
          </p>
          <Button render={<Link href='/app' />} nativeButton={false} variant='honey' size='cta'>
            Ir para as perguntas
          </Button>
        </div>
      )}
    </div>
  )
}

export default Livro
