import Header from '@/components/shadcn-studio/blocks/hero-section-29/header'
import type { Navigation } from '@/components/shadcn-studio/blocks/hero-navigation-02'

import ComoFunciona from '@/components/landing/como-funciona'
import Hero from '@/components/landing/hero'
import OLivro from '@/components/landing/o-livro'
import Planos from '@/components/landing/planos'
import Rodape from '@/components/landing/rodape'
import { MotionRoot } from '@/components/landing/motion'

const navigationData: Navigation[] = [
  { title: 'Como funciona', href: '#como-funciona' },
  { title: 'O livro', href: '#o-livro' },
  { title: 'Planos', href: '#planos' }
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
          <Planos />
        </main>
        <Rodape />
      </div>
    </MotionRoot>
  )
}
