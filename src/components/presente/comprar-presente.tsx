'use client'

import { useState, type FormEvent } from 'react'

import Link from 'next/link'
import { CircleCheckIcon, MailIcon, PrinterIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { pageTitleClassName } from '@/components/app/page-heading'
import CartaoDuplo from '@/components/presente/cartao-duplo'
import SeloMaisEscolhido from '@/components/presente/selo-mais-escolhido'

import { formatPrice } from '@/lib/lvh/livros'
import {
  createGiftCard,
  FEATURED_MONTHS,
  GIFT_OPTIONS,
  monthsLabel,
  pricePerMonth,
  savingsOf,
  type GiftCard,
  type GiftDelivery,
  type GiftMonths
} from '@/lib/lvh/presente'
import { cn } from '@/lib/utils'

// Uma mensagem comum cabe em duas linhas no verso do cartão; palavras longas ainda têm a terceira de folga
const MESSAGE_MAX = 90

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

    <CartaoDuplo
      recipientName={gift.recipientName}
      months={gift.months}
      message={gift.message}
      buyerName={gift.buyerName}
      code={gift.code}
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

const PASSOS = [
  {
    title: 'Quantos meses de presente?',
    hint: 'Quanto mais meses, menor o preço por mês. Dá tempo de sobra para contar a vida inteira.'
  },
  {
    title: 'Para quem é o presente?',
    hint: 'O nome vai no cartão. A mensagem é opcional, mas costuma ser a parte que mais emociona.'
  },
  { title: 'Como o cartão chega?', hint: 'Você escolhe se a pessoa recebe direto ou se prefere entregar em mãos.' },
  { title: 'Quem está dando?', hint: 'Seu nome vai no cartão, e o comprovante chega no seu e-mail.' }
] as const

// Compra do cartão-presente, um passo de cada vez: quantos meses, para quem, como entregar e quem está dando.
// A prévia do cartão fica ao lado o tempo todo e acompanha o que a pessoa preenche
const ComprarPresente = ({ initialMonths }: { initialMonths: GiftMonths }) => {
  const [step, setStep] = useState(0)
  const [months, setMonths] = useState<GiftMonths>(initialMonths)
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
  const last = step === PASSOS.length - 1

  // Cada passo valida só os próprios campos (o navegador cuida dos obrigatórios) antes de seguir
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!last) {
      setStep(current => current + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

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

  const passo = PASSOS[step]

  return (
    <div className='grid gap-16 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-24 lg:py-20'>
      <form onSubmit={submit} className='flex max-w-xl flex-col gap-12'>
        {/* Onde a pessoa está: passo atual e uma barra fina com o caminho até o fim */}
        <div className='flex flex-col gap-4'>
          <div className='text-muted-foreground flex items-center justify-between text-sm'>
            <span>Cartão-presente</span>
            <span className='tabular-nums'>
              Passo {step + 1} de {PASSOS.length}
            </span>
          </div>
          <div className='bg-sand h-1 overflow-hidden rounded-full'>
            <div
              className='bg-moss h-full rounded-full transition-[width] duration-500 ease-out'
              style={{ width: `${((step + 1) / PASSOS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* key: cada passo entra com um fade suave */}
        <div key={step} className='animate-in fade-in slide-in-from-bottom-2 flex flex-col gap-10 duration-500'>
          <div className='flex flex-col gap-3'>
            <h1 className={pageTitleClassName}>{passo.title}</h1>
            <p className='text-muted-foreground text-base text-pretty'>{passo.hint}</p>
          </div>

          {step === 0 && (
            <div role='radiogroup' aria-label='Quantos meses' className='flex flex-col gap-4 pt-3'>
              {GIFT_OPTIONS.map(item => (
                <button
                  key={item.months}
                  type='button'
                  role='radio'
                  aria-checked={months === item.months}
                  onClick={() => setMonths(item.months)}
                  className={cn(
                    optionClassName(months === item.months),
                    'relative flex-row items-center justify-between gap-6 px-6 py-5'
                  )}
                >
                  {item.months === FEATURED_MONTHS && <SeloMaisEscolhido className='left-6 right-auto' />}
                  <span className='flex flex-col gap-1'>
                    <span className='font-heading text-2xl'>{monthsLabel(item.months)}</span>
                    <span className='text-muted-foreground text-sm tabular-nums'>
                      {formatPrice(pricePerMonth(item))} por mês
                      {savingsOf(item) > 0 && ` · ${savingsOf(item)}% a menos`}
                    </span>
                  </span>
                  <span className='text-lg font-medium tabular-nums'>{formatPrice(item.price)}</span>
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className='flex flex-col gap-8'>
              <div className='flex flex-col gap-3'>
                <Label htmlFor='presente-para'>Nome de quem vai ganhar</Label>
                <Input
                  id='presente-para'
                  value={recipientName}
                  onChange={event => setRecipientName(event.target.value)}
                  placeholder='Por exemplo: Vó Lena'
                  maxLength={60}
                  autoFocus
                  required
                />
              </div>
              <div className='flex flex-col gap-3'>
                <Label htmlFor='presente-mensagem'>Mensagem no cartão (opcional)</Label>
                <Textarea
                  id='presente-mensagem'
                  value={message}
                  onChange={event => setMessage(event.target.value.slice(0, MESSAGE_MAX))}
                  placeholder='Quero saber tudo o que você nunca me contou.'
                  rows={2}
                />
                <span className='text-muted-foreground self-end text-xs tabular-nums'>
                  {message.length}/{MESSAGE_MAX}
                </span>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className='flex flex-col gap-8'>
              <div role='radiogroup' aria-label='Como entregar' className='flex flex-col gap-4'>
                {(
                  [
                    {
                      value: 'email',
                      Icon: MailIcon,
                      title: 'Direto no e-mail de quem ganha',
                      text: 'Enviamos o cartão para a pessoa, e uma cópia para você.'
                    },
                    {
                      value: 'pdf',
                      Icon: PrinterIcon,
                      title: 'Um PDF no meu e-mail',
                      text: 'Para imprimir e entregar em mãos, ou encaminhar quando quiser.'
                    }
                  ] as const
                ).map(({ value, Icon, title, text }) => (
                  <button
                    key={value}
                    type='button'
                    role='radio'
                    aria-checked={delivery === value}
                    onClick={() => setDelivery(value)}
                    className={cn(optionClassName(delivery === value), 'flex-row items-start gap-4 px-6 py-5')}
                  >
                    <Icon aria-hidden='true' className='mt-0.5 size-5 shrink-0' strokeWidth={1.75} />
                    <span className='flex flex-col gap-1'>
                      <span className='text-base font-medium'>{title}</span>
                      <span className='text-muted-foreground text-sm text-pretty'>{text}</span>
                    </span>
                  </button>
                ))}
              </div>
              {delivery === 'email' && (
                <div className='flex flex-col gap-3'>
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
            </div>
          )}

          {step === 3 && (
            <div className='flex flex-col gap-8'>
              <div className='flex flex-col gap-3'>
                <Label htmlFor='presente-de'>Seu nome</Label>
                <Input
                  id='presente-de'
                  value={buyerName}
                  onChange={event => setBuyerName(event.target.value)}
                  autoComplete='name'
                  maxLength={60}
                  autoFocus
                  required
                />
              </div>
              <div className='flex flex-col gap-3'>
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

              {/* Resumo antes de pagar */}
              <div className='bg-sand flex flex-col gap-3 rounded-2xl px-6 py-5 text-sm'>
                <div className='flex items-center justify-between gap-4'>
                  <span>
                    {monthsLabel(months)} de Lá Vem História para {recipientName || 'quem vai ganhar'}
                  </span>
                  <span className='text-base font-medium tabular-nums'>{formatPrice(option.price)}</span>
                </div>
                <span className='text-muted-foreground'>
                  {delivery === 'email' ? `Enviado para ${recipientEmail}` : 'PDF no seu e-mail, para imprimir'}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className='flex flex-col gap-4'>
          {error && (
            <p role='alert' className='text-destructive text-sm'>
              {error}
            </p>
          )}
          <div className='flex flex-col-reverse gap-3 sm:flex-row sm:items-center'>
            {step > 0 && (
              <Button type='button' variant='outline' size='cta' onClick={() => setStep(current => current - 1)}>
                Voltar
              </Button>
            )}
            <Button type='submit' variant={last ? 'honey' : 'moss'} size='cta' disabled={pending}>
              {last ? (pending ? 'Finalizando…' : `Pagar ${formatPrice(option.price)}`) : 'Continuar'}
            </Button>
          </div>
          {last && (
            <p className='text-muted-foreground text-xs'>
              Protótipo: nenhum pagamento é cobrado e nenhum e-mail é enviado.
            </p>
          )}
        </div>
      </form>

      {/* Prévia do cartão, presa ao lado enquanto a pessoa preenche */}
      <aside className='flex flex-col gap-6 lg:sticky lg:top-12 lg:self-start'>
        <span className='text-muted-foreground text-sm'>Prévia do cartão</span>
        <CartaoDuplo
          recipientName={recipientName.trim() || undefined}
          months={months}
          message={message.trim() || undefined}
          buyerName={buyerName.trim() || undefined}
        />
        <div className='border-border flex items-center justify-between border-t pt-5'>
          <span className='text-sm'>{monthsLabel(months)} de Lá Vem História</span>
          <span className='text-base font-medium tabular-nums'>{formatPrice(option.price)}</span>
        </div>
      </aside>
    </div>
  )
}

export default ComprarPresente
