import type { Metadata } from 'next'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import Logo from '@/components/shadcn-studio/logo'
import { pageTitleClassName, textLinkClassName } from '@/components/app/page-heading'

export const metadata: Metadata = {
  title: 'Conta excluída | Lá Vem História',
  robots: { index: false }
}

// Fica fora de /app: depois da exclusão não existe mais sessão
export default function ContaExcluidaPage() {
  return (
    <div className='flex min-h-svh flex-col'>
      <header>
        <div className='mx-auto flex h-20 max-w-7xl items-center px-4 sm:px-6 lg:px-8'>
          <Link href='/'>
            <Logo className='[&_svg]:h-[2.125rem]' />
          </Link>
        </div>
      </header>
      <main className='mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-4 py-16 sm:px-6'>
        <h1 className={pageTitleClassName}>A sua conta foi excluída.</h1>
        <p className='text-muted-foreground max-w-xl text-base text-pretty'>
          Apagamos a sua conta e tudo o que estava nela. Obrigado por ter confiado as suas histórias a nós. Se um dia
          quiser recomeçar, é só criar uma conta nova.
        </p>
        <div className='flex flex-wrap items-center gap-4'>
          <Button render={<Link href='/' />} nativeButton={false} variant='honey' size='cta'>
            Voltar para o início
          </Button>
          <Link href='/entrar' className={textLinkClassName}>
            Criar uma conta nova
          </Link>
        </div>
      </main>
    </div>
  )
}
