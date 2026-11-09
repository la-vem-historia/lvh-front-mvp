'use client'

import { useRef, useState, type PointerEvent } from 'react'

import Logo from '@/components/shadcn-studio/logo'

import { cn } from '@/lib/utils'

// Face do cartão, em ilustração chapada nas cores do site: um livro aberto de onde nascem um sol, um arco e uma pena,
// como uma história saindo das páginas. As linhas nas páginas lembram a escrita
const Estampa = () => (
  <svg
    viewBox='0 0 420 378'
    preserveAspectRatio='xMidYMid slice'
    aria-hidden='true'
    className='absolute inset-0 size-full'
  >
    <rect width='420' height='378' fill='var(--lvh-moss)' />
    {/* Arco terracota e sol mel atrás do livro */}
    <path d='M60 300 V 170 A 150 150 0 0 1 360 170 V 300 Z' fill='#b0603a' />
    <circle cx='300' cy='92' r='46' fill='var(--lvh-honey)' />
    <path d='M110 300 V 190 A 100 100 0 0 1 310 190 V 300 Z' fill='#c97b4e' />

    {/* Pena, a mesma do logo, solta no ar */}
    <g transform='translate(96 64) rotate(-28)'>
      <path d='M0 0 C 26 22, 30 70, 6 118 C -18 70, -22 26, 0 0 Z' fill='#f3e6cf' />
      <path d='M0 6 C 4 44, 6 82, 6 118' fill='none' stroke='var(--lvh-moss)' strokeWidth='2.5' strokeLinecap='round' />
    </g>

    {/* Livro aberto: duas páginas curvas e a lombada no meio */}
    <path d='M30 300 C 90 268, 160 268, 210 292 L 210 400 C 160 376, 90 376, 30 400 Z' fill='#f3e6cf' />
    <path d='M390 300 C 330 268, 260 268, 210 292 L 210 400 C 260 376, 330 376, 390 400 Z' fill='#fbf3e3' />
    <path d='M210 292 L 210 400' stroke='var(--lvh-moss-strong)' strokeOpacity='0.35' strokeWidth='3' />
    {[0, 1, 2, 3].map(line => (
      <g key={line} stroke='var(--lvh-moss)' strokeOpacity='0.25' strokeWidth='3' strokeLinecap='round' fill='none'>
        <path d={`M60 ${318 + line * 16} C 100 ${304 + line * 16}, 150 ${304 + line * 16}, 185 ${314 + line * 16}`} />
        <path d={`M235 ${314 + line * 16} C 270 ${304 + line * 16}, 320 ${304 + line * 16}, 360 ${318 + line * 16}`} />
      </g>
    ))}
  </svg>
)

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
          '@container relative grid aspect-[85.6/54] w-full grid-cols-[68fr_32fr] overflow-hidden rounded-[5%/8%] shadow-[0_1px_0_rgb(255_255_255/0.5)_inset,0_2px_6px_rgb(40_30_20/0.2)] [transform-style:preserve-3d]',
          tilt.active ? 'transition-transform duration-100 ease-out' : 'transition-transform duration-700 ease-out'
        )}
        style={{ transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)` }}
      >
        <div className='relative'>
          <Estampa />
        </div>

        <div className='bg-honey text-foreground flex flex-col items-center justify-between py-[6cqw]'>
          <Logo className='[&_svg]:h-[6.5cqw] [&_svg]:w-auto' />
          <div className='flex flex-col items-center leading-none'>
            <span className='font-heading text-[11cqw] leading-none tabular-nums'>{months}</span>
            <span className='text-[3cqw] font-semibold tracking-[0.18em] uppercase'>meses</span>
          </div>
          <span className='text-foreground/70 text-[2.2cqw] tracking-[0.2em] uppercase'>Presente</span>
        </div>

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
