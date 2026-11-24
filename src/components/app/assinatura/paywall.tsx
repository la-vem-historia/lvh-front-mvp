'use client'

import { useState, type ReactNode } from 'react'

import Link from 'next/link'
import {
  BookOpenIcon,
  CircleCheckIcon,
  CreditCardIcon,
  DownloadIcon,
  ImageIcon,
  MicIcon,
  Share2Icon,
  UsersIcon
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import PageHeading from '@/components/app/page-heading'
import EscolherPlano from '@/components/app/assinatura/escolher-plano'
import CartaoAssinatura from '@/components/app/assinatura/cartao-assinatura'
import type { AssinaturaActions } from '@/components/app/assinatura/acesso'

import { TRIAL_DAYS } from '@/components/landing/teste-gratis'

import { PLAN_PRICES, formatDay, type Access, type PlanInterval } from '@/lib/lvh/assinatura'
import { formatPrice } from '@/lib/lvh/livros'

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`

// O que vem na assinatura, curto: o que faz o livro valer
const included: { label: string; Icon: LucideIcon }[] = [
  { label: 'Mais de 300 perguntas guiadas', Icon: BookOpenIcon },
  { label: 'Fotos ao lado das histórias', Icon: ImageIcon },
  { label: 'Sua voz gravada dentro do livro', Icon: MicIcon },
  { label: 'A família respondendo junto', Icon: UsersIcon },
  { label: 'Leitura para quantas pessoas quiser', Icon: Share2Icon },
  { label: 'PDF para imprimir e EPUB para Kindle', Icon: DownloadIcon }
]

// Quem está travado precisa ouvir primeiro que nada se perdeu, antes do preço
const kept = (answered: number) => [
  `${plural(answered, 'resposta guardada', 'respostas guardadas')}, com as fotos e as gravações`,
  'O livro continua online para quem você convidou',
  'Você pode baixar tudo quando quiser'
]

const List = ({ items }: { items: { label: string; Icon: LucideIcon }[] }) => (
  <ul className='flex flex-col'>
    {items.map(({ label, Icon }) => (
      <li key={label} className='border-border flex items-start gap-3 border-t py-3 text-sm first:border-t-0'>
        <Icon aria-hidden='true' className='mt-0.5 size-4 shrink-0' strokeWidth={1.75} />
        <span className='text-pretty'>{label}</span>
      </li>
    ))}
  </ul>
)

type Copy = { eyebrow: string; title: string; line: ReactNode; locked?: boolean }

const copyOf = (access: Access): Copy => {
  switch (access.kind) {
    case 'trial':
    case 'trial-acabando':
      return {
        eyebrow: 'Assinatura',
        title: 'Continue escrevendo depois do teste.',
        line: `Assine agora e não perca nenhum dia do teste: a primeira cobrança é só em ${formatDay(access.endsAt)}.`
      }

    case 'presente':
      return {
        eyebrow: 'Assinatura',
        title: 'Continue escrevendo depois do presente.',
        line: `O presente paga a assinatura até ${formatDay(access.until)}. Assine agora e a primeira cobrança só acontece quando ele acabar.`
      }

    case 'trial-encerrado':
      return {
        eyebrow: 'Teste grátis encerrado',
        title: 'Sua história está só começando.',
        line:
          access.reason === 'respostas'
            ? `Você chegou às ${access.answered} respostas do teste, e todas estão guardadas. Assine para continuar de onde parou.`
            : `Os ${TRIAL_DAYS} dias de teste acabaram. ${access.answered > 0 ? `As suas ${plural(access.answered, 'resposta está guardada', 'respostas estão guardadas')}.` : 'Nada do que você começou se perde.'} Assine para continuar de onde parou.`,
        locked: true
      }

    case 'expirada':
      return {
        eyebrow: 'Assinatura encerrada',
        title: 'Volte a escrever a sua história.',
        line:
          access.reason === 'pagamento'
            ? 'A assinatura parou porque o pagamento não passou. Tudo o que você escreveu continua aqui: assine de novo e o livro abre para edição na hora.'
            : 'Tudo o que você escreveu continua aqui. Assine de novo e o livro abre para edição na hora.',
        locked: true
      }

    case 'pagamento-recusado':
      return {
        eyebrow: 'Pagamento recusado',
        title: 'Não conseguimos cobrar a sua assinatura.',
        line: (
          <>
            O banco recusou a cobrança{access.card ? ` no cartão ${access.card.brand} final ${access.card.last4}` : ''}.
            Costuma ser cartão vencido, sem limite ou bloqueado para compras online. O livro continua aberto até{' '}
            <strong className='text-foreground font-medium'>{formatDay(access.graceUntil)}</strong>; depois, fica
            fechado para edição até o pagamento passar.
          </>
        )
      }

    case 'ativa':
    case 'cancelamento-agendado':
      return {
        eyebrow: 'Assinatura',
        title: 'Você já assina o Lá Vem História.',
        line: 'Veja o seu plano, a próxima cobrança e o cartão.'
      }
  }
}

// Cartão recusado: troca o cartão e cobra na hora
const AtualizarPagamento = ({
  access,
  actions
}: {
  access: Extract<Access, { kind: 'pagamento-recusado' }>
  actions: AssinaturaActions
}) => {
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)
  const price = access.interval === 'anual' ? PLAN_PRICES.anual : PLAN_PRICES.mensal

  if (done) {
    return (
      <p role='status' className='bg-olive/15 flex items-start gap-3 rounded-2xl p-5 text-sm'>
        <CircleCheckIcon aria-hidden='true' className='text-olive mt-0.5 size-4 shrink-0' />
        Pagamento feito. Obrigado! Pode voltar a escrever.
      </p>
    )
  }

  return (
    <div className='border-border flex flex-col gap-5 rounded-2xl border p-6'>
      {access.card && (
        <p className='text-clay flex items-center gap-2 text-sm'>
          <CreditCardIcon aria-hidden='true' className='size-4' strokeWidth={1.75} />
          {access.card.brand} final {access.card.last4} · recusado
        </p>
      )}
      <Button
        type='button'
        variant='honey'
        size='cta'
        disabled={pending}
        className='w-full sm:w-fit'
        onClick={async () => {
          setPending(true)
          await actions.updatePaymentMethod()
          setPending(false)
          setDone(true)
        }}
      >
        Usar outro cartão e pagar {formatPrice(price)}
      </Button>
      <p className='text-muted-foreground text-xs text-pretty'>
        Se preferir esperar, tentamos cobrar de novo no mesmo cartão nos próximos dias. Protótipo: nenhuma cobrança é
        feita.
      </p>
    </div>
  )
}

// Primeira assinatura (no teste, no presente, depois do teste ou voltando): escolhe o plano e assina
export const Assinar = ({ access, actions }: { access: Access; actions: AssinaturaActions }) => {
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState<PlanInterval | null>(null)

  const chargeNote =
    access.kind === 'trial' || access.kind === 'trial-acabando'
      ? `A primeira cobrança é em ${formatDay(access.endsAt)}, quando o teste acabar.`
      : access.kind === 'presente'
        ? `A primeira cobrança é em ${formatDay(access.until)}, quando o presente acabar.`
        : 'A cobrança é feita hoje.'

  if (done) {
    return (
      <div role='status' className='bg-olive/15 flex flex-col gap-4 rounded-2xl p-6'>
        <p className='flex items-start gap-3 text-base'>
          <CircleCheckIcon aria-hidden='true' className='text-olive mt-1 size-4 shrink-0' />
          Pronto! Você assinou o plano {done}. Bom saber que essa história vai até o fim.
        </p>
        <Button render={<Link href='/app' />} nativeButton={false} variant='default' size='md' className='w-fit'>
          Voltar para o livro
        </Button>
      </div>
    )
  }

  return (
    <EscolherPlano
      chargeNote={chargeNote}
      pending={pending}
      onChoose={async interval => {
        setPending(true)
        await actions.subscribe(interval)
        setPending(false)
        setDone(interval)
      }}
    />
  )
}

// O paywall: à esquerda, o que está acontecendo e o que fica com a pessoa; à direita, a ação do estado
export const PaywallView = ({ access, actions }: { access: Access; actions: AssinaturaActions }) => {
  const copy = copyOf(access)
  const subscriber = access.kind === 'ativa' || access.kind === 'cancelamento-agendado'

  return (
    <div className='grid gap-12 lg:grid-cols-12 lg:gap-8'>
      <div className='flex flex-col gap-10 lg:col-span-5'>
        <PageHeading eyebrow={copy.eyebrow} title={copy.title}>
          {copy.line}
        </PageHeading>

        {copy.locked ? (
          <div className='flex flex-col gap-3'>
            <span className='text-sm font-medium'>O que continua com você</span>
            <List items={kept(access.answered).map(label => ({ label, Icon: CircleCheckIcon }))} />
            <Link href='/app/configuracoes#copia-de-seguranca' className='w-fit text-sm underline underline-offset-4'>
              Baixar o que escrevi
            </Link>
          </div>
        ) : (
          !subscriber &&
          access.kind !== 'pagamento-recusado' && (
            <div className='flex flex-col gap-3'>
              <span className='text-sm font-medium'>Tudo incluído, nos dois planos</span>
              <List items={included} />
            </div>
          )
        )}
      </div>

      <div className='flex flex-col gap-6 lg:col-span-6 lg:col-start-7'>
        {access.kind === 'pagamento-recusado' ? (
          <AtualizarPagamento access={access} actions={actions} />
        ) : subscriber ? (
          <CartaoAssinatura access={access} actions={actions} />
        ) : (
          <Assinar access={access} actions={actions} />
        )}
      </div>
    </div>
  )
}
