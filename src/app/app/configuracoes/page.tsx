import type { Metadata } from 'next'

import Configuracoes from '@/components/app/configuracoes'

export const metadata: Metadata = {
  title: 'Configurações | Lá Vem História'
}

export default function ConfiguracoesPage() {
  return <Configuracoes />
}
