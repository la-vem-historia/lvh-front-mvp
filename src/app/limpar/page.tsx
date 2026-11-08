import type { Metadata } from 'next'

import Limpar from '@/components/app/limpar'

export const metadata: Metadata = {
  title: 'Começar do zero | Lá Vem História',
  robots: { index: false }
}

// Só para a equipe (a rota fica atrás da senha do site): apaga o protótipo neste navegador
// para testar o produto como quem chega pela primeira vez
export default function LimparPage() {
  return <Limpar />
}
