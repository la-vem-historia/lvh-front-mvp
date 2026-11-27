'use client'

import { useEffect, useState } from 'react'

import { CircleCheckIcon, InfoIcon, LoaderCircleIcon } from 'lucide-react'

import { useAccess } from '@/components/app/assinatura/acesso'

import { getCheckoutSession, type CheckoutSession } from '@/lib/lvh/pagamento'
import { cn } from '@/lib/utils'

type Status = 'confirmando' | 'confirmado' | 'demorando' | 'cancelado'

// Depois de 20 segundos sem webhook, para de esperar na tela: o e-mail avisa quando o pagamento entrar
const GIVE_UP_MS = 20_000

// Na volta da página do provedor. A volta não prova nada: o estado só muda quando o webhook chega,
// então a tela mostra "confirmando" e relê a assinatura até a confirmação aparecer
const RetornoCheckout = ({ checkoutId, canceled }: { checkoutId: string; canceled: boolean }) => {
  const { refresh } = useAccess()
  const [status, setStatus] = useState<Status>(canceled ? 'cancelado' : 'confirmando')
  const [kind, setKind] = useState<CheckoutSession['item']['kind'] | null>(null)

  useEffect(() => {
    if (canceled) return

    const started = Date.now()
    let timer: number | undefined

    const check = async () => {
      // Relê a assinatura: é aqui que o app processa os eventos do provedor que já chegaram
      await refresh()

      const session = await getCheckoutSession(checkoutId)

      setKind(session?.item.kind ?? null)

      if (session?.settledAt) {
        setStatus('confirmado')
        // Tira o ?checkout do endereço: recarregar a página não mostra a confirmação de novo
        window.history.replaceState(null, '', window.location.pathname)

        return
      }

      if (Date.now() - started > GIVE_UP_MS) {
        setStatus('demorando')

        return
      }

      timer = window.setTimeout(check, 1000)
    }

    timer = window.setTimeout(check, 300)

    return () => window.clearTimeout(timer)
  }, [checkoutId, canceled, refresh])

  const content: Record<Status, { Icon: typeof InfoIcon; text: string; className: string; spin?: boolean }> = {
    confirmando: {
      Icon: LoaderCircleIcon,
      text: 'Confirmando o pagamento com o provedor…',
      className: 'bg-sand',
      spin: true
    },
    confirmado: {
      Icon: CircleCheckIcon,
      text:
        kind === 'cartao'
          ? 'Cartão atualizado e renovação paga. Pode voltar a escrever.'
          : 'Pagamento confirmado. Bom saber que essa história vai até o fim.',
      className: 'bg-olive/15'
    },
    demorando: {
      Icon: InfoIcon,
      text: 'O provedor ainda não confirmou. Às vezes leva alguns minutos; avisamos por e-mail quando entrar.',
      className: 'bg-sand'
    },
    cancelado: {
      Icon: InfoIcon,
      text: 'Pagamento não concluído. Nada foi cobrado. Quando quiser, é só escolher o plano de novo.',
      className: 'bg-sand'
    }
  }

  const { Icon, text, className, spin } = content[status]

  return (
    <p role='status' className={cn('flex items-start gap-3 rounded-2xl p-5 text-sm text-pretty', className)}>
      <Icon aria-hidden='true' className={cn('mt-0.5 size-4 shrink-0', spin && 'animate-spin')} />
      {text}
    </p>
  )
}

export default RetornoCheckout
