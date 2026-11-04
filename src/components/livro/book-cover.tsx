import type { CSSProperties } from 'react'

import type { CoverColor } from '@/lib/lvh/types'
import { cn } from '@/lib/utils'

// Cores de capa: tecido e douração (o "hot stamping" dos títulos)
export const coverColors: Record<CoverColor, { label: string; cloth: string; foil: string }> = {
  verde: { label: 'Verde', cloth: '#1d4a2a', foil: '#e9d9aa' },
  terracota: { label: 'Terracota', cloth: '#8a4a2e', foil: '#f2e0bd' },
  marinho: { label: 'Azul-marinho', cloth: '#1f2b43', foil: '#e7d6a4' },
  areia: { label: 'Areia', cloth: '#d6c9ae', foil: '#3b3024' }
}

// Ruído fino que imita a trama do linho de uma capa dura
const NOISE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")"

const LINEN =
  'repeating-linear-gradient(0deg, rgb(255 255 255 / 0.035) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgb(0 0 0 / 0.06) 0 1px, transparent 1px 3px)'

// Trama do tecido; em capas claras ela fica mais leve para não acinzentar a cor
const ClothGrain = ({ color }: { color: CoverColor }) => (
  <span
    aria-hidden='true'
    className='absolute inset-0 mix-blend-multiply'
    style={{ backgroundImage: NOISE, opacity: color === 'areia' ? 0.18 : 0.55 }}
  />
)

type BookCoverProps = {
  author: string
  color?: CoverColor
  photo?: string
  year?: number
  className?: string
}

// Capa em proporção de livro (A5); tudo em cqw para escalar com a largura
const BookCover = ({ author, color = 'verde', photo, year, className }: BookCoverProps) => {
  const { cloth, foil } = coverColors[color]
  const stamped: CSSProperties = {
    color: foil,
    textShadow: color === 'areia' ? '0 1px 0 rgb(255 255 255 / 0.35)' : '0 -1px 0 rgb(0 0 0 / 0.35)'
  }

  return (
    <div
      className={cn('@container relative aspect-[440/622] w-full overflow-hidden select-none', className)}
      style={{ backgroundColor: cloth, backgroundImage: LINEN }}
    >
      <ClothGrain color={color} />
      {/* Lombada: dobradiça da capa dura, com sombra e brilho */}
      <span
        aria-hidden='true'
        className='absolute inset-y-0 left-0 w-[5cqw]'
        style={{
          background: 'linear-gradient(to right, rgb(0 0 0 / 0.38), rgb(255 255 255 / 0.07) 55%, rgb(0 0 0 / 0.18))'
        }}
      />
      <span aria-hidden='true' className='absolute inset-y-0 left-[6cqw] w-px bg-black/25' />
      <span aria-hidden='true' className='absolute inset-y-0 left-[calc(6cqw+1px)] w-px bg-white/10' />
      {/* Luz suave vinda de cima, para o tecido não ficar chapado */}
      <span
        aria-hidden='true'
        className='absolute inset-0'
        style={{ background: 'radial-gradient(120% 80% at 70% 0%, rgb(255 255 255 / 0.10), transparent 60%)' }}
      />

      <div className='relative flex h-full flex-col items-center py-[9cqw] pr-[9cqw] pl-[15cqw] text-center'>
        <span className='text-[2.4cqw] font-medium tracking-[0.32em] uppercase' style={stamped}>
          Lá Vem História
        </span>

        <div className='flex flex-1 flex-col items-center justify-center gap-[5cqw]'>
          {photo && (
            <div
              className='w-[46cqw] -rotate-2 bg-[#fbf7ee] p-[1.6cqw] pb-[5cqw] shadow-[0_0.8cqw_2cqw_rgb(0_0_0/0.35)]'
              aria-hidden='true'
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt='' className='aspect-[4/5] w-full object-cover' />
            </div>
          )}

          <div className='flex flex-col items-center gap-[3cqw]'>
            <span
              className={cn('font-heading leading-[1.05] text-balance', photo ? 'text-[8cqw]' : 'text-[10.5cqw]')}
              style={stamped}
            >
              {author}
            </span>
            <span aria-hidden='true' className='h-px w-[10cqw] opacity-60' style={{ backgroundColor: foil }} />
            <span className='font-heading text-[4.2cqw] italic' style={stamped}>
              a minha história
            </span>
          </div>
        </div>

        {year && (
          <span className='text-[2.6cqw] tracking-[0.25em]' style={stamped}>
            {year}
          </span>
        )}
      </div>
    </div>
  )
}

// Contracapa: o mesmo tecido, com a lombada à direita e a marca discreta no pé
export const BookBack = ({ color = 'verde', className }: { color?: CoverColor; className?: string }) => {
  const { cloth, foil } = coverColors[color]

  return (
    <div
      className={cn('@container relative aspect-[440/622] w-full overflow-hidden', className)}
      style={{ backgroundColor: cloth, backgroundImage: LINEN }}
    >
      <ClothGrain color={color} />
      <span
        aria-hidden='true'
        className='absolute inset-y-0 right-0 w-[5cqw]'
        style={{
          background: 'linear-gradient(to left, rgb(0 0 0 / 0.38), rgb(255 255 255 / 0.07) 55%, rgb(0 0 0 / 0.18))'
        }}
      />
      <span aria-hidden='true' className='absolute inset-y-0 right-[6cqw] w-px bg-black/25' />
      <span
        className='absolute inset-x-0 bottom-[9cqw] text-center text-[2.4cqw] font-medium tracking-[0.32em] uppercase'
        style={{ color: foil, opacity: 0.8 }}
      >
        Lá Vem História
      </span>
    </div>
  )
}

export default BookCover
