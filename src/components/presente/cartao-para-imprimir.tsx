'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { PrinterIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import CartaoVisual from '@/components/presente/cartao-visual'

import { getGiftCard, type GiftCard } from '@/lib/lvh/presente'

// O cartão sozinho na página, para imprimir ou salvar em PDF pelo navegador: uma folha A5 deitada, sem margem.
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
      <style>{'@media print { @page { size: 210mm 148mm; margin: 0 } html, body { background: transparent } }'}</style>

      <div className='w-full max-w-3xl print:max-w-none'>
        <CartaoVisual
          recipientName={gift.recipientName}
          months={gift.months}
          message={gift.message}
          buyerName={gift.buyerName}
          code={gift.code}
          className='shadow-[0_40px_80px_-40px_rgb(40_30_20/0.55)] print:h-[148mm] print:w-[210mm] print:rounded-none print:shadow-none'
        />
      </div>

      <div className='flex flex-col items-center gap-3 print:hidden'>
        <Button type='button' variant='moss' size='cta' onClick={() => window.print()}>
          <PrinterIcon aria-hidden='true' />
          Imprimir ou salvar em PDF
        </Button>
        <p className='text-muted-foreground max-w-sm text-center text-xs text-pretty'>
          Na janela de impressão, escolha “Salvar como PDF” para guardar o arquivo ou mandar por e-mail.
        </p>
      </div>
    </div>
  )
}

export default CartaoParaImprimir
