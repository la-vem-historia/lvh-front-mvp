import type { Metadata } from 'next'

import LivroCompartilhado from '@/components/livro/livro-compartilhado'

export const metadata: Metadata = {
  title: 'Livro | Lá Vem História',
  robots: { index: false }
}

export default async function LerPage(props: PageProps<'/ler/[token]'>) {
  const { token } = await props.params

  return <LivroCompartilhado token={token} />
}
