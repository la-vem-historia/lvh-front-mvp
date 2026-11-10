'use client'

import { useState } from 'react'

import CartaoFrente from '@/components/presente/cartao-frente'
import CartaoVerso from '@/components/presente/cartao-verso'

import { cn } from '@/lib/utils'

type CartaoDuploProps = {
  recipientName?: string
  months: number
  message?: string
  buyerName?: string
  code?: string
  className?: string
}

type Lado = 'frente' | 'verso'

// O cartão-presente com os dois lados: vira em 3D com um clique no cartão ou no seletor embaixo.
// Começa no verso, porque é lá que aparece o que a pessoa está preenchendo
const CartaoDuplo = ({ className, ...card }: CartaoDuploProps) => {
  const [lado, setLado] = useState<Lado>('verso')
  const virado = lado === 'verso'

  return (
    <div className={cn('flex flex-col items-center gap-5', className)}>
      <button
        type='button'
        onClick={() => setLado(virado ? 'frente' : 'verso')}
        aria-label={virado ? 'Ver a frente do cartão' : 'Ver o verso do cartão'}
        className='w-full cursor-pointer [perspective:1600px]'
      >
        <div
          className='relative aspect-[85.6/54] w-full transition-transform duration-700 ease-[cubic-bezier(0.3,0.7,0.2,1)] [transform-style:preserve-3d] motion-reduce:transition-none'
          style={{ transform: virado ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          <div
            aria-hidden={virado}
            className='absolute inset-0 rounded-[5%/8%] shadow-[0_40px_80px_-40px_rgb(40_30_20/0.55)] [backface-visibility:hidden]'
          >
            <CartaoFrente months={card.months} />
          </div>
          <div
            aria-hidden={!virado}
            className='absolute inset-0 rounded-[5%/8%] shadow-[0_40px_80px_-40px_rgb(40_30_20/0.55)] [backface-visibility:hidden] [transform:rotateY(180deg)]'
          >
            <CartaoVerso {...card} />
          </div>
        </div>
      </button>

      <div role='radiogroup' aria-label='Lado do cartão' className='bg-sand flex rounded-full p-1'>
        {(['frente', 'verso'] as const).map(option => (
          <button
            key={option}
            type='button'
            role='radio'
            aria-checked={lado === option}
            onClick={() => setLado(option)}
            className={cn(
              'h-9 cursor-pointer rounded-full px-5 text-sm capitalize transition-colors',
              lado === option ? 'bg-moss text-cream font-bold' : 'text-foreground/75 hover:text-foreground font-medium'
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

export default CartaoDuplo
