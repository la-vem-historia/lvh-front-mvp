import type { Metadata } from 'next'

import Painel from '@/components/app/painel'

export const metadata: Metadata = {
  title: 'Início | Lá Vem História'
}

export default function AppPage() {
  return <Painel />
}
