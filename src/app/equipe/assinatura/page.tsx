import type { Metadata } from 'next'

import Estados from '@/components/app/assinatura/estados'

export const metadata: Metadata = {
  title: 'Estados da assinatura | Lá Vem História'
}

// Página da equipe: fora de /app para abrir sem conta (o site publicado ainda pede a senha da equipe).
// ?estado=<id> abre num estado; &captura=1 mostra só as telas dele, para tirar a imagem
export default async function EstadosPage({ searchParams }: PageProps<'/equipe/assinatura'>) {
  const { estado, captura } = await searchParams

  return <Estados initialId={typeof estado === 'string' ? estado : undefined} capture={captura === '1'} />
}
