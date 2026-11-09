import Simbolo from '@/components/landing/simbolo'

import { cn } from '@/lib/utils'

type CartaoVersoProps = {
  recipientName?: string
  months: number
  message?: string
  buyerName?: string
  code?: string
  className?: string
}

// Verso do cartão-presente: todo verde-musgo, o mesmo verde da estampa da frente, com os detalhes em mel da faixa.
// É aqui que fica o que a pessoa preenche: para quem, a mensagem, quem dá e o código
const CartaoVerso = ({ recipientName, months, message, buyerName, code, className }: CartaoVersoProps) => (
  <div
    className={cn(
      '@container bg-moss text-cream relative aspect-[85.6/54] w-full overflow-hidden rounded-[5%/8%] text-left [print-color-adjust:exact]',
      className
    )}
  >
    {/* O padding fica no miolo: em cqw no próprio container ele seria medido contra a tela, não contra o cartão */}
    <div className='absolute inset-0 flex flex-col px-[7cqw] py-[6cqw]'>
      <div className='flex items-center justify-between gap-[3cqw]'>
        <Simbolo className='text-cream h-[7.6cqw] w-auto -translate-x-[1.6cqw]' />
        <span className='text-honey text-[2.8cqw] font-semibold tracking-[0.2em] uppercase'>{months} meses</span>
      </div>

      <div className='flex min-h-0 flex-1 flex-col gap-[1.6cqw] py-[2.8cqw]'>
        <p className='font-heading text-[6.4cqw] leading-[1.1] text-balance'>
          {recipientName ? `Para ${recipientName}` : 'Para você'}
        </p>
        {message ? (
          <p className='font-heading line-clamp-2 text-[3.4cqw] leading-snug break-words italic'>“{message}”</p>
        ) : (
          <p className='text-cream/70 text-[2.7cqw] leading-snug text-pretty'>
            {months} meses para contar a sua história e ver ela virar um livro.
          </p>
        )}
        {buyerName && <p className='text-cream/80 text-[2.6cqw]'>Com carinho, {buyerName}</p>}
      </div>

      <div className='border-cream/20 flex items-end justify-between gap-[3cqw] border-t pt-[3cqw]'>
        <div className='flex flex-col gap-[0.6cqw]'>
          <span className='text-cream/60 text-[1.9cqw] tracking-[0.2em] uppercase'>Código para resgate</span>
          <span className='text-honey text-[4.4cqw] font-semibold tracking-[0.1em] whitespace-nowrap tabular-nums'>
            {code ?? 'LVH-XXXX-XXXX'}
          </span>
        </div>
        <span className='text-right text-[2.1cqw] leading-snug'>
          Resgate em:
          <br />
          lavemhistoria.com.br/presente
        </span>
      </div>
    </div>
  </div>
)

export default CartaoVerso
