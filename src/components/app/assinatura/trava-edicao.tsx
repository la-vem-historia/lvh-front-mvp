'use client'

import type { ReactNode } from 'react'

import { useAccess, useAssinaturaActions } from '@/components/app/assinatura/acesso'
import { PaywallView } from '@/components/app/assinatura/paywall'

import { canEdit } from '@/lib/lvh/assinatura'

// Em volta das telas de escrever: sem assinatura (teste acabou ou assinatura encerrada), mostra o paywall no lugar.
// Ler o livro, compartilhar e baixar ficam fora da trava
const TravaEdicao = ({ children }: { children: ReactNode }) => {
  const { access } = useAccess()
  const actions = useAssinaturaActions()

  if (!access) return null

  if (canEdit(access)) return children

  return (
    <div className='mx-auto flex w-full max-w-7xl flex-col px-4 py-10 sm:px-6 lg:px-16 lg:py-16'>
      <PaywallView access={access} actions={actions} />
    </div>
  )
}

export default TravaEdicao
