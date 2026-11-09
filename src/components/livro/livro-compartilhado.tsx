'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import LeituraImersiva from '@/components/livro/leitura-imersiva'
import Logo from '@/components/shadcn-studio/logo'
import { pageTitleClassName } from '@/components/app/page-heading'

import { getSharedBook } from '@/lib/lvh/api'
import type { Book, Share } from '@/lib/lvh/types'

// Leitura de quem recebeu o link: só o livro, em tela cheia, do começo ao fim.
// Para o convidado não existe "fechar": não há outra página por trás do livro
const LivroCompartilhado = ({ token }: { token: string }) => {
  const [shared, setShared] = useState<{ book: Book; reader: Share } | null | undefined>(undefined)

  useEffect(() => {
    getSharedBook(token).then(setShared)
  }, [token])

  if (shared) {
    return (
      <LeituraImersiva
        book={shared.book}
        caption={`Um livro de ${shared.book.author} · Lendo como ${shared.reader.name}`}
      />
    )
  }

  return (
    <div className='flex h-svh min-h-[40rem] flex-col'>
      <header>
        <div className='mx-auto flex h-20 max-w-7xl items-center px-4 sm:px-6 lg:px-8'>
          <Link href='/'>
            <Logo className='[&_svg]:h-[2.125rem]' />
          </Link>
        </div>
      </header>

      {shared === null && (
        <main className='mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-16 sm:px-6 lg:px-16'>
          <h1 className={pageTitleClassName}>Este livro não está disponível.</h1>
          <p className='text-muted-foreground max-w-md text-base'>
            O link pode estar errado, ou quem escreveu o livro removeu o seu acesso.
          </p>
        </main>
      )}
    </div>
  )
}

export default LivroCompartilhado
