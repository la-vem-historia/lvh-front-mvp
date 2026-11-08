'use client'

import { useEffect, useState } from 'react'

import { BookOpenIcon, CheckIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { getPrintInterest, registerPrintInterest } from '@/lib/lvh/api'
import { cn } from '@/lib/utils'

// Livro impresso e encadernado pela gráfica parceira. Enquanto o pedido não existe,
// o botão só registra quem quer ser avisado; depois disso, vira uma confirmação
const LivroImpresso = ({ className }: { className?: string }) => {
  const [interest, setInterest] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    getPrintInterest().then(setInterest)
  }, [])

  const notify = async () => {
    setPending(true)
    setInterest(await registerPrintInterest())
    setPending(false)
  }

  if (interest) {
    return (
      <p role='status' className={cn('flex items-start gap-2 text-sm text-pretty', className)}>
        <CheckIcon className='text-moss mt-0.5 size-4 shrink-0' />
        Avisamos você assim que o livro impresso estiver disponível.
      </p>
    )
  }

  return (
    <Button
      type='button'
      variant='moss'
      size='cta'
      className={cn('gap-2', className)}
      disabled={pending}
      onClick={notify}
    >
      Imprimir o livro físico
      <BookOpenIcon className='size-5' />
    </Button>
  )
}

export default LivroImpresso
