import type { Metadata } from 'next'

import BoasVindas from '@/components/app/boas-vindas'

export const metadata: Metadata = {
  title: 'Boas-vindas | Lá Vem História'
}

export default function BoasVindasPage() {
  return <BoasVindas />
}
