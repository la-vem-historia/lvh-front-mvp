'use client'

import { useState } from 'react'

import { MotionPreset } from '@/components/ui/motion-preset'
import { WordsReveal } from '@/components/landing/motion'
import PresenteOpcoes from '@/components/landing/presente-opcoes'
import CartaoFisico from '@/components/landing/cartao-fisico'

import { FEATURED_MONTHS, type GiftMonths } from '@/lib/lvh/presente'

const reveal = {
  fade: true,
  slide: { direction: 'down' as const, offset: 24 },
  transition: { duration: 0.6, ease: 'easeOut' as const }
}

// Cartão-presente: para quem quer que a mãe, o pai ou os avós contem a história deles.
// O cartão ao lado, apoiado na parede, mostra os meses da opção escolhida
const Presente = () => {
  const [months, setMonths] = useState<GiftMonths>(FEATURED_MONTHS)

  return (
    <section id='presente' className='scroll-mt-24'>
      <div className='mx-auto grid max-w-7xl gap-16 px-4 py-24 sm:px-6 lg:grid-cols-12 lg:items-center lg:gap-8 lg:px-16 lg:py-32'>
        <MotionPreset {...reveal} className='flex flex-col gap-10 lg:col-span-6'>
          <div className='flex flex-col gap-4'>
            <p className='text-sm font-medium uppercase'>De presente</p>
            <WordsReveal
              as='h2'
              text='O presente que vira um livro.'
              className='font-heading text-display text-balance'
            />
            <p className='text-foreground/80 max-w-xl text-base text-pretty'>
              Dê meses de Lá Vem História para a sua mãe, o seu pai ou os seus avós contarem a história deles. O cartão
              vai direto para o e-mail de quem ganha, ou chega para você em PDF, para imprimir e entregar em mãos.
            </p>
          </div>

          <PresenteOpcoes months={months} onChange={setMonths} />
        </MotionPreset>

        <MotionPreset {...reveal} delay={0.15} className='flex justify-center px-6 lg:col-span-5 lg:col-start-8'>
          <CartaoFisico months={months} className='w-full max-w-md' />
        </MotionPreset>
      </div>
    </section>
  )
}

export default Presente
