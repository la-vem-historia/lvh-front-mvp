import type { Metadata } from 'next'

import ComprarPresente from '@/components/presente/comprar-presente'
import PresenteHeader from '@/components/presente/presente-header'

import { parseGiftMonths } from '@/lib/lvh/presente'

export const metadata: Metadata = {
  title: 'Dar de presente | Lá Vem História'
}

// ?meses=3, 6 ou 12 chega da escolha feita na landing
export default async function PresentePage({ searchParams }: PageProps<'/presente'>) {
  const { meses } = await searchParams

  return (
    <div className='flex min-h-svh flex-col'>
      <PresenteHeader />
      <main className='mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6 lg:px-8'>
        <ComprarPresente initialMonths={parseGiftMonths(meses)} />
      </main>
    </div>
  )
}
