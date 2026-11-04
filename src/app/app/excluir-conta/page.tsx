import type { Metadata } from 'next'

import ExcluirConta from '@/components/app/excluir-conta'

export const metadata: Metadata = {
  title: 'Excluir conta | Lá Vem História'
}

export default function ExcluirContaPage() {
  return <ExcluirConta />
}
