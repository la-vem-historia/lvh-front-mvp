import type { Metadata } from 'next'

import CheckoutProvedor from '@/components/checkout/checkout-provedor'

export const metadata: Metadata = {
  title: 'Pagamento (simulado)'
}

// A página do provedor de pagamento, simulada: fica fora de /app, como o checkout hospedado de verdade
export default async function CheckoutPage(props: PageProps<'/checkout/[id]'>) {
  const { id } = await props.params

  return <CheckoutProvedor id={id} />
}
