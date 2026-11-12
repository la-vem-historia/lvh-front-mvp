import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import EntrarForm from '@/components/app/entrar-form'
import Logo from '@/components/shadcn-studio/logo'

import heroImage from '@/assets/landing/hero-livro.png'

export const metadata: Metadata = {
  title: 'Entrar | Lá Vem História'
}

// Mesma composição do hero da landing: 60% para o formulário, centralizado, e 40% para a foto
// em moldura arredondada
// ?modo=criar abre direto em Criar conta (vindo dos botões de cadastro da landing)
export default async function EntrarPage({ searchParams }: PageProps<'/entrar'>) {
  const { modo } = await searchParams

  return (
    <div className='grid min-h-svh lg:grid-cols-[3fr_2fr]'>
      <div className='flex flex-col px-4 py-6 sm:px-6 lg:px-16 lg:py-8'>
        <Link href='/' className='w-fit'>
          <Logo className='[&_svg]:h-[2.125rem]' />
        </Link>
        <div className='flex flex-1 items-center justify-center py-16'>
          <EntrarForm initialMode={modo === 'criar' ? 'criar' : 'entrar'} />
        </div>
      </div>

      <div className='flex items-center py-10 pr-8 max-lg:hidden'>
        <div className='bg-sand relative aspect-[649/708] w-full overflow-hidden rounded-2xl'>
          <Image
            src={heroImage}
            alt='Mãos segurando o livro Lá Vem História, com a capa “Maria Oliveira, a minha história” e fotos antigas de família'
            fill
            priority
            placeholder='blur'
            sizes='40vw'
            className='object-cover'
          />
        </div>
      </div>
    </div>
  )
}
