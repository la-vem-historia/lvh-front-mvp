'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import BookReader from '@/components/livro/book-reader'
import Logo from '@/components/shadcn-studio/logo'
import { eyebrowClassName, pageTitleClassName } from '@/components/app/page-heading'

import { getSharedBook } from '@/lib/lvh/api'
import type { Book, Share } from '@/lib/lvh/types'

// Leitura de quem recebeu o link: sem conta, só o livro
const LivroCompartilhado = ({ token }: { token: string }) => {
  const [shared, setShared] = useState<{ book: Book; reader: Share } | null | undefined>(undefined)

  useEffect(() => {
    getSharedBook(token).then(setShared)
  }, [token])

  return (
    <div className='flex h-svh min-h-[40rem] flex-col'>
      <header>
        <div className='mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
          <Link href='/'>
            <Logo className='[&_svg]:h-[2.125rem]' />
          </Link>
          {shared && <span className='text-muted-foreground text-sm'>Lendo como {shared.reader.name}</span>}
        </div>
      </header>

      <main className='mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-6 px-4 pt-6 sm:px-6 lg:px-16'>
        {shared === null && (
          <div className='flex max-w-md flex-col gap-4 py-16'>
            <h1 className={pageTitleClassName}>Este livro não está disponível.</h1>
            <p className='text-muted-foreground text-base'>
              O link pode estar errado, ou quem escreveu o livro removeu o seu acesso.
            </p>
          </div>
        )}

        {shared && (
          <>
            <div className='flex flex-col gap-3'>
              <p className={eyebrowClassName}>Um livro de {shared.book.author}</p>
              <h1 className={pageTitleClassName}>Escrito para a família.</h1>
            </div>
            <BookReader book={shared.book} />
          </>
        )}
      </main>
    </div>
  )
}

export default LivroCompartilhado
