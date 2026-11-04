import type { Metadata } from 'next'

import OuvirVoz from '@/components/livro/ouvir-voz'

export const metadata: Metadata = {
  title: 'Ouvir | Lá Vem História',
  robots: { index: false }
}

export default async function OuvirPage(props: PageProps<'/ouvir/[token]'>) {
  const { token } = await props.params

  return <OuvirVoz token={token} />
}
