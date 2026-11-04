import type { Metadata } from 'next'

import LivroImpressao from '@/components/livro/livro-impressao'

export const metadata: Metadata = {
  title: 'Baixar o livro | Lá Vem História'
}

export default function ImprimirPage() {
  return <LivroImpressao />
}
