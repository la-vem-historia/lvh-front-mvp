import type { Metadata } from 'next'

import CartaoParaImprimir from '@/components/presente/cartao-para-imprimir'

export const metadata: Metadata = {
  title: 'Cartão-presente | Lá Vem História',
  robots: { index: false }
}

export default async function CartaoPage(props: PageProps<'/presente/cartao/[code]'>) {
  const { code } = await props.params

  return <CartaoParaImprimir code={decodeURIComponent(code)} />
}
