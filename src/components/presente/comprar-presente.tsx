'use client'

import { useState, type FormEvent, type ReactNode } from 'react'

import Link from 'next/link'
import { CircleCheckIcon, MailIcon, PrinterIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { pageTitleClassName } from '@/components/app/page-heading'
import CartaoVisual from '@/components/presente/cartao-visual'

import { formatPrice } from '@/lib/lvh/livros'
import {
  createGiftCard,
  GIFT_OPTIONS,
  pricePerMonth,
  savingsOf,
  type GiftCard,
  type GiftDelivery,
  type GiftMonths
} from '@/lib/lvh/presente'
import { cn } from '@/lib/utils'

const MESSAGE_MAX = 240

// Bloco numerado do formulário: o número ajuda a ver o caminho até o pagamento
const Etapa = ({ number, title, children }: { number: number; title: string; children: ReactNode }) => (
  <fieldset className='border-border flex flex-col gap-5 border-t pt-8'>
    <legend className='flex items-center gap-3'>
      <span className='bg-moss text-cream flex size-7 items-center justify-center rounded-full text-sm font-medium'>
        {number}
      </span>
      <span className='font-heading text-xl'>{title}</span>
    </legend>
    {children}
  </fieldset>
)

const optionClassName = (selected: boolean) =>
  cn(
    'flex cursor-pointer flex-col gap-1 rounded-2xl border p-4 text-left transition-colors',
    selected ? 'border-moss bg-moss/5 ring-moss ring-1' : 'border-border hover:border-foreground/40'
  )

// Depois da compra: o cartão pronto, o código e o próximo passo de cada forma de entrega
const Comprado = ({ gift }: { gift: GiftCard }) => (
  <div className='mx-auto flex w-full max-w-2xl flex-col gap-8 py-10'>
    <div className='flex items-start gap-3'>
      <CircleCheckIcon aria-hidden='true' className='fill-moss text-cream mt-1 size-7 shrink-0' />
      <div className='flex flex-col gap-2'>
        <h1 className={pageTitleClassName}>Presente comprado.</h1>
        <p className='text-muted-foreground text-base text-pretty'>
          {gift.delivery === 'email'
            ? `Enviamos o cartão para ${gift.recipientEmail}, e uma cópia para ${gift.buyerEmail}.`
            : `Enviamos o cartão em PDF para ${gift.buyerEmail}. Imprima em casa ou encaminhe para ${gift.recipientName}.`}
        </p>
      </div>
    </div>

    <CartaoVisual
      recipientName={gift.recipientName}
      months={gift.months}
      message={gift.message}
      buyerName={gift.buyerName}
      code={gift.code}
      className='shadow-[0_40px_80px_-40px_rgb(40_30_20/0.55)]'
    />

    <div className='flex flex-col gap-3 sm:flex-row'>
      <Button
        render={<Link href={`/presente/cartao/${gift.code}`} target='_blank' />}
        nativeButton={false}
        variant='moss'
        size='cta'
      >
        <PrinterIcon aria-hidden='true' />
        Abrir o cartão para imprimir
      </Button>
      <Button render={<Link href='/' />} nativeButton={false} variant='outline' size='cta'>
        Voltar ao site
      </Button>
    </div>

    <p className='text-muted-foreground text-xs'>
      Protótipo: nenhum pagamento foi cobrado e nenhum e-mail foi enviado.
    </p>
  </div>
)

// Compra do cartão-presente: quantos meses, para quem, como entregar e quem está dando.
// A prévia do cartão ao lado acompanha o que a pessoa preenche
const ComprarPresente = () => {
  const [months, setMonths] = useState<GiftMonths>(6)
  const [recipientName, setRecipientName] = useState('')
  const [message, setMessage] = useState('')
  const [delivery, setDelivery] = useState<GiftDelivery>('email')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [buyerName, setBuyerName] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [gift, setGift] = useState<GiftCard | null>(null)

  const option = GIFT_OPTIONS.find(item => item.months === months)!

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setPending(true)

    try {
      const created = await createGiftCard({
        months,
        recipientName,
        message,
        delivery,
        recipientEmail,
        buyerName,
        buyerEmail
      })

      setGift(created)
      window.scrollTo({ top: 0 })
    } catch (reason) {
      setError((reason as Error).message)
    }

    setPending(false)
  }

  if (gift) return <Comprado gift={gift} />

  return (
    <div className='grid gap-12 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16'>
      <form onSubmit={submit} className='flex flex-col gap-10'>
        <div className='flex flex-col gap-3'>
          <p className='text-sm font-medium uppercase'>Cartão-presente</p>
          <h1 className={pageTitleClassName}>Dê de presente a chance de contar a própria história.</h1>
          <p className='text-muted-foreground text-base text-pretty'>
            Para a sua mãe, o seu pai ou os seus avós. Quem ganha usa tudo do Lá Vem História pelos meses do presente:
            perguntas, voz, fotos e o livro para a família.
          </p>
        </div>

        <Etapa number={1} title='Quantos meses'>
          <div role='radiogroup' aria-label='Quantos meses' className='grid gap-3 sm:grid-cols-3'>
            {GIFT_OPTIONS.map(item => (
              <button
                key={item.months}
                type='button'
                role='radio'
                aria-checked={months === item.months}
                onClick={() => setMonths(item.months)}
                className={optionClassName(months === item.months)}
              >
                <span className='font-heading text-2xl'>{item.months} meses</span>
                <span className='text-base font-medium tabular-nums'>{formatPrice(item.price)}</span>
                <span className='text-muted-foreground text-xs tabular-nums'>
                  {formatPrice(pricePerMonth(item))} por mês
                  {savingsOf(item) > 0 && ` · ${savingsOf(item)}% a menos`}
                </span>
              </button>
            ))}
          </div>
        </Etapa>

        <Etapa number={2} title='Para quem'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='presente-para'>Nome de quem vai ganhar</Label>
            <Input
              id='presente-para'
              value={recipientName}
              onChange={event => setRecipientName(event.target.value)}
              placeholder='Por exemplo: Vó Lena'
              maxLength={60}
              required
            />
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='presente-mensagem'>Mensagem no cartão (opcional)</Label>
            <Textarea
              id='presente-mensagem'
              value={message}
              onChange={event => setMessage(event.target.value.slice(0, MESSAGE_MAX))}
              placeholder='Quero saber tudo o que você nunca me contou.'
              rows={3}
            />
            <span className='text-muted-foreground self-end text-xs tabular-nums'>
              {message.length}/{MESSAGE_MAX}
            </span>
          </div>
        </Etapa>

        <Etapa number={3} title='Como entregar'>
          <div role='radiogroup' aria-label='Como entregar' className='grid gap-3 sm:grid-cols-2'>
            <button
              type='button'
              role='radio'
              aria-checked={delivery === 'email'}
              onClick={() => setDelivery('email')}
              className={optionClassName(delivery === 'email')}
            >
              <MailIcon aria-hidden='true' className='size-5' strokeWidth={1.75} />
              <span className='text-base font-medium'>Direto no e-mail de quem ganha</span>
              <span className='text-muted-foreground text-sm text-pretty'>
                Enviamos o cartão para a pessoa, e uma cópia para você.
              </span>
            </button>
            <button
              type='button'
              role='radio'
              aria-checked={delivery === 'pdf'}
              onClick={() => setDelivery('pdf')}
              className={optionClassName(delivery === 'pdf')}
            >
              <PrinterIcon aria-hidden='true' className='size-5' strokeWidth={1.75} />
              <span className='text-base font-medium'>Um PDF no meu e-mail</span>
              <span className='text-muted-foreground text-sm text-pretty'>
                Para imprimir e entregar em mãos, ou encaminhar quando quiser.
              </span>
            </button>
          </div>
          {delivery === 'email' && (
            <div className='flex flex-col gap-2'>
              <Label htmlFor='presente-email-para'>E-mail de quem vai ganhar</Label>
              <Input
                id='presente-email-para'
                type='email'
                value={recipientEmail}
                onChange={event => setRecipientEmail(event.target.value)}
                autoComplete='off'
                maxLength={254}
                required
              />
            </div>
          )}
        </Etapa>

        <Etapa number={4} title='Quem está dando'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='presente-de'>Seu nome</Label>
              <Input
                id='presente-de'
                value={buyerName}
                onChange={event => setBuyerName(event.target.value)}
                autoComplete='name'
                maxLength={60}
                required
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='presente-email-de'>Seu e-mail</Label>
              <Input
                id='presente-email-de'
                type='email'
                value={buyerEmail}
                onChange={event => setBuyerEmail(event.target.value)}
                autoComplete='email'
                maxLength={254}
                required
              />
            </div>
          </div>
        </Etapa>

        <div className='border-border flex flex-col gap-4 border-t pt-8'>
          {error && (
            <p role='alert' className='text-destructive text-sm'>
              {error}
            </p>
          )}
          <Button type='submit' variant='honey' size='cta' disabled={pending} className='w-full sm:w-fit'>
            {pending ? 'Finalizando…' : `Pagar ${formatPrice(option.price)}`}
          </Button>
          <p className='text-muted-foreground text-xs'>
            Protótipo: nenhum pagamento é cobrado e nenhum e-mail é enviado.
          </p>
        </div>
      </form>

      {/* Prévia do cartão, presa ao lado enquanto a pessoa preenche */}
      <aside className='flex flex-col gap-4 lg:sticky lg:top-8 lg:self-start'>
        <span className='text-muted-foreground text-sm'>Prévia do cartão</span>
        <CartaoVisual
          recipientName={recipientName.trim() || undefined}
          months={months}
          message={message.trim() || undefined}
          buyerName={buyerName.trim() || undefined}
          className='shadow-[0_40px_80px_-40px_rgb(40_30_20/0.55)]'
        />
        <div className='bg-sand flex items-center justify-between rounded-2xl px-5 py-4'>
          <span className='text-sm'>{months} meses de Lá Vem História</span>
          <span className='text-base font-medium tabular-nums'>{formatPrice(option.price)}</span>
        </div>
      </aside>
    </div>
  )
}

export default ComprarPresente
