import type { Metadata } from 'next'

import Livro from '@/components/livro/livro'

export const metadata: Metadata = {
  title: 'O livro | Lá Vem História'
}

export default function LivroPage() {
  return <Livro />
}
