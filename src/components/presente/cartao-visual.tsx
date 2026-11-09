import { cn } from '@/lib/utils'

type CartaoVisualProps = {
  recipientName?: string
  months: number
  message?: string
  buyerName?: string
  code?: string
  className?: string
}

// O cartão-presente, na proporção de um A5 deitado. Tudo em cqw para escalar com a largura:
// o mesmo desenho serve de prévia na compra, de cartão para imprimir e de PDF
const CartaoVisual = ({ recipientName, months, message, buyerName, code, className }: CartaoVisualProps) => (
  <div
    className={cn(
      '@container bg-moss text-cream relative aspect-[210/148] w-full overflow-hidden rounded-[2.4cqw] [print-color-adjust:exact]',
      className
    )}
  >
    {/* Fio dourado por dentro da borda, como num convite */}
    <div aria-hidden='true' className='border-honey/50 absolute inset-[3.2cqw] rounded-[1.4cqw] border' />

    <div className='relative flex h-full flex-col justify-between p-[7cqw]'>
      <div className='flex items-start justify-between gap-[3cqw]'>
        <span className='text-honey text-[1.7cqw] font-medium tracking-[0.3em] uppercase'>Lá Vem História</span>
        <span className='text-cream/70 text-[1.7cqw] tracking-[0.2em] uppercase'>Cartão-presente</span>
      </div>

      <div className='flex flex-col gap-[2cqw]'>
        <p className='font-heading text-[5.6cqw] leading-[1.1] text-balance'>
          {recipientName ? `Um presente para ${recipientName}` : 'Um presente para você'}
        </p>
        <p className='text-cream/85 text-[2.3cqw]'>
          {months} meses para contar a sua história, com a sua voz e as suas fotos.
        </p>
        {message && (
          <p className='font-heading text-cream/90 line-clamp-3 max-w-[80%] text-[2.3cqw] leading-snug italic'>
            “{message}”
          </p>
        )}
        {buyerName && <p className='text-cream/85 text-[2cqw]'>Com carinho, {buyerName}</p>}
      </div>

      <div className='flex items-end justify-between gap-[3cqw]'>
        <div className='flex flex-col gap-[0.8cqw]'>
          <span className='text-cream/70 text-[1.5cqw] tracking-[0.2em] uppercase'>Seu código</span>
          <span className='text-honey font-mono text-[3.4cqw] tracking-[0.12em]'>{code ?? 'LVH-XXXX-XXXX'}</span>
        </div>
        <span className='text-cream/70 max-w-[40%] text-right text-[1.6cqw] text-pretty'>
          Resgate em lavemhistoria.com.br/presente/resgatar
        </span>
      </div>
    </div>
  </div>
)

export default CartaoVisual
