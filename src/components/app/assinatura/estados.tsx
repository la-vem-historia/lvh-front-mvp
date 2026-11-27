'use client'

import { useEffect, useState, type ReactNode } from 'react'

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import PageHeading, { textLinkClassName } from '@/components/app/page-heading'
import type { AssinaturaActions } from '@/components/app/assinatura/acesso'
import { AvisoAssinaturaView, bannerOf } from '@/components/app/assinatura/aviso'
import { PlanoAtual } from '@/components/app/assinatura/assinatura'
import ResumoPagamento from '@/components/app/assinatura/resumo-pagamento'
import { PaywallView } from '@/components/app/assinatura/paywall'

import { getCurrentUser } from '@/lib/lvh/api'
import { canEdit, isSimulating, simulate, stopSimulating, type Access, type Card, type SimulatedState } from '@/lib/lvh/assinatura'
import { cn } from '@/lib/utils'

const DAY = 24 * 60 * 60 * 1000
const card: Card = { brand: 'Visa', last4: '4242' }

type Example = {
  id: string
  label: string
  when: string
  // O que aconteceu no provedor de pagamento para chegar aqui
  provider: string
  access: Access
  // Estado equivalente para aplicar na conta; o presente vem de um código, não dá para simular aqui
  simulate?: SimulatedState
}

// Um exemplo de cada estado, com datas a partir de hoje
const examplesFrom = (now: number): Example[] => {
  const ahead = (days: number) => new Date(now + days * DAY).toISOString()
  const ago = (days: number) => new Date(now - days * DAY).toISOString()

  return [
    {
      id: 'trial',
      label: 'No teste',
      when: 'Conta nova, dentro dos 14 dias e das 14 respostas.',
      provider: 'Nada ainda. O teste é só nosso: sem cartão e sem assinatura no provedor.',
      access: { kind: 'trial', daysLeft: 10, answersLeft: 9, endsAt: ahead(10), answered: 5 },
      simulate: 'trial'
    },
    {
      id: 'trial-acabando-dias',
      label: 'Teste acabando (dias)',
      when: 'Faltam 3 dias ou menos.',
      provider: 'Nada ainda. Assinar agora vai ao checkout com R$ 0,00 hoje e a primeira cobrança no fim do teste.',
      access: { kind: 'trial-acabando', daysLeft: 2, answersLeft: 8, endsAt: ahead(2), answered: 6, reason: 'dias' },
      simulate: 'trial-acabando'
    },
    {
      id: 'trial-acabando-respostas',
      label: 'Teste acabando (respostas)',
      when: 'Faltam 3 respostas ou menos.',
      provider: 'Nada ainda. O limite de respostas é regra nossa; o provedor só conhece a data do fim do teste.',
      access: { kind: 'trial-acabando', daysLeft: 9, answersLeft: 2, endsAt: ahead(9), answered: 12, reason: 'respostas' }
    },
    {
      id: 'trial-encerrado',
      label: 'Teste encerrado',
      when: 'Acabaram os dias ou as respostas sem assinar. O livro fecha para edição.',
      provider: 'Nada ainda. Assinar vai ao checkout e cobra hoje.',
      access: { kind: 'trial-encerrado', reason: 'respostas', answered: 14 },
      simulate: 'trial-encerrado'
    },
    {
      id: 'presente',
      label: 'Presente acabando',
      when: 'Ganhou meses de presente e faltam 7 dias ou menos.',
      provider: 'O presente foi um pagamento único de quem deu. Assinar agora agenda a primeira cobrança para o fim do presente.',
      access: { kind: 'presente', until: ahead(5), daysLeft: 5, ending: true, answered: 31 }
    },
    {
      id: 'ativa-mensal',
      label: 'Ativa · mensal',
      when: 'Assina o mensal e vê o convite para o anual. Clique em “Mudar para o anual” para ver a troca agendada.',
      provider: 'Assinatura criada no checkout; chegou o evento de pagamento aprovado. Mudar para o anual é uma chamada à API, sem sair do app.',
      access: { kind: 'ativa', interval: 'mensal', renewsAt: ahead(18), card, answered: 42 },
      simulate: 'ativa-mensal'
    },
    {
      id: 'ativa-anual',
      label: 'Ativa · anual',
      when: 'Assina o anual.',
      provider: 'Assinatura anual no provedor. Se foi paga com Pix, a renovação pede um novo pagamento.',
      access: { kind: 'ativa', interval: 'anual', renewsAt: ahead(260), card, answered: 88 },
      simulate: 'ativa-anual'
    },
    {
      id: 'cancelamento-agendado',
      label: 'Cancelou, ainda no período',
      when: 'Cancelou a renovação. Tudo liberado até o fim do período pago.',
      provider: 'O app pediu ao provedor para não renovar (cancelar no fim do período). Manter desfaz, sem sair do app.',
      access: { kind: 'cancelamento-agendado', interval: 'mensal', endsAt: ahead(9), daysLeft: 9, answered: 42 },
      simulate: 'cancelamento-agendado'
    },
    {
      id: 'pagamento-recusado',
      label: 'Cartão recusado',
      when: 'A renovação não passou. O livro fica aberto por 7 dias enquanto tentamos de novo.',
      provider: 'Chegou o evento de pagamento recusado. O provedor tenta de novo; “Usar outro cartão” abre o portal dele.',
      access: { kind: 'pagamento-recusado', interval: 'mensal', graceUntil: ahead(5), daysLeft: 5, card, answered: 42 },
      simulate: 'pagamento-recusado'
    },
    {
      id: 'expirada',
      label: 'Assinatura encerrada',
      when: 'O período acabou depois de cancelar, ou o cartão não passou em 7 dias. O livro fecha para edição.',
      provider: 'Chegou o evento de assinatura encerrada (fim do período cancelado ou tentativas esgotadas).',
      access: { kind: 'expirada', endedAt: ago(12), reason: 'cancelou', answered: 42 },
      simulate: 'expirada'
    }
  ]
}

const Surface = ({ title, note, children }: { title: string; note?: string; children: ReactNode }) => (
  <section className='border-foreground flex flex-col gap-5 border-t pt-6'>
    <div className='flex flex-col gap-1'>
      <h2 className='text-sm font-medium uppercase'>{title}</h2>
      {note && <p className='text-muted-foreground text-sm'>{note}</p>}
    </div>
    {children}
  </section>
)

// /equipe/assinatura: todos os estados da assinatura, com o aviso, o plano e o paywall de cada um, e o resumo do
// pagamento ao lado. Fica fora de /app para a equipe abrir sem conta; "Ver no app" só aparece para quem entrou
const Estados = ({ initialId, capture }: { initialId?: string; capture?: boolean }) => {
  // Datas a partir de quando a página abriu
  const [now] = useState(() => Date.now())
  const examples = examplesFrom(now)
  const [selectedId, setSelectedId] = useState(
    examples.some(item => item.id === initialId) ? initialId! : examples[0].id
  )
  // O estado depois de clicar num botão da prévia (mudar para o anual, cancelar...). Trocar de aba limpa
  const [changed, setChanged] = useState<Access | null>(null)
  const [pending, setPending] = useState(false)
  // A conta está num estado simulado: mostra o botão para voltar ao de verdade
  const [simulating, setSimulating] = useState(false)
  // Sem conta no app, a página continua toda navegável; só não dá para aplicar um estado
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    let active = true

    getCurrentUser().then(async user => {
      if (!active || !user?.activeBook) return

      setLoggedIn(true)
      const value = await isSimulating()

      if (active) setSimulating(value)
    })

    return () => {
      active = false
    }
  }, [])

  const example = examples.find(item => item.id === selectedId)!
  const shown = changed ?? example.access
  const banner = bannerOf(shown)

  // Os botões da prévia mudam só o que está na tela, nunca a conta
  const previewActions: AssinaturaActions = {
    subscribe: async interval =>
      setChanged({
        kind: 'ativa',
        interval,
        renewsAt: new Date(now + (interval === 'anual' ? 365 : 30) * DAY).toISOString(),
        card,
        answered: shown.answered
      }),
    changeInterval: async interval => {
      if (shown.kind === 'ativa') {
        setChanged({ ...shown, nextInterval: interval === shown.interval ? undefined : interval })
      }
    },
    cancelRenewal: async () => {
      if (shown.kind === 'ativa') {
        setChanged({
          kind: 'cancelamento-agendado',
          interval: shown.interval,
          endsAt: shown.renewsAt,
          daysLeft: Math.ceil((new Date(shown.renewsAt).getTime() - now) / DAY),
          answered: shown.answered
        })
      }
    },
    keepSubscription: async () => {
      if (shown.kind === 'cancelamento-agendado') {
        setChanged({ kind: 'ativa', interval: shown.interval, renewsAt: shown.endsAt, card, answered: shown.answered })
      }
    },
    updatePaymentMethod: async () => {
      if (shown.kind === 'pagamento-recusado') {
        setChanged({
          kind: 'ativa',
          interval: shown.interval,
          renewsAt: new Date(now + 30 * DAY).toISOString(),
          card: { brand: 'Mastercard', last4: '5100' },
          answered: shown.answered
        })
      }
    }
  }

  const applyAndOpen = async () => {
    if (!example.simulate) return

    setPending(true)
    await simulate(example.simulate)
    // Recarrega o app inteiro, para o aviso e a trava lerem o estado novo
    window.location.assign('/app')
  }

  const backToReal = async () => {
    setPending(true)
    await stopSimulating()
    setSimulating(false)
    setPending(false)
  }

  // O que o estado mostra no app: o aviso, o plano e, quando trava, o paywall
  const surfaces = (
    <>
    <Surface title='Aviso no topo do app' note={banner ? undefined : 'Neste estado não há aviso.'}>
      {banner && <AvisoAssinaturaView banner={banner} onDismiss={() => {}} />}
    </Surface>

    <Surface title='Assinatura › Seu plano'>
      <div className='max-w-2xl'>
        {/* key: cada estado começa sem confirmação aberta nem o "Pronto!" de um teste anterior */}
        <PlanoAtual key={example.id} access={shown} actions={previewActions} />
      </div>
    </Surface>

    <Surface
      title='Tela de responder travada'
      note={canEdit(shown) ? 'Neste estado a escrita está liberada: não há paywall.' : undefined}
    >
      {!canEdit(shown) && <PaywallView key={example.id} access={shown} actions={previewActions} />}
    </Surface>
    </>
  )

  // Captura: só as telas do estado, para as imagens da página da equipe (?estado=<id>&captura=1)
  if (capture) {
    return (
      <div id='captura' className='flex w-[56rem] flex-col gap-10 p-10'>
        {/* Sem o selo do Next no canto, que sairia na imagem */}
        <style>{'nextjs-portal { display: none !important; }'}</style>
        {surfaces}
      </div>
    )
  }

  return (
    <div className='mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-16 lg:py-16'>
      <PageHeading eyebrow='Protótipo' title='Estados da assinatura'>
        Cada estado com o aviso no topo do app, o plano na página Assinatura (menu da conta) e, quando a escrita
        trava, o paywall que aparece na tela de responder.
      </PageHeading>

      {/* Os estados à esquerda e o resumo do pagamento sempre à vista, preso ao lado */}
      <div className='grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12'>
        <div className='flex min-w-0 flex-col gap-10'>
          <div role='tablist' aria-label='Estado' className='flex flex-wrap gap-2'>
            {examples.map(item => (
              <button
                key={item.id}
                type='button'
                role='tab'
                aria-selected={item.id === selectedId}
                onClick={() => {
                  setSelectedId(item.id)
                  setChanged(null)
                }}
                className={cn(
                  'cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors',
                  item.id === selectedId ? 'bg-moss text-cream border-moss' : 'border-border hover:border-foreground/40'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className='bg-sand flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5'>
            <div className='flex flex-col gap-1 text-sm'>
              <p>
                <strong className='font-medium'>Quando:</strong> {example.when}
              </p>
              <p>
                <strong className='font-medium'>No provedor:</strong> {example.provider}
              </p>
              <p className='text-muted-foreground'>
                Escrever: {canEdit(shown) ? 'liberado' : 'travado, a tela de responder mostra o paywall'}.
              </p>
            </div>
            <div className='flex flex-wrap items-center gap-4'>
              {simulating && (
                <button type='button' disabled={pending} onClick={backToReal} className={textLinkClassName}>
                  Voltar a conta ao estado real
                </button>
              )}
              {!loggedIn ? (
                <p className='text-muted-foreground text-xs'>
                  Para ver um estado no app de verdade,{' '}
                  <Link href='/entrar' className='underline underline-offset-4'>
                    entre na sua conta
                  </Link>
                  .
                </p>
              ) : example.simulate ? (
                <Button type='button' variant='outline' size='md' disabled={pending} onClick={applyAndOpen}>
                  Ver no app com este estado
                </Button>
              ) : (
                <p className='text-muted-foreground text-xs'>Para ver no app, resgate um cartão-presente.</p>
              )}
            </div>
          </div>

          {surfaces}
        </div>

        <aside className='lg:sticky lg:top-28 lg:max-h-[calc(100svh-8rem)] lg:self-start lg:overflow-y-auto'>
          <ResumoPagamento />
        </aside>
      </div>
    </div>
  )
}

export default Estados
