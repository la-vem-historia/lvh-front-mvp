'use client'

import { useState } from 'react'

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import Logo from '@/components/shadcn-studio/logo'
import { pageTitleClassName } from '@/components/app/page-heading'

// Tudo o que o protótipo guarda fica no navegador, com chaves que começam por "lvh:"
const clearPrototype = () => {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    Object.keys(storage)
      .filter(key => key.startsWith('lvh:') || key.startsWith('lvh-'))
      .forEach(key => storage.removeItem(key))
  }
}

const Limpar = () => {
  const [done, setDone] = useState(false)

  const clear = () => {
    clearPrototype()
    setDone(true)
  }

  return (
    <div className='flex min-h-svh flex-col'>
      <header>
        <div className='mx-auto flex h-20 max-w-7xl items-center px-4 sm:px-6 lg:px-8'>
          <Logo className='[&_svg]:h-[2.125rem]' />
        </div>
      </header>
      <main className='mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-4 py-16 sm:px-6'>
        {done ? (
          <>
            <h1 className={pageTitleClassName}>Pronto. Tudo apagado.</h1>
            <p className='text-muted-foreground max-w-xl text-base text-pretty'>
              Este navegador está como o de quem nunca entrou no Lá Vem História. O acesso de equipe continua valendo,
              então dá para criar uma conta nova pela landing.
            </p>
            <div>
              <Button render={<Link href='/' />} nativeButton={false} variant='honey' size='cta'>
                Ir para a landing
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className='text-sm font-medium uppercase'>Só para a equipe</p>
            <h1 className={pageTitleClassName}>Começar do zero</h1>
            <p className='text-muted-foreground max-w-xl text-base text-pretty'>
              Apaga as contas, os livros, as respostas, as fotos, as vozes e os convites guardados neste navegador. Os
              outros navegadores e aparelhos não são afetados. Não dá para desfazer.
            </p>
            <div>
              <Button type='button' variant='destructive' size='cta' onClick={clear}>
                Apagar tudo e começar do zero
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default Limpar
