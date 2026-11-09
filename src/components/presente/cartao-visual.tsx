import BookCover from '@/components/livro/book-cover'

import { cn } from '@/lib/utils'

type CartaoVisualProps = {
  recipientName?: string
  months: number
  message?: string
  buyerName?: string
  code?: string
  className?: string
}

// O cartão-presente, na proporção de um A5 deitado, como um cartão de papel: à esquerda, o livro que a pessoa vai
// escrever, com o nome dela na capa; à direita, a dedicatória de quem dá e o código, num canhoto pontilhado.
// Tudo em cqw para escalar com a largura: o mesmo desenho é a prévia da compra, o cartão para imprimir e o PDF
const CartaoVisual = ({ recipientName, months, message, buyerName, code, className }: CartaoVisualProps) => (
  <div
    className={cn(
      '@container bg-page text-foreground relative grid aspect-[210/148] w-full grid-cols-[42fr_58fr] overflow-hidden rounded-[2cqw] ring-1 ring-black/5 [print-color-adjust:exact] print:ring-0',
      className
    )}
  >
    {/* O livro de presente, sobre o verde, levemente inclinado como se estivesse em cima da mesa */}
    <div className='bg-moss relative flex items-center justify-center overflow-hidden'>
      <div
        aria-hidden='true'
        className='absolute inset-0 opacity-60'
        style={{ background: 'radial-gradient(120% 90% at 30% 20%, rgb(255 255 255 / 0.12), transparent 60%)' }}
      />
      <div className='w-[56%] -rotate-[5deg] shadow-[0_2.4cqw_4cqw_-1.2cqw_rgb(0_0_0/0.55)]'>
        <BookCover author={recipientName || 'Você'} color='terracota' />
      </div>
    </div>

    <div className='flex flex-col justify-between px-[5.5cqw] py-[5cqw]'>
      <div className='flex flex-col gap-[2.2cqw]'>
        <span className='text-earth text-[1.5cqw] font-semibold tracking-[0.28em] uppercase'>
          Lá Vem História · Cartão-presente
        </span>
        <p className='font-heading text-[5.4cqw] leading-[1.05] text-balance'>
          {recipientName ? `Para ${recipientName},` : 'Para você,'}
        </p>
        <p className='text-foreground/75 text-[2cqw] leading-snug text-pretty'>
          {months} meses para contar a sua história e ver ela virar um livro, com a sua voz e as suas fotos.
        </p>
        {message && (
          <p className='font-heading text-foreground/90 line-clamp-3 text-[2.3cqw] leading-snug italic'>“{message}”</p>
        )}
        {buyerName && <p className='text-foreground/75 text-[1.9cqw]'>Com carinho, {buyerName}</p>}
      </div>

      {/* Canhoto com o código, como um ingresso */}
      <div className='border-earth/40 flex flex-col gap-[0.8cqw] rounded-[1.2cqw] border border-dashed px-[2.4cqw] py-[1.8cqw]'>
        <span className='text-foreground/60 text-[1.4cqw] tracking-[0.2em] uppercase'>Código do presente</span>
        <span className='text-[3.2cqw] font-semibold tracking-[0.12em] whitespace-nowrap tabular-nums'>
          {code ?? 'LVH-XXXX-XXXX'}
        </span>
        <span className='text-foreground/60 text-[1.4cqw]'>Resgate em lavemhistoria.com.br/presente/resgatar</span>
      </div>
    </div>
  </div>
)

export default CartaoVisual
