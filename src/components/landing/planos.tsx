'use client'

import { useState } from 'react'

import {
  AudioLinesIcon,
  BookOpenIcon,
  ImageIcon,
  MessageCircleQuestionMarkIcon,
  MicIcon,
  PrinterIcon,
  Share2Icon,
  TabletSmartphoneIcon,
  UsersIcon
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { MotionPreset } from '@/components/ui/motion-preset'
import { WordsReveal } from '@/components/landing/motion'
import { TRIAL } from '@/components/landing/teste-gratis'

import { cn } from '@/lib/utils'

const reveal = {
  fade: true,
  slide: { direction: 'down' as const, offset: 24 },
  transition: { duration: 0.6, ease: 'easeOut' as const }
}

const formatPrice = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })

type Billing = 'mensal' | 'anual'

// Um plano só, com tudo: a voz, as fotos e a família contando junto são o que faz o livro valer,
// então ninguém fica sem eles. Mais de um livro ao mesmo tempo é uma vaga a mais, dentro do app
// O mensal é mais caro de propósito, para o anual valer a pena: R$ 24,90 por mês, pagos de uma vez,
// economiza R$ 60 no ano, o mesmo que dois meses grátis
const MONTHLY = 29.9
const ANNUAL_PER_MONTH = 24.9
const ANNUAL = Math.round(ANNUAL_PER_MONTH * 12 * 100) / 100

// Cada item com o ícone do que ele faz, em vez do mesmo check repetido
const features: { label: string; Icon: LucideIcon }[] = [
  { label: 'Mais de 300 perguntas guiadas', Icon: MessageCircleQuestionMarkIcon },
  { label: 'Livro digital com capa, sumário e capítulos', Icon: BookOpenIcon },
  { label: 'Fotos ilimitadas ao lado das histórias', Icon: ImageIcon },
  { label: 'Gravação de voz que toca dentro do livro', Icon: MicIcon },
  { label: 'Ditado: fale e o texto aparece', Icon: AudioLinesIcon },
  { label: 'Convide a família para responder junto', Icon: UsersIcon },
  { label: 'Leitura para quantas pessoas você quiser', Icon: Share2Icon },
  { label: 'EPUB para Kindle e outros leitores', Icon: TabletSmartphoneIcon },
  { label: 'PDF pronto para imprimir', Icon: PrinterIcon }
]

const Planos = () => {
  // Começa no anual, que é onde está o desconto
  const [billing, setBilling] = useState<Billing>('anual')
  const annual = billing === 'anual'

  return (
    <section id='planos' className='scroll-mt-24'>
      <div className='mx-auto flex max-w-7xl flex-col gap-16 px-4 py-24 max-md:gap-10 max-md:py-16 sm:px-6 lg:gap-20 lg:px-16 lg:py-32'>
        <MotionPreset {...reveal} className='flex flex-col items-center gap-6 text-center'>
          <div className='flex flex-col items-center gap-4'>
            <p className='text-sm font-medium uppercase'>Planos</p>
            <WordsReveal
              as='h2'
              text='Um preço simples para guardar o que importa.'
              className='font-heading text-display text-balance'
            />
          </div>
          <p className='text-muted-foreground max-w-xl text-base text-pretty'>{TRIAL}. Depois, sem fidelidade.</p>
        </MotionPreset>

        <div className='flex flex-col items-center gap-10 max-md:gap-8'>
          {/* Mensal ou anual: o anual vem marcado com o desconto */}
          <div role='radiogroup' aria-label='Forma de pagamento' className='bg-sand flex rounded-full p-1'>
            {(['mensal', 'anual'] as const).map(option => (
              <button
                key={option}
                type='button'
                role='radio'
                aria-checked={billing === option}
                onClick={() => setBilling(option)}
                className={cn(
                  'flex h-11 cursor-pointer items-center gap-2 rounded-full px-5 text-sm font-medium transition-colors',
                  billing === option ? 'bg-moss text-cream' : 'text-foreground hover:bg-stone/60'
                )}
              >
                {option === 'mensal' ? 'Mensal' : 'Anual'}
                {option === 'anual' && (
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-semibold',
                      billing === option ? 'bg-honey text-foreground' : 'bg-moss text-cream'
                    )}
                  >
                    2 meses grátis
                  </span>
                )}
              </button>
            ))}
          </div>

          <MotionPreset
            {...reveal}
            delay={0.1}
            className='bg-moss text-cream mx-auto grid w-full max-w-5xl gap-10 rounded-2xl p-8 sm:p-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-12 lg:p-12'
          >
            <div className='flex flex-col gap-8 max-md:text-center'>
              <div className='flex flex-col gap-2'>
                <h3 className='font-heading text-display'>Lá Vem História</h3>
                <p className='text-base text-pretty'>
                  A história contada do seu jeito, com imagem, voz e a família junto.
                </p>
              </div>

              {/* No anual, o preço por mês já com desconto, o mensal riscado e o total do ano */}
              <div className='flex flex-col gap-1'>
                <p className='flex flex-wrap items-baseline gap-x-3 gap-y-1 max-md:justify-center'>
                  <span className='font-heading text-display-lg tabular-nums'>
                    {formatPrice(annual ? ANNUAL_PER_MONTH : MONTHLY)}
                  </span>
                  <span className='text-sm'>/ mês</span>
                  {annual && <s className='text-sm opacity-60'>{formatPrice(MONTHLY)}</s>}
                </p>
                <p className='text-sm opacity-80'>
                  {annual
                    ? `${formatPrice(ANNUAL)} por ano, cobrados de uma vez.`
                    : 'Cobrado todo mês. Cancele quando quiser.'}
                </p>
              </div>

              <Button
                render={<Link href='/entrar?modo=criar' />}
                nativeButton={false}
                variant='inverse'
                size='cta'
                className='mt-auto w-full'
              >
                Testar grátis
              </Button>
            </div>

            <ul className='grid content-start sm:grid-cols-2 sm:gap-x-8'>
              {features.map(({ label, Icon }) => (
                // No celular o ícone vai junto do texto, na mesma linha, para o par ficar centralizado mesmo quando quebra
                <li key={label} className='border-cream/25 flex items-start gap-3 border-t py-3 text-sm max-md:block max-md:text-center'>
                  <Icon aria-hidden='true' className='mt-0.5 size-4 shrink-0 max-md:mt-0 max-md:mr-2 max-md:inline max-md:align-[-3px]' strokeWidth={1.75} />
                  <span className='text-pretty'>{label}</span>
                </li>
              ))}
            </ul>
          </MotionPreset>
        </div>
      </div>
    </section>
  )
}

export default Planos
