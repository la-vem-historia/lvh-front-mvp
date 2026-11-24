'use client'

import { createContext, use, useCallback, useEffect, useState, type ReactNode } from 'react'

import { usePathname } from 'next/navigation'

import {
  cancelRenewal,
  changeInterval,
  getAccess,
  keepSubscription,
  startCardUpdate,
  startSubscriptionCheckout,
  type Access,
  type PlanInterval
} from '@/lib/lvh/assinatura'

type AccessContextValue = {
  access: Access | null
  refresh: () => Promise<Access>
  // Depois de assinar, trocar de plano ou cancelar: a ação já devolve o estado novo
  set: (access: Access) => void
}

const AccessContext = createContext<AccessContextValue | null>(null)

// Estado da assinatura para o app inteiro: o aviso do topo, a trava de edição e o cartão em Pagamento leem daqui.
// Relê a cada troca de página, porque responder uma pergunta conta para o limite do teste
export const AccessProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname()
  const [access, setAccess] = useState<Access | null>(null)

  const refresh = useCallback(async () => {
    const next = await getAccess()

    setAccess(next)

    return next
  }, [])

  useEffect(() => {
    let active = true

    getAccess().then(next => {
      if (active) setAccess(next)
    })

    return () => {
      active = false
    }
  }, [pathname])

  return <AccessContext value={{ access, refresh, set: setAccess }}>{children}</AccessContext>
}

export const useAccess = () => {
  const value = use(AccessContext)

  if (!value) throw new Error('useAccess precisa estar dentro do AccessProvider')

  return value
}

// O que a pessoa pode fazer com a assinatura. As telas recebem isto por props, para a página de estados
// passar versões que não mexem na conta
export type AssinaturaActions = {
  subscribe: (interval: PlanInterval) => Promise<void>
  changeInterval: (interval: PlanInterval) => Promise<void>
  cancelRenewal: () => Promise<void>
  keepSubscription: () => Promise<void>
  updatePaymentMethod: () => Promise<void>
}

export const useAssinaturaActions = (): AssinaturaActions => {
  const { set } = useAccess()
  const run =
    <Args extends unknown[]>(action: (...args: Args) => Promise<Access>) =>
    async (...args: Args) => {
      set(await action(...args))
    }

  // Assinar e trocar o cartão saem do app: a pessoa vai para a página do provedor e volta para /app/assinatura.
  // Mudar de plano, cancelar e manter não saem: o servidor chama a API do provedor com o cartão já salvo
  const goTo = (start: () => Promise<string>) => async () => {
    window.location.assign(await start())
  }

  return {
    subscribe: async interval => goTo(() => startSubscriptionCheckout(interval))(),
    changeInterval: run(changeInterval),
    cancelRenewal: run(cancelRenewal),
    keepSubscription: run(keepSubscription),
    updatePaymentMethod: goTo(startCardUpdate)
  }
}

