import type { Metadata } from 'next'

import BoasVindas from '@/components/app/boas-vindas'

export const metadata: Metadata = {
  title: 'Novo livro | Lá Vem História'
}

// ?de=<id>: veio da conclusão de um livro, e as respostas dele já vêm marcadas para aproveitar
export default async function NovoLivroPage(props: PageProps<'/app/livros/novo'>) {
  const { de } = await props.searchParams

  return <BoasVindas newBook copyFromId={typeof de === 'string' ? de : undefined} />
}
