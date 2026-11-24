'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'

import { subscription } from '@/lib/lvh/api'
import { ANNUAL_SAVINGS, PLAN_PRICES, type PlanInterval } from '@/lib/lvh/assinatura'
import { formatPrice } from '@/lib/lvh/livros'
import { cn } from '@/lib/utils'

const options: {
  interval: PlanInterval
  title: string
  price: number
  strike?: number
  detail: string
  badge?: string
}[] = [
  {
    interval: 'anual',
    title: 'Anual',
    price: PLAN_PRICES.anualPorMes,
    strike: PLAN_PRICES.mensal,
    detail: `${formatPrice(PLAN_PRICES.anual)} por ano, cobrados de uma vez. Você economiza ${formatPrice(ANNUAL_SAVINGS)}.`,
    badge: '2 meses grátis'
  },
  {
    interval: 'mensal',
    title: 'Mensal',
    price: PLAN_PRICES.mensal,
    detail: 'Cobrado todo mês. Cancele quando quiser.'
  }
]

// Mensal ou anual, em dois cartões que funcionam como rádio. Começa no anual, onde está o desconto
const EscolherPlano = ({
  onChoose,
  chargeNote,
  pending
}: {
  onChoose: (interval: PlanInterval) => void
  // Quando cai a primeira cobrança: muda se a pessoa ainda está no teste
  chargeNote: string
  pending?: boolean
}) => {
  const [interval, setInterval] = useState<PlanInterval>('anual')

  return (
    <div className='flex flex-col gap-6'>
      <div role='radiogroup' aria-label='Plano' className='grid gap-3 sm:grid-cols-2'>
        {options.map(option => {
          const selected = option.interval === interval

          return (
            <button
              key={option.interval}
              type='button'
              role='radio'
              aria-checked={selected}
              onClick={() => setInterval(option.interval)}
              className={cn(
                'flex cursor-pointer flex-col gap-4 rounded-2xl border p-5 text-left transition-colors',
                selected ? 'border-moss bg-moss/5 ring-moss ring-1' : 'border-border hover:border-foreground/40'
              )}
            >
              <span className='flex items-center justify-between gap-3'>
                <span className='flex items-center gap-3'>
                  {/* Bolinha de rádio: cheia no escolhido */}
                  <span
                    aria-hidden='true'
                    className={cn(
                      'flex size-4 items-center justify-center rounded-full border',
                      selected ? 'border-moss' : 'border-foreground/40'
                    )}
                  >
                    {selected && <span className='bg-moss size-2 rounded-full' />}
                  </span>
                  <span className='text-base font-medium'>{option.title}</span>
                </span>
                {option.badge && (
                  <span className='bg-honey rounded-full px-2 py-0.5 text-xs font-semibold'>{option.badge}</span>
                )}
              </span>

              <span className='flex flex-col gap-1'>
                <span className='flex flex-wrap items-baseline gap-x-2'>
                  <span className='font-heading text-3xl tabular-nums'>{formatPrice(option.price)}</span>
                  <span className='text-sm'>/ mês</span>
                  {option.strike && (
                    <s className='text-muted-foreground text-sm tabular-nums'>{formatPrice(option.strike)}</s>
                  )}
                </span>
                <span className='text-muted-foreground text-sm text-pretty'>{option.detail}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div className='flex flex-col gap-3'>
        <Button
          type='button'
          variant='honey'
          size='cta'
          disabled={pending}
          onClick={() => onChoose(interval)}
          className='w-full sm:w-fit'
        >
          {interval === 'anual'
            ? `Assinar o anual · ${formatPrice(PLAN_PRICES.anual)}`
            : `Assinar o mensal · ${formatPrice(PLAN_PRICES.mensal)}/mês`}
        </Button>
        <p className='text-muted-foreground text-xs text-pretty'>
          {chargeNote} Livros a mais ao mesmo tempo: + {formatPrice(subscription.extra)}/mês cada.{' '}
          <span className='whitespace-nowrap'>Protótipo: nenhuma cobrança é feita.</span>
        </p>
      </div>
    </div>
  )
}

export default EscolherPlano
