import type { Metadata } from 'next'

import Colaborar from '@/components/colaborar/colaborar'

export const metadata: Metadata = {
  title: 'Convite | Lá Vem História',
  robots: { index: false }
}

export default async function ColaborarPage(props: PageProps<'/colaborar/[token]'>) {
  const { token } = await props.params

  return <Colaborar token={token} />
}
