import type { Metadata } from 'next'

import PerguntaAleatoria from '@/components/app/pergunta-aleatoria'

export const metadata: Metadata = {
  title: 'Pergunta aleatória | Lá Vem História'
}

export default function PerguntaAleatoriaPage() {
  return <PerguntaAleatoria />
}
