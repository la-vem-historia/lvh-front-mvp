'use client'

import { useState } from 'react'

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import SeloMaisEscolhido from '@/components/presente/selo-mais-escolhido'

import { formatPrice } from '@/lib/lvh/livros'
import { FEATURED_MONTHS, GIFT_OPTIONS, pricePerMonth, savingsOf, type GiftMonths } from '@/lib/lvh/presente'
import { cn } from '@/lib/utils'

// As três opções já escolhíveis na landing: o botão leva para a compra com a opção marcada
const PresenteOpcoes = () => {
  const [months, setMonths] = useState<GiftMonths>(FEATURED_MONTHS)

  return (
    <div className='flex flex-col gap-10'>
      <div role='radiogroup' aria-label='Quantos meses de presente' className='grid gap-3 pt-3 sm:grid-cols-3'>
        {GIFT_OPTIONS.map(option => {
          const selected = months === option.months

          return (
            <button
              key={option.months}
              type='button'
              role='radio'
              aria-checked={selected}
              onClick={() => setMonths(option.months)}
              className={cn(
                'relative flex cursor-pointer flex-col gap-1 rounded-2xl border p-5 text-left transition-colors',
                selected
                  ? 'border-moss bg-moss/5 ring-moss ring-1'
                  : 'bg-sand hover:border-foreground/30 border-transparent'
              )}
            >
              {option.months === FEATURED_MONTHS && <SeloMaisEscolhido />}
              <span className='font-heading text-2xl'>{option.months} meses</span>
              <span className='text-base font-medium tabular-nums'>{formatPrice(option.price)}</span>
              <span className='text-muted-foreground text-xs tabular-nums'>
                {formatPrice(pricePerMonth(option))} por mês
                {savingsOf(option) > 0 && ` · ${savingsOf(option)}% a menos`}
              </span>
            </button>
          )
        })}
      </div>

      <div className='flex flex-col items-start gap-4 sm:flex-row sm:items-center'>
        <Button render={<Link href={`/presente?meses=${months}`} />} nativeButton={false} variant='honey' size='cta'>
          Dar {months} meses de presente
        </Button>
        <Link
          href='/presente/resgatar'
          className='text-muted-foreground hover:text-foreground text-sm underline underline-offset-4 transition-colors'
        >
          Ganhou um presente? Resgate o seu código
        </Link>
      </div>
    </div>
  )
}

export default PresenteOpcoes
