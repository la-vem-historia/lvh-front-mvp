import type { Metadata } from 'next'

import MeusLivros from '@/components/app/meus-livros'

export const metadata: Metadata = {
  title: 'Meus livros | Lá Vem História'
}

export default function MeusLivrosPage() {
  return <MeusLivros />
}
