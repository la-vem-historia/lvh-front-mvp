import Header from '@/components/shadcn-studio/blocks/hero-section-29/header'
import type { Navigation } from '@/components/shadcn-studio/blocks/hero-navigation-02'

import ComoFunciona from '@/components/landing/como-funciona'
import Duvidas from '@/components/landing/duvidas'
import Hero from '@/components/landing/hero'
import OLivro from '@/components/landing/o-livro'
import OndeLer from '@/components/landing/onde-ler'
import Planos from '@/components/landing/planos'
import Presente from '@/components/landing/presente'
import Rodape from '@/components/landing/rodape'
import { MotionRoot } from '@/components/landing/motion'

const navigationData: Navigation[] = [
  { title: 'Como funciona', href: '#como-funciona' },
  { title: 'O livro', href: '#o-livro' },
  { title: 'Planos', href: '#planos' },
  { title: 'Presente', href: '#presente' },
  { title: 'Dúvidas', href: '#duvidas' }
]

export default function Home() {
  return (
    <MotionRoot>
      <div className='bg-cream flex flex-col'>
        <Header navigationData={navigationData} />
        <main className='mt-20 flex flex-1 flex-col'>
          <Hero />
          <ComoFunciona />
          <OLivro />
          <OndeLer />
          <Planos />
          <Presente />
          <Duvidas />
        </main>
        <Rodape />
      </div>
    </MotionRoot>
  )
}
