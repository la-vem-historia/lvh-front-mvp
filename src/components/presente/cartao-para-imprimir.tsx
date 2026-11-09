'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { PrinterIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import CartaoFrente from '@/components/presente/cartao-frente'
import CartaoVerso from '@/components/presente/cartao-verso'

import { getGiftCard, type GiftCard } from '@/lib/lvh/presente'

// Frente e verso do cartão numa folha A4, um embaixo do outro, com uma linha pontilhada em volta para recortar.
// Dá para imprimir em casa ou salvar em PDF pelo navegador.
// Protótipo: o cartão só abre no navegador de quem comprou
const CartaoParaImprimir = ({ code }: { code: string }) => {
  const [gift, setGift] = useState<GiftCard | null | undefined>(undefined)

  useEffect(() => {
    getGiftCard(code).then(setGift)
  }, [code])

  if (gift === undefined) return null

  if (!gift)
    return (
      <div className='mx-auto flex min-h-svh max-w-md flex-col justify-center gap-3 px-4'>
        <h1 className='font-heading text-2xl'>Cartão não encontrado.</h1>
        <p className='text-muted-foreground text-base'>Confira o link do e-mail ou fale com quem comprou o presente.</p>
        <Link href='/' className='text-sm underline underline-offset-4'>
          Ir para o site
        </Link>
      </div>
    )

  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-8 px-4 py-10 print:block print:min-h-0 print:p-0'>
      <style>{'@media print { @page { size: A4 portrait; margin: 20mm } html, body { background: #fff } }'}</style>

      <div className='flex w-full max-w-4xl flex-col items-center gap-8 lg:flex-row print:w-[140mm] print:max-w-none print:flex-col print:gap-[14mm]'>
        {(['Frente', 'Verso'] as const).map(lado => (
          <div key={lado} className='flex w-full flex-col gap-2 print:gap-[2mm]'>
            <span className='text-muted-foreground text-xs tracking-[0.2em] uppercase print:text-[8pt]'>{lado}</span>
            {/* Contorno pontilhado só no papel: é por onde recortar */}
            <div className='rounded-[5%/8%] shadow-[0_30px_60px_-30px_rgb(40_30_20/0.5)] print:shadow-none print:outline-1 print:outline-offset-[3mm] print:outline-dashed print:outline-black/30'>
              {lado === 'Frente' ? (
                <CartaoFrente months={gift.months} />
              ) : (
                <CartaoVerso
                  recipientName={gift.recipientName}
                  months={gift.months}
                  message={gift.message}
                  buyerName={gift.buyerName}
                  code={gift.code}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className='flex flex-col items-center gap-3 print:hidden'>
        <Button type='button' variant='moss' size='cta' onClick={() => window.print()}>
          <PrinterIcon aria-hidden='true' />
          Imprimir ou salvar em PDF
        </Button>
        <p className='text-muted-foreground max-w-sm text-center text-xs text-pretty'>
          Na janela de impressão, escolha “Salvar como PDF” para guardar o arquivo ou mandar por e-mail. No papel,
          recorte pela linha pontilhada e cole a frente no verso.
        </p>
      </div>
    </div>
  )
}

export default CartaoParaImprimir
