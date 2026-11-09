'use client'

import { useState, type FormEvent } from 'react'

import { GiftIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRefreshUser } from '@/components/app/session'

import { formatGiftDate, redeemGiftCard } from '@/lib/lvh/presente'

// Presente na conta: mostra até quando a assinatura está paga e deixa digitar um código novo.
// Um segundo código soma os meses ao fim do primeiro
const ResgatarPresente = ({ giftUntil, onChange }: { giftUntil?: string; onChange: () => void }) => {
  const refreshUser = useRefreshUser()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const redeem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setPending(true)

    try {
      const { gift, until } = await redeemGiftCard(code)

      await refreshUser()
      onChange()
      setCode('')
      setSuccess(
        `${gift.buyerName} deu ${gift.months} meses para você. A assinatura está paga até ${formatGiftDate(until)}.`
      )
    } catch (reason) {
      setError((reason as Error).message)
    }

    setPending(false)
  }

  return (
    <div className='flex flex-col gap-3'>
      <span className='text-sm font-medium'>Presente</span>

      {giftUntil && (
        <div className='bg-sand flex items-start gap-3 rounded-2xl p-4'>
          <GiftIcon aria-hidden='true' className='text-earth mt-0.5 size-5 shrink-0' />
          <p className='text-sm text-pretty'>
            Você ganhou meses de presente. A assinatura está paga até{' '}
            <strong className='font-medium'>{formatGiftDate(giftUntil)}</strong>, e a cobrança só começa depois.
          </p>
        </div>
      )}

      <form onSubmit={redeem} className='flex flex-col gap-2'>
        <Label htmlFor='codigo-presente' className='text-muted-foreground text-sm font-normal'>
          Tem um código de presente?
        </Label>
        <div className='flex flex-col gap-2 sm:flex-row'>
          <Input
            id='codigo-presente'
            value={code}
            onChange={event => setCode(event.target.value)}
            placeholder='LVH-XXXX-XXXX'
            autoComplete='off'
            spellCheck={false}
            className='uppercase sm:max-w-xs'
          />
          <Button type='submit' variant='outline' size='lg' disabled={pending || !code.trim()}>
            {pending ? 'Resgatando…' : 'Resgatar'}
          </Button>
        </div>
        {error && (
          <p role='alert' className='text-destructive text-sm'>
            {error}
          </p>
        )}
        {success && (
          <p role='status' className='text-sm text-pretty'>
            {success}
          </p>
        )}
      </form>
    </div>
  )
}

export default ResgatarPresente
