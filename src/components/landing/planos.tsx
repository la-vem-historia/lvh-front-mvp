'use client'

import { useState } from 'react'

import { CheckIcon, MinusIcon } from 'lucide-react'

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { MotionPreset } from '@/components/ui/motion-preset'
import { WordsReveal } from '@/components/landing/motion'

import { cn } from '@/lib/utils'

const reveal = {
  fade: true,
  slide: { direction: 'down' as const, offset: 24 },
  transition: { duration: 0.6, ease: 'easeOut' as const }
}

const formatPrice = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })

// No anual, a pessoa paga 10 meses e leva 12: dois meses grátis
const ANNUAL_MONTHS = 10

type Billing = 'mensal' | 'anual'

// O Essencial é só texto; o Completo libera fotos, voz e ditado. Os itens fora do plano aparecem riscados
const plans = [
  {
    name: 'Essencial',
    description: 'Para quem quer contar a história só escrevendo.',
    price: 9.9,
    card: 'bg-lilac text-foreground',
    line: 'border-ink/20',
    button: 'default' as const,
    features: [
      { label: 'Todas as perguntas guiadas', included: true },
      { label: 'Livro digital com capa, sumário e capítulos', included: true },
      { label: 'EPUB para ler no Kindle e outros leitores', included: true },
      { label: 'Leitura só para quem você convidar', included: true },
      { label: 'Fotos nas respostas', included: false },
      { label: 'Gravação de voz', included: false },
      { label: 'Ditado: fale e o texto aparece', included: false }
    ]
  },
  {
    name: 'Completo',
    description: 'Tudo para contar do seu jeito, com imagem e voz.',
    price: 29.9,
    card: 'bg-olive text-cream',
    line: 'border-cream/25',
    button: 'inverse' as const,
    badge: 'Recomendado',
    features: [
      { label: 'Tudo do Essencial', included: true },
      { label: 'Fotos ilimitadas ao lado das histórias', included: true },
      { label: 'Gravação de voz que toca dentro do livro', included: true },
      { label: 'Ditado: fale e o texto aparece', included: true },
      { label: 'Convide a família para responder junto', included: true },
      { label: 'PDF pronto para imprimir', included: true }
    ]
  }
]

const Planos = () => {
  // Começa no anual, que é onde está o desconto
  const [billing, setBilling] = useState<Billing>('anual')
  const annual = billing === 'anual'

  return (
    <section id='planos' className='scroll-mt-24'>
      <div className='mx-auto flex max-w-7xl flex-col gap-16 px-4 py-24 sm:px-6 lg:gap-20 lg:px-16 lg:py-32'>
        <MotionPreset {...reveal} className='flex flex-col items-center gap-6 text-center'>
          <div className='flex flex-col items-center gap-4'>
            <p className='text-sm font-medium uppercase'>Planos</p>
            <WordsReveal
              as='h2'
              text='Um preço simples para guardar o que importa.'
              className='font-heading text-display text-balance'
            />
          </div>
          <p className='text-muted-foreground max-w-xl text-base text-pretty'>
            Dois planos, sem fidelidade. Você cria a conta grátis e escolhe o plano quando quiser.
          </p>
        </MotionPreset>

        <div className='flex flex-col items-center gap-10'>
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
                  billing === option ? 'bg-foreground text-cream' : 'text-foreground hover:bg-stone/60'
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

          <div className='mx-auto grid w-full max-w-4xl gap-8 md:grid-cols-2'>
            {plans.map((plan, index) => (
              <MotionPreset
                key={plan.name}
                {...reveal}
                delay={0.1 * (index + 1)}
                className={`${plan.card} flex flex-col gap-8 rounded-2xl p-8 transition-[translate,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_24px_40px_-24px_rgb(34_34_34/0.6)] sm:p-10`}
              >
                <div className='flex flex-col gap-2'>
                  <div className='flex items-center justify-between gap-4'>
                    <h3 className='font-heading text-display'>{plan.name}</h3>
                    {plan.badge && (
                      <span className='bg-cream text-foreground rounded-full px-3 py-1 text-xs font-medium'>{plan.badge}</span>
                    )}
                  </div>
                  <p className='text-base'>{plan.description}</p>
                </div>

                {/* No anual, o preço por mês já com desconto, o mensal riscado e o total do ano */}
                <div className='flex flex-col gap-1'>
                  <p className='flex flex-wrap items-baseline gap-x-3 gap-y-1'>
                    <span className='font-heading text-display-lg tabular-nums'>
                      {formatPrice(annual ? Math.round((plan.price * ANNUAL_MONTHS * 100) / 12) / 100 : plan.price)}
                    </span>
                    <span className='text-sm'>/ mês</span>
                    {annual && <s className='text-sm opacity-60'>{formatPrice(plan.price)}</s>}
                  </p>
                  <p className='text-sm opacity-80'>
                    {annual
                      ? `${formatPrice(plan.price * ANNUAL_MONTHS)} por ano, cobrados de uma vez.`
                      : 'Cobrado todo mês. Cancele quando quiser.'}
                  </p>
                </div>

                <ul className='flex flex-1 flex-col'>
                  {plan.features.map(feature => (
                    <li
                      key={feature.label}
                      className={cn(
                        plan.line,
                        'flex items-center gap-3 border-t py-3 text-sm',
                        !feature.included && 'opacity-55'
                      )}
                    >
                      {feature.included ? (
                        <CheckIcon aria-hidden='true' className='size-4 shrink-0' />
                      ) : (
                        <MinusIcon aria-hidden='true' className='size-4 shrink-0' />
                      )}
                      <span className={cn(!feature.included && 'line-through')}>
                        {feature.label}
                        {!feature.included && <span className='sr-only'> (não incluso)</span>}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  render={<Link href='/entrar?modo=criar' />}
                  nativeButton={false}
                  variant={plan.button}
                  size='cta'
                  // O botão escuro do Essencial usa a mesma sombra do botão claro do Completo,
                  // para a elevação no hover aparecer junto com a do card
                  className={
                    plan.button === 'default'
                      ? 'bg-foreground hover:bg-ink hover:shadow-[0_12px_24px_-10px_rgb(0_0_0/0.75)]!'
                      : undefined
                  }
                >
                  Cadastre-se grátis
                </Button>
              </MotionPreset>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Planos
