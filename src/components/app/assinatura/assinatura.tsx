'use client'

import { useCallback, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import Section from '@/components/app/section'
import { pageTitleClassName, textLinkClassName } from '@/components/app/page-heading'
import ResgatarPresente from '@/components/app/resgatar-presente'
import { useAccess, useAssinaturaActions, type AssinaturaActions } from '@/components/app/assinatura/acesso'
import CartaoAssinatura from '@/components/app/assinatura/cartao-assinatura'
import { Assinar } from '@/components/app/assinatura/paywall'
import RetornoCheckout from '@/components/app/assinatura/retorno-checkout'

import { getBilling, setExtraSlots } from '@/lib/lvh/api'
import { PLAN_PRICES, isSubscriber, type Access } from '@/lib/lvh/assinatura'
import { formatPrice } from '@/lib/lvh/livros'
import { formatGiftDate } from '@/lib/lvh/presente'
import type { Billing } from '@/lib/lvh/types'

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`

// O plano: o cartão com a situação e, para quem ainda não assina (teste, presente, encerrada), a escolha do plano
export const PlanoAtual = ({ access, actions }: { access: Access; actions: AssinaturaActions }) => (
  <div className='flex flex-col gap-6'>
    <CartaoAssinatura access={access} actions={actions} />
    {!isSubscriber(access) && <Assinar access={access} actions={actions} />}
  </div>
)

// Vagas: a assinatura cobre um livro em andamento; cada vaga a mais é outro ao mesmo tempo
const Vagas = ({ billing, onChange }: { billing: Billing; onChange: () => void }) => {
  const [error, setError] = useState<string | null>(null)
  const freeSlots = billing.slots - billing.inProgress

  const changeSlots = async (extraSlots: number) => {
    try {
      setError(null)
      await setExtraSlots(extraSlots)
      onChange()
    } catch (reason) {
      setError((reason as Error).message)
    }
  }

  return (
    <div className='flex flex-col gap-3'>
      <p className='text-base'>
        {plural(billing.inProgress, 'livro em andamento', 'livros em andamento')} de{' '}
        {plural(billing.slots, 'vaga', 'vagas')}
      </p>
      <div className='flex flex-wrap items-center gap-4'>
        <Button type='button' variant='outline' size='md' onClick={() => changeSlots(billing.extraSlots + 1)}>
          Adicionar vaga · +{formatPrice(billing.extraPrice)}/mês
        </Button>
        {billing.extraSlots > 0 && freeSlots > 0 && (
          <button type='button' onClick={() => changeSlots(billing.extraSlots - 1)} className={textLinkClassName}>
            Tirar uma vaga livre
          </button>
        )}
      </div>
      {error && (
        <p role='alert' className='text-destructive text-sm'>
          {error}
        </p>
      )}
    </div>
  )
}

// Quanto sai por mês: a assinatura, as vagas a mais e o desconto do presente
const Valores = ({ billing, access }: { billing: Billing; access: Access }) => {
  // No anual, a assinatura sai R$ 24,90 por mês; as vagas a mais custam o mesmo nos dois planos
  const annual =
    (access.kind === 'ativa' || access.kind === 'cancelamento-agendado' || access.kind === 'pagamento-recusado') &&
    access.interval === 'anual'
  const base = annual ? PLAN_PRICES.anualPorMes : billing.base
  const total = base + billing.extraSlots * billing.extraPrice

  return (
    <div className='flex flex-col gap-3'>
      <ul className='border-border flex flex-col rounded-2xl border'>
        <li className='flex items-center justify-between gap-4 px-5 py-4 text-sm'>
          <span>
            Assinatura{annual && ' anual'}
            <span className='text-muted-foreground'> · inclui 1 livro em andamento</span>
          </span>
          <span className='tabular-nums'>{formatPrice(base)}</span>
        </li>
        {billing.extraSlots > 0 && (
          <li className='border-border flex items-center justify-between gap-4 border-t px-5 py-4 text-sm'>
            <span>
              {plural(billing.extraSlots, 'vaga a mais', 'vagas a mais')}
              <span className='text-muted-foreground'> · {formatPrice(billing.extraPrice)} cada</span>
            </span>
            <span className='tabular-nums'>{formatPrice(billing.extraSlots * billing.extraPrice)}</span>
          </li>
        )}
        {billing.giftUntil && (
          <li className='border-border flex items-center justify-between gap-4 border-t px-5 py-4 text-sm'>
            <span>
              Presente
              <span className='text-muted-foreground'> · até {formatGiftDate(billing.giftUntil)}</span>
            </span>
            <span className='tabular-nums'>−{formatPrice(base)}</span>
          </li>
        )}
        <li className='border-foreground flex items-center justify-between gap-4 border-t px-5 py-4 text-base font-medium'>
          <span>Total por mês</span>
          <span className='tabular-nums'>{formatPrice(billing.giftUntil ? total - base : total)}</span>
        </li>
      </ul>
      {annual && (
        <p className='text-muted-foreground text-xs'>
          No anual, os {formatPrice(PLAN_PRICES.anual)} da assinatura são cobrados de uma vez, na renovação.
        </p>
      )}
      <p className='text-muted-foreground text-xs'>Protótipo: nenhuma cobrança é feita.</p>
    </div>
  )
}

// /app/assinatura, no menu da conta: o plano, as vagas, o presente e quanto custa. Os avisos do topo trazem para cá
const Assinatura = ({ checkoutId, checkoutCanceled }: { checkoutId?: string; checkoutCanceled?: boolean }) => {
  const { access, refresh } = useAccess()
  const actions = useAssinaturaActions()
  const [billing, setBilling] = useState<Billing | null>(null)

  const load = useCallback(() => {
    getBilling().then(setBilling)
  }, [])

  useEffect(load, [load])

  if (!access || !billing) return null

  // Um presente resgatado muda o estado (teste vira presente): relê a assinatura junto com os valores
  const reload = () => {
    load()
    refresh()
  }

  return (
    <div className='mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-10 sm:px-6 lg:px-16 lg:py-16'>
      <h1 className={pageTitleClassName}>Assinatura</h1>

      {checkoutId && <RetornoCheckout checkoutId={checkoutId} canceled={Boolean(checkoutCanceled)} />}

      <Section id='plano' title='Seu plano' description='Como está a sua assinatura, quanto custa e quando cobra.'>
        <PlanoAtual access={access} actions={actions} />
      </Section>

      <Section
        id='vagas'
        title='Livros ao mesmo tempo'
        description='A assinatura cobre um livro em andamento. Para escrever dois ao mesmo tempo, adicione uma vaga. Livro concluído não ocupa vaga.'
      >
        <Vagas billing={billing} onChange={load} />
      </Section>

      <Section id='presente' title='Presente' description='Ganhou meses de assinatura de presente? Digite o código aqui.'>
        <ResgatarPresente giftUntil={billing.giftUntil} onChange={reload} />
      </Section>

      <Section id='valores' title='Valores' description='Quanto você paga por mês, com as vagas e o presente.'>
        <Valores billing={billing} access={access} />
      </Section>
    </div>
  )
}

export default Assinatura
