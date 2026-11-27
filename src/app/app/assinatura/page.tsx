import type { Metadata } from 'next'

import Assinatura from '@/components/app/assinatura/assinatura'

export const metadata: Metadata = {
  title: 'Assinatura | Lá Vem História'
}

// ?checkout=<id> chega na volta da página do provedor; &cancelado=1 quando a pessoa desistiu lá
export default async function AssinaturaPage({ searchParams }: PageProps<'/app/assinatura'>) {
  const { checkout, cancelado } = await searchParams

  return (
    <Assinatura
      checkoutId={typeof checkout === 'string' ? checkout : undefined}
      checkoutCanceled={cancelado === '1'}
    />
  )
}
