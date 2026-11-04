import type { Metadata } from 'next'

import Pergunta from '@/components/app/pergunta'

export const metadata: Metadata = {
  title: 'Responder | Lá Vem História'
}

export default async function PerguntaPage(props: PageProps<'/app/pergunta/[id]'>) {
  const { id } = await props.params

  // key: cada pergunta começa com o estado limpo ao navegar entre elas
  return <Pergunta key={id} questionId={Number(id)} />
}
