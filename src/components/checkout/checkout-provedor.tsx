'use client'

import { useEffect, useState } from 'react'

import { ArrowLeftIcon, CreditCardIcon, LockIcon, QrCodeIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/lvh/livros'
import {
  cancelCheckoutSession,
  getCheckoutSession,
  payCheckoutSession,
  type CheckoutSession,
  type PaymentMethod
} from '@/lib/lvh/pagamento'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })

const methodLabel: Record<PaymentMethod, { label: string; Icon: typeof CreditCardIcon; hint: string }> = {
  cartao: { label: 'Cartão de crédito', Icon: CreditCardIcon, hint: 'Cartão de teste Visa final 4242' },
  pix: { label: 'Pix', Icon: QrCodeIcon, hint: 'QR Code gerado na hora; aprovado em segundos' }
}

// A página do provedor de pagamento, simulada. De propósito, não tem a cara do Lá Vem História: na integração,
// é a página hospedada do provedor escolhido (Stripe Checkout, Mercado Pago, Pagar.me), com a marca dele
const CheckoutProvedor = ({ id }: { id: string }) => {
  const [session, setSession] = useState<CheckoutSession | null | undefined>(undefined)
  const [method, setMethod] = useState<PaymentMethod>('cartao')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    getCheckoutSession(id).then(value => {
      if (active) setSession(value)
    })

    return () => {
      active = false
    }
  }, [id])

  if (session === undefined) return null

  if (!session || session.status !== 'aberta') {
    return (
      <div className='mx-auto flex max-w-md flex-col gap-4 px-6 py-24 text-center'>
        <p className='text-lg font-medium'>Esta sessão de pagamento não está mais aberta.</p>
        <a href={session?.returnUrl ?? '/'} className='text-sm text-neutral-600 underline underline-offset-4'>
          Voltar para o site
        </a>
      </div>
    )
  }

  const pay = async (outcome: 'aprovado' | 'recusado') => {
    setPending(true)
    setError(null)

    const result = await payCheckoutSession(session.id, method, outcome)

    if (result.ok) {
      window.location.assign(result.returnUrl)

      return
    }

    setError(result.error)
    setPending(false)
  }

  const cancel = async () => {
    window.location.assign(await cancelCheckoutSession(session.id))
  }

  const free = session.amountToday === 0

  return (
    <div className='min-h-svh bg-neutral-100 text-neutral-900'>
      {/* Faixa que deixa claro que isto é a simulação do provedor, não uma página de pagamento de verdade */}
      <div className='bg-neutral-900 px-4 py-2 text-center text-xs text-neutral-100'>
        Provedor de pagamento simulado · ambiente de teste · nenhuma cobrança é feita
      </div>

      <div className='mx-auto grid max-w-5xl gap-10 px-6 py-12 md:grid-cols-2 md:gap-16 md:py-20'>
        <div className='flex flex-col gap-8'>
          <button
            type='button'
            onClick={cancel}
            className='flex w-fit cursor-pointer items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900'
          >
            <ArrowLeftIcon className='size-4' aria-hidden='true' />
            Voltar para Lá Vem História
          </button>

          <div className='flex flex-col gap-2'>
            <span className='text-sm text-neutral-600'>{session.description}</span>
            <span className='text-4xl font-semibold tabular-nums'>{formatPrice(session.amountToday)}</span>
            <span className='text-sm text-neutral-600'>a pagar hoje</span>
          </div>

          <dl className='flex flex-col divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white text-sm'>
            <div className='flex justify-between gap-4 px-4 py-3'>
              <dt>Hoje</dt>
              <dd className='tabular-nums'>{formatPrice(session.amountToday)}</dd>
            </div>
            {session.nextCharge && (
              <div className='flex justify-between gap-4 px-4 py-3'>
                <dt>
                  {free ? 'Primeira cobrança' : 'Próxima cobrança'} em {formatDate(session.nextCharge.date)}
                </dt>
                <dd className='tabular-nums'>{formatPrice(session.nextCharge.amount)}</dd>
              </div>
            )}
          </dl>

          {free && (
            <p className='text-sm text-pretty text-neutral-600'>
              Você ainda está no teste grátis. O cartão fica salvo agora e só é cobrado quando o teste acabar.
            </p>
          )}
        </div>

        <div className='flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm md:p-8'>
          <span className='text-base font-medium'>Forma de pagamento</span>

          <div role='radiogroup' aria-label='Forma de pagamento' className='flex flex-col gap-2'>
            {session.methods.map(option => {
              const { label, Icon, hint } = methodLabel[option]

              return (
                <button
                  key={option}
                  type='button'
                  role='radio'
                  aria-checked={method === option}
                  onClick={() => setMethod(option)}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-left',
                    method === option ? 'border-neutral-900 ring-1 ring-neutral-900' : 'border-neutral-200'
                  )}
                >
                  <Icon className='size-5 shrink-0' strokeWidth={1.75} aria-hidden='true' />
                  <span className='flex flex-col'>
                    <span className='text-sm font-medium'>{label}</span>
                    <span className='text-xs text-neutral-500'>{hint}</span>
                  </span>
                </button>
              )
            })}
          </div>

          {session.methods.length === 1 && (
            <p className='text-xs text-pretty text-neutral-500'>
              Cobrança recorrente: só cartão. Pix fica para pagamentos de uma vez, como o anual e o presente.
            </p>
          )}

          {error && (
            <p role='alert' className='rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700'>
              {error}
            </p>
          )}

          <button
            type='button'
            disabled={pending}
            onClick={() => pay('aprovado')}
            className='h-12 cursor-pointer rounded-lg bg-neutral-900 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50'
          >
            {pending
              ? 'Processando…'
              : free
                ? 'Salvar cartão e assinar'
                : method === 'pix'
                  ? `Simular Pix pago · ${formatPrice(session.amountToday)}`
                  : `Pagar ${formatPrice(session.amountToday)}`}
          </button>

          {method === 'cartao' && (
            <button
              type='button'
              disabled={pending}
              onClick={() => pay('recusado')}
              className='cursor-pointer text-xs text-neutral-500 underline underline-offset-4 hover:text-neutral-900'
            >
              Simular cartão recusado
            </button>
          )}

          <p className='flex items-center justify-center gap-1.5 text-xs text-neutral-500'>
            <LockIcon className='size-3' aria-hidden='true' />O cartão é digitado aqui, no provedor, e nunca passa pelo
            Lá Vem História
          </p>
        </div>
      </div>
    </div>
  )
}

export default CheckoutProvedor
