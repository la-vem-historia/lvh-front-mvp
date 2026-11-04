'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { eyebrowClassName, pageTitleClassName } from '@/components/app/page-heading'
import { useUser } from '@/components/app/session'
import BookReader from '@/components/livro/book-reader'
import Compartilhar from '@/components/livro/compartilhar'
import Personalizar from '@/components/livro/personalizar'

import { getBook } from '@/lib/lvh/api'
import type { Book } from '@/lib/lvh/types'

const Livro = () => {
  const user = useUser()
  const [book, setBook] = useState<Book | null>(null)
  const [customizing, setCustomizing] = useState(false)

  useEffect(() => {
    getBook(user).then(setBook)
  }, [user])

  if (!book) return null

  const answered = book.chapters.reduce((total, chapter) => total + chapter.entries.length, 0)

  return (
    // Altura da tela menos o header: com o livro inteiro visível, a página não rola
    <div className='mx-auto flex h-[calc(100svh-5rem)] min-h-[36rem] w-full max-w-7xl flex-col gap-6 px-4 pt-8 sm:px-6 lg:px-16'>
      <div className='flex flex-wrap items-end justify-between gap-6'>
        <div className='flex flex-col gap-3'>
          <p className={eyebrowClassName}>O livro</p>
          <h1 className={pageTitleClassName}>A sua história, até aqui.</h1>
          <p className='text-muted-foreground text-base'>
            O livro cresce a cada resposta. Hoje ele tem {answered} {answered === 1 ? 'resposta' : 'respostas'}.
          </p>
        </div>
        {answered > 0 && (
          <div className='flex flex-wrap items-center gap-3'>
            <Button type='button' variant='outline' size='cta' className='min-w-0' onClick={() => setCustomizing(true)}>
              Personalizar
            </Button>
            <Button
              render={<Link href='/app/livro/imprimir' />}
              nativeButton={false}
              variant='outline'
              size='cta'
              className='min-w-0'
            >
              Baixar PDF
            </Button>
            <Compartilhar />
          </div>
        )}
      </div>

      {/* Convite discreto enquanto a pessoa ainda não personalizou o livro */}
      {answered > 0 && !user.bookName && !user.dedication && (
        <div className='bg-sand flex flex-wrap items-center justify-between gap-4 rounded-2xl px-5 py-4'>
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

      {customizing && <Personalizar open onOpenChange={setCustomizing} />}

      {answered > 0 ? (
        <BookReader book={book} />
      ) : (
        <div className='border-border flex flex-col items-start gap-6 border-t pt-10'>
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
