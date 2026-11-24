'use client'

import { useState, type ReactNode } from 'react'

import { CreditCardIcon, TriangleAlertIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { textLinkClassName } from '@/components/app/page-heading'
import type { AssinaturaActions } from '@/components/app/assinatura/acesso'

import { ANNUAL_SAVINGS, PLAN_PRICES, formatDay, type Access, type Card } from '@/lib/lvh/assinatura'
import { formatPrice } from '@/lib/lvh/livros'
import { cn } from '@/lib/utils'

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`

const priceLine = (interval: 'mensal' | 'anual') =>
  interval === 'anual'
    ? `${formatPrice(PLAN_PRICES.anual)} por ano · ${formatPrice(PLAN_PRICES.anualPorMes)}/mês`
    : `${formatPrice(PLAN_PRICES.mensal)} por mês`

const CardLine = ({ card, refused }: { card?: Card; refused?: boolean }) =>
  card ? (
    <span className={cn('flex items-center gap-2', refused && 'text-clay')}>
      <CreditCardIcon aria-hidden='true' className='size-4' strokeWidth={1.75} />
      {card.brand} final {card.last4}
      {refused && ' · recusado'}
    </span>
  ) : null

// Cabeçalho do cartão: o plano (ou a falta dele), uma etiqueta de situação e as linhas de detalhe
const Frame = ({
  title,
  badge,
  badgeClassName,
  children
}: {
  title: string
  badge: string
  badgeClassName: string
  children: ReactNode
}) => (
  <div className='border-border flex flex-col gap-5 rounded-2xl border p-6'>
    <div className='flex flex-wrap items-center justify-between gap-3'>
      <span className='font-heading text-2xl'>{title}</span>
      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', badgeClassName)}>{badge}</span>
    </div>
    {children}
  </div>
)

const Detail = ({ children }: { children: ReactNode }) => (
  <div className='text-muted-foreground flex flex-col gap-1.5 text-sm'>{children}</div>
)

// Cancelar: diz o que acontece antes de confirmar. Sem botão vermelho na porta de entrada, só um link
const Cancelar = ({ access, actions }: { access: Extract<Access, { kind: 'ativa' }>; actions: AssinaturaActions }) => {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  if (!open) {
    return (
      <button type='button' onClick={() => setOpen(true)} className={cn(textLinkClassName, 'w-fit')}>
        Cancelar assinatura
      </button>
    )
  }

  return (
    <div className='flex flex-col gap-4'>
      <div role='alert' className='bg-sand flex gap-3 rounded-2xl p-4 text-sm text-pretty'>
        <TriangleAlertIcon className='text-clay mt-0.5 size-4 shrink-0' aria-hidden='true' />
        <p>
          Tudo continua liberado até <strong className='font-medium'>{formatDay(access.renewsAt)}</strong>. Depois, o
          livro fica fechado para edição: dá para ler, compartilhar e baixar, mas não escrever, gravar ou trocar fotos.
          {access.interval === 'anual' && ' Os meses do anual já pagos não são devolvidos.'} Você pode voltar a assinar
          quando quiser, e nada se perde.
        </p>
      </div>
      <div className='flex flex-wrap items-center gap-4'>
        <Button
          type='button'
          variant='destructive'
          size='md'
          disabled={pending}
          onClick={async () => {
            setPending(true)
            await actions.cancelRenewal()
            setPending(false)
            setOpen(false)
          }}
        >
          Cancelar a renovação
        </Button>
        <button type='button' onClick={() => setOpen(false)} className={textLinkClassName}>
          Continuar assinando
        </button>
      </div>
    </div>
  )
}

// No mensal: o convite para o anual. Mostra a conta em reais e quando a troca vale
const ConviteAnual = ({ access, actions }: { access: Extract<Access, { kind: 'ativa' }>; actions: AssinaturaActions }) => {
  const [pending, setPending] = useState(false)

  if (access.nextInterval === 'anual') {
    return (
      <div className='bg-honey/25 flex flex-col gap-3 rounded-2xl p-5 text-sm'>
        <p className='text-pretty'>
          <strong className='font-medium'>Muda para o anual em {formatDay(access.renewsAt)}.</strong> Nesse dia,{' '}
          {formatPrice(PLAN_PRICES.anual)} são cobrados de uma vez, e você passa a economizar{' '}
          {formatPrice(ANNUAL_SAVINGS)} por ano.
        </p>
        <button
          type='button'
          onClick={() => actions.changeInterval('mensal')}
          className={cn(textLinkClassName, 'w-fit')}
        >
          Continuar no mensal
        </button>
      </div>
    )
  }

  return (
    <div className='bg-honey/25 flex flex-col gap-4 rounded-2xl p-5'>
      <div className='flex flex-col gap-1'>
        <p className='text-base font-medium'>Economize {formatPrice(ANNUAL_SAVINGS)} por ano no anual</p>
        <p className='text-sm text-pretty'>
          Sai {formatPrice(PLAN_PRICES.anualPorMes)} por mês em vez de {formatPrice(PLAN_PRICES.mensal)}, o mesmo que
          dois meses grátis. A troca vale a partir de {formatDay(access.renewsAt)}, sem cobrar de novo o mês que você já
          pagou.
        </p>
      </div>
      <Button
        type='button'
        variant='honey'
        size='md'
        disabled={pending}
        className='w-fit'
        onClick={async () => {
          setPending(true)
          await actions.changeInterval('anual')
          setPending(false)
        }}
      >
        Mudar para o anual
      </Button>
    </div>
  )
}

// O plano na página Assinatura: como está, quanto custa, quando cobra e o que dá para fazer
const CartaoAssinatura = ({ access, actions }: { access: Access; actions: AssinaturaActions }) => {
  switch (access.kind) {
    case 'trial':
    case 'trial-acabando':
      return (
        <Frame
          title='Teste grátis'
          badge={access.kind === 'trial' ? 'Em teste' : 'Acabando'}
          badgeClassName={access.kind === 'trial' ? 'bg-sand' : 'bg-honey'}
        >
          <Detail>
            <span>
              Faltam {plural(access.daysLeft, 'dia', 'dias')} ou {plural(access.answersLeft, 'resposta', 'respostas')},
              o que vier primeiro.
            </span>
            <span>Assine antes de acabar para não parar no meio. A primeira cobrança é só em {formatDay(access.endsAt)}.</span>
          </Detail>
        </Frame>
      )

    case 'trial-encerrado':
    case 'expirada':
      return (
        <Frame title='Sem assinatura' badge='Fechado para edição' badgeClassName='bg-moss text-cream'>
          <Detail>
            <span>
              {access.kind === 'trial-encerrado'
                ? 'O teste grátis acabou.'
                : `A assinatura terminou em ${formatDay(access.endedAt)}.`}{' '}
              O livro continua online para ler, compartilhar e baixar. Para escrever de novo, escolha um plano abaixo.
            </span>
          </Detail>
        </Frame>
      )

    case 'presente':
      return (
        <Frame title='Presente' badge={access.ending ? 'Acabando' : 'Pago'} badgeClassName={access.ending ? 'bg-honey' : 'bg-sand'}>
          <Detail>
            <span>A assinatura está paga até {formatDay(access.until)}. Depois, só continua se você quiser.</span>
          </Detail>
        </Frame>
      )

    case 'ativa':
      return (
        <Frame
          title={access.interval === 'anual' ? 'Plano anual' : 'Plano mensal'}
          badge='Ativa'
          badgeClassName='bg-olive text-cream'
        >
          <Detail>
            <span className='text-foreground'>{priceLine(access.interval)}</span>
            <span>
              {access.interval === 'anual' ? 'Renova' : 'Próxima cobrança'} em {formatDay(access.renewsAt)}
            </span>
            <CardLine card={access.card} />
          </Detail>
          {access.interval === 'mensal' && <ConviteAnual access={access} actions={actions} />}
          {access.interval === 'anual' && access.nextInterval === 'mensal' && (
            <p className='text-muted-foreground text-sm'>
              Passa para o mensal em {formatDay(access.renewsAt)}.{' '}
              <button type='button' onClick={() => actions.changeInterval('anual')} className='underline underline-offset-4'>
                Continuar no anual
              </button>
            </p>
          )}
          {access.interval === 'anual' && access.nextInterval !== 'mensal' && (
            <button type='button' onClick={() => actions.changeInterval('mensal')} className={cn(textLinkClassName, 'w-fit')}>
              Mudar para o mensal na renovação
            </button>
          )}
          <Cancelar access={access} actions={actions} />
        </Frame>
      )

    case 'cancelamento-agendado':
      return (
        <Frame
          title={access.interval === 'anual' ? 'Plano anual' : 'Plano mensal'}
          badge='Não vai renovar'
          badgeClassName='bg-sand'
        >
          <Detail>
            <span>
              A assinatura termina em {formatDay(access.endsAt)}
              {access.daysLeft > 0 && ` (${plural(access.daysLeft, 'dia', 'dias')})`}. Até lá, tudo continua liberado;
              depois, o livro fica fechado para edição.
            </span>
          </Detail>
          <Button type='button' variant='honey' size='md' className='w-fit' onClick={() => actions.keepSubscription()}>
            Manter assinatura
          </Button>
        </Frame>
      )

    case 'pagamento-recusado':
      return (
        <Frame
          title={access.interval === 'anual' ? 'Plano anual' : 'Plano mensal'}
          badge='Pagamento recusado'
          badgeClassName='bg-clay text-cream'
        >
          <Detail>
            <CardLine card={access.card} refused />
            <span>
              Vamos tentar de novo nos próximos dias. Se não passar até {formatDay(access.graceUntil)}, a renovação para e
              o livro fica fechado para edição.
            </span>
          </Detail>
          <Button type='button' variant='default' size='md' className='w-fit' onClick={() => actions.updatePaymentMethod()}>
            Usar outro cartão
          </Button>
        </Frame>
      )
  }
}

export default CartaoAssinatura
