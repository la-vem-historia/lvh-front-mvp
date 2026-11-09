import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { MotionPreset } from '@/components/ui/motion-preset'
import { WordsReveal } from '@/components/landing/motion'
import CartaoVisual from '@/components/presente/cartao-visual'

import { formatPrice } from '@/lib/lvh/livros'
import { GIFT_OPTIONS, pricePerMonth, savingsOf } from '@/lib/lvh/presente'

const reveal = {
  fade: true,
  slide: { direction: 'down' as const, offset: 24 },
  transition: { duration: 0.6, ease: 'easeOut' as const }
}

// Cartão-presente: para quem quer que a mãe, o pai ou os avós contem a história deles.
// O cartão de exemplo ao lado mostra o que chega para quem ganha
const Presente = () => (
  <section id='presente' className='scroll-mt-24'>
    <div className='mx-auto grid max-w-7xl gap-16 px-4 py-24 sm:px-6 lg:grid-cols-12 lg:items-center lg:gap-8 lg:px-16 lg:py-32'>
      <MotionPreset {...reveal} className='flex flex-col gap-10 lg:col-span-6'>
        <div className='flex flex-col gap-4'>
          <p className='text-sm font-medium uppercase'>De presente</p>
          <WordsReveal
            as='h2'
            text='O presente que vira um livro.'
            className='font-heading text-display text-balance'
          />
          <p className='text-foreground/80 max-w-xl text-base text-pretty'>
            Dê meses de Lá Vem História para a sua mãe, o seu pai ou os seus avós contarem a história deles. O cartão
            vai direto para o e-mail de quem ganha, ou chega para você em PDF, para imprimir e entregar em mãos.
          </p>
        </div>

        <ul className='grid gap-3 sm:grid-cols-3'>
          {GIFT_OPTIONS.map(option => (
            <li key={option.months} className='bg-sand flex flex-col gap-1 rounded-2xl p-5'>
              <span className='font-heading text-2xl'>{option.months} meses</span>
              <span className='text-base font-medium tabular-nums'>{formatPrice(option.price)}</span>
              <span className='text-muted-foreground text-xs tabular-nums'>
                {formatPrice(pricePerMonth(option))} por mês
                {savingsOf(option) > 0 && ` · ${savingsOf(option)}% a menos`}
              </span>
            </li>
          ))}
        </ul>

        <div className='flex flex-col items-start gap-4 sm:flex-row sm:items-center'>
          <Button render={<Link href='/presente' />} nativeButton={false} variant='honey' size='cta'>
            Dar de presente
          </Button>
          <Link
            href='/presente/resgatar'
            className='text-muted-foreground hover:text-foreground text-sm underline underline-offset-4 transition-colors'
          >
            Ganhou um presente? Resgate o seu código
          </Link>
        </div>
      </MotionPreset>

      <MotionPreset {...reveal} delay={0.15} className='lg:col-span-5 lg:col-start-8'>
        <CartaoVisual
          recipientName='Vó Lena'
          months={6}
          message='Quero saber tudo o que você nunca me contou.'
          buyerName='Ana'
          code='LVH-7KQ2-M9XA'
          className='-rotate-2 shadow-[0_50px_100px_-40px_rgb(40_30_20/0.55)]'
        />
      </MotionPreset>
    </div>
  </section>
)

export default Presente
