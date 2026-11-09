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

// Frente do cartão-presente, em proporção de cartão de crédito: a faixa mel com a marca e os meses e a estampa.
// Sem moldura nem sombra: quem usa decide se ela flutua, gira ou vai para a impressão
const CartaoFrente = ({ months, className }: { months: number; className?: string }) => (
  <div
    className={cn(
      '@container relative grid aspect-[85.6/54] w-full grid-cols-[32fr_68fr] overflow-hidden rounded-[5%/8%] [print-color-adjust:exact]',
      className
    )}
  >
    {/* Faixa mel à esquerda, com a marca e os meses em verde-musgo */}
    <div className='bg-honey text-moss flex flex-col items-center justify-between py-[6cqw]'>
      <Logo className='text-moss [&_svg]:h-[6.5cqw] [&_svg]:w-auto' />
      <div className='flex flex-col items-center gap-[0.2cqw] leading-none'>
        <span className='font-heading text-[11cqw] leading-none tabular-nums'>{months}</span>
        <span className='text-[3cqw] font-semibold tracking-[0.18em] uppercase'>meses</span>
      </div>
      <span className='text-moss/70 text-[2.2cqw] tracking-[0.2em] uppercase'>Presente</span>
    </div>

    <div className='relative'>
      <Estampa />
    </div>
  </div>
)

export default CartaoFrente
