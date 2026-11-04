import type { Metadata } from 'next'

import MinhaConta from '@/components/app/conta'

export const metadata: Metadata = {
  title: 'Minha conta | Lá Vem História'
}

export default function ContaPage() {
  return <MinhaConta />
}
