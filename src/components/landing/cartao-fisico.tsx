import Logo from '@/components/shadcn-studio/logo'

import { cn } from '@/lib/utils'

// Ilustração da face do cartão: folhas e formas soltas nas cores do site, como uma estampa
const Estampa = () => (
  <svg
    viewBox='0 0 420 378'
    preserveAspectRatio='xMidYMid slice'
    aria-hidden='true'
    className='absolute inset-0 size-full'
  >
    <rect width='420' height='378' fill='#f3e6cf' />
    <circle cx='250' cy='-10' r='78' fill='var(--lvh-honey)' />
    <circle cx='330' cy='300' r='92' fill='#b0603a' />
    <path d='M-30 330 C 70 170, 210 120, 310 30 C 270 180, 150 300, -30 330 Z' fill='var(--lvh-moss)' />
    <path d='M-30 330 C 110 220, 200 150, 310 30' fill='none' stroke='#f3e6cf' strokeOpacity='0.35' strokeWidth='3' />
    <path d='M70 -30 C 150 50, 170 160, 120 270 C 60 180, 40 80, 70 -30 Z' fill='var(--lvh-olive)' />
    <path d='M70 -30 C 110 80, 125 170, 120 270' fill='none' stroke='#f3e6cf' strokeOpacity='0.4' strokeWidth='2.5' />
    <path d='M180 400 C 230 310, 320 260, 440 250 C 370 330, 290 390, 180 400 Z' fill='var(--lvh-moss-strong)' />
    <path d='M190 398 C 280 330, 350 290, 440 250' fill='none' stroke='#f3e6cf' strokeOpacity='0.3' strokeWidth='2.5' />
    <path d='M300 120 C 340 90, 390 90, 430 110 C 390 150, 340 155, 300 120 Z' fill='var(--lvh-olive)' opacity='0.9' />
    {/* Flor: o pequeno detalhe claro que dá vida à estampa */}
    <g transform='translate(205 205)'>
      {[0, 72, 144, 216, 288].map(angle => (
        <ellipse key={angle} rx='13' ry='30' cy='-24' fill='#fffef2' transform={`rotate(${angle})`} />
      ))}
      <circle r='9' fill='var(--lvh-honey)' />
    </g>
  </svg>
)

type CartaoFisicoProps = {
  months: number
  className?: string
}

// O cartão-presente como um cartão de plástico de verdade, apoiado na parede: o fundo da própria página faz
// a parede, e só a sombra o coloca no espaço. Estampa à esquerda, faixa mel à direita com a marca e os meses
const CartaoFisico = ({ months, className }: CartaoFisicoProps) => (
  <div className={cn('relative [perspective:1600px]', className)}>
    {/* Sombra projetada na parede, atrás e para a direita, como luz vindo da esquerda */}
    <div
      aria-hidden='true'
      className='absolute inset-0 translate-x-[7%] translate-y-[5%] rounded-[5%/8%] bg-[rgb(60_45_30/0.28)] blur-2xl'
    />
    {/* Sombra de contato no pé do cartão, onde ele encosta no chão */}
    <div
      aria-hidden='true'
      className='absolute inset-x-[6%] -bottom-[3%] h-[7%] rounded-full bg-[rgb(40_30_20/0.35)] blur-md'
    />

    <div className='@container relative grid aspect-[85.6/54] w-full grid-cols-[70fr_30fr] overflow-hidden rounded-[5%/8%] shadow-[0_1px_0_rgb(255_255_255/0.6)_inset,0_2px_6px_rgb(40_30_20/0.18)] [transform:rotateX(6deg)_rotateY(-12deg)] [transform-origin:50%_100%]'>
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

      {/* Brilho do plástico, de leve, de cima para baixo */}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0'
        style={{ background: 'linear-gradient(160deg, rgb(255 255 255 / 0.18), transparent 40%)' }}
      />
    </div>
  </div>
)

export default CartaoFisico
