import type { Metadata } from 'next'

import ComprarPresente from '@/components/presente/comprar-presente'
import PresenteHeader from '@/components/presente/presente-header'

export const metadata: Metadata = {
  title: 'Dar de presente | Lá Vem História'
}

export default function PresentePage() {
  return (
    <div className='flex min-h-svh flex-col'>
      <PresenteHeader />
      <main className='mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6 lg:px-8'>
        <ComprarPresente />
      </main>
    </div>
  )
}
