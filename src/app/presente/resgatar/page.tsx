import type { Metadata } from 'next'

import PresenteHeader from '@/components/presente/presente-header'
import ResgatarCodigo from '@/components/presente/resgatar-codigo'

export const metadata: Metadata = {
  title: 'Resgatar presente | Lá Vem História'
}

export default async function ResgatarPage({ searchParams }: PageProps<'/presente/resgatar'>) {
  const { codigo } = await searchParams

  return (
    <div className='flex min-h-svh flex-col'>
      <PresenteHeader />
      <main className='mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-10 sm:px-6'>
        <ResgatarCodigo initialCode={typeof codigo === 'string' ? codigo : ''} />
      </main>
    </div>
  )
}
