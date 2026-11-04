import { PAPER_STYLE } from '@/lib/lvh/paper'
import { cn } from '@/lib/utils'

const INK = '#2f2a24'

// Miniatura do livro aberto na dedicatória: ela na página da esquerda e a folha de rosto
// à direita, como no livro de verdade. Tudo em cqw para escalar com a largura
const DedicationPreview = ({
  dedication,
  author,
  placeholder,
  className
}: {
  dedication: string
  author: string
  placeholder: string
  className?: string
}) => {
  const empty = !dedication.trim()

  return (
    <div
      aria-hidden='true'
      className={cn('flex shadow-[0_22px_34px_-16px_rgb(50_38_24/0.55)]', className)}
      style={{ color: INK }}
    >
      {/* Página da esquerda: dedicatória */}
      <div
        className='@container relative aspect-[440/622] flex-1 shadow-[-2px_1px_0_-0.5px_#f5f0e3,-3.5px_2px_0_-0.5px_#e6dfcd]'
        style={PAPER_STYLE}
      >
        <div className='flex h-full items-start justify-center px-[14cqw] pt-[30%] text-center'>
          <p
            className={cn(
              'font-heading text-[6.4cqw] leading-[1.45] break-words whitespace-pre-line italic transition-opacity',
              empty && 'opacity-35'
            )}
          >
            {empty ? placeholder : dedication}
          </p>
        </div>
        <span
          className='absolute inset-y-0 right-0 w-[14%]'
          style={{
            background: 'linear-gradient(to left, rgb(60 45 30 / 0.16), rgb(60 45 30 / 0.04) 40%, transparent)'
          }}
        />
      </div>

      {/* Página da direita: folha de rosto */}
      <div
        className='@container relative aspect-[440/622] flex-1 shadow-[2px_1px_0_-0.5px_#f5f0e3,3.5px_2px_0_-0.5px_#e6dfcd]'
        style={PAPER_STYLE}
      >
        <div className='flex h-full flex-col items-center px-[10cqw] pt-[10cqw] pb-[8cqw] text-center'>
          <div className='flex flex-1 flex-col items-center justify-center gap-[3cqw]'>
            <span className='font-heading text-[8cqw] leading-[1.1] text-balance'>{author}</span>
            <span className='bg-earth h-px w-[8cqw]' />
            <span className='font-heading text-[4cqw] text-[#6b6156] italic'>a minha história</span>
          </div>
          <span className='text-[2cqw] font-medium tracking-[0.25em] text-[#9a8f80] uppercase'>Lá Vem História</span>
        </div>
        <span
          className='absolute inset-y-0 left-0 w-[14%]'
          style={{
            background: 'linear-gradient(to right, rgb(60 45 30 / 0.2), rgb(60 45 30 / 0.05) 40%, transparent)'
          }}
        />
      </div>
    </div>
  )
}

export default DedicationPreview
