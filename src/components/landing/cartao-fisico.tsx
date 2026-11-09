'use client'

import { useRef, useState, type PointerEvent } from 'react'

import CartaoFrente from '@/components/presente/cartao-frente'

import { cn } from '@/lib/utils'

type CartaoFisicoProps = {
  months: number
  className?: string
}

// Inclinação máxima, em graus, quando o mouse está na borda do cartão
const TILT = 12

// O cartão-presente como um cartão de plástico de verdade, flutuando sobre a página: só a sombra o coloca no espaço.
// Com o mouse em cima, ele inclina na direção do ponteiro e o brilho do plástico acompanha; ao sair, volta devagar.
// Quem pediu menos movimento vê o cartão parado
const CartaoFisico = ({ months, className }: CartaoFisicoProps) => {
  const card = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0, active: false })

  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const rect = card.current?.getBoundingClientRect()

    if (!rect) return

    // -1 a 1 a partir do centro do cartão
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const y = ((event.clientY - rect.top) / rect.height) * 2 - 1

    setTilt({ x, y, active: true })
  }

  const leave = () => setTilt({ x: 0, y: 0, active: false })

  // Sem o mouse, uma inclinação de repouso leve, para o cartão não parecer chapado
  const rotateX = tilt.active ? -tilt.y * TILT : 4
  const rotateY = tilt.active ? tilt.x * TILT : -8

  return (
    <div
      ref={card}
      onPointerMove={move}
      onPointerLeave={leave}
      className={cn('relative [perspective:1200px]', className)}
    >
      {/* Sombra na página: se afasta para o lado oposto da inclinação, como se o cartão flutuasse */}
      <div
        aria-hidden='true'
        className='absolute inset-[4%] rounded-[5%/8%] bg-[rgb(50_38_24/0.32)] blur-2xl transition-transform duration-300 ease-out'
        style={{ transform: `translate(${-rotateY * 0.9 + 6}%, ${rotateX * 0.9 + 9}%)` }}
      />

      <div
        className={cn(
          'relative aspect-[85.6/54] w-full overflow-hidden rounded-[5%/8%] shadow-[0_1px_0_rgb(255_255_255/0.5)_inset,0_2px_6px_rgb(40_30_20/0.2)] [transform-style:preserve-3d]',
          tilt.active ? 'transition-transform duration-100 ease-out' : 'transition-transform duration-700 ease-out'
        )}
        style={{ transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)` }}
      >
        <CartaoFrente months={months} className='absolute inset-0' />
        {/* Brilho do plástico: segue o mouse; em repouso, uma luz suave de cima */}
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 transition-opacity duration-300'
          style={{
            background: tilt.active
              ? `radial-gradient(60% 80% at ${(tilt.x + 1) * 50}% ${(tilt.y + 1) * 50}%, rgb(255 255 255 / 0.28), transparent 70%)`
              : 'linear-gradient(160deg, rgb(255 255 255 / 0.18), transparent 40%)'
          }}
        />
      </div>
    </div>
  )
}

export default CartaoFisico
