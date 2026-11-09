'use client'

import { useState, type FormEvent } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GiftIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { pageTitleClassName } from '@/components/app/page-heading'
import CartaoDuplo from '@/components/presente/cartao-duplo'

import { getGiftCard, monthsLabel, savePendingGift, type GiftCard } from '@/lib/lvh/presente'

// Quem ganhou digita o código, vê o presente e cria a conta. O código fica guardado e vale assim que a pessoa entra.
// Quem já tem conta também pode resgatar em Meus livros
const ResgatarCodigo = ({ initialCode }: { initialCode: string }) => {
  const router = useRouter()
  const [code, setCode] = useState(initialCode)
  const [gift, setGift] = useState<GiftCard | null>(null)
  const [error, setError] = useState<string | null>(null)

  const check = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const found = await getGiftCard(code)

    if (!found) return setError('Não encontramos este código. Confira as letras e os números.')
    if (found.redeemedAt) return setError('Este presente já foi resgatado.')

    setGift(found)
  }

  const start = (mode: 'criar' | 'entrar') => {
    if (!gift) return

    savePendingGift(gift.code)
    router.push(mode === 'criar' ? '/entrar?modo=criar' : '/entrar')
  }

  if (gift)
    return (
      <div className='flex flex-col gap-8'>
        <div className='flex flex-col gap-3'>
          <p className='text-sm font-medium uppercase'>Você ganhou um presente</p>
          <h1 className={pageTitleClassName}>
            {gift.buyerName} deu {monthsLabel(gift.months)} para você contar a sua história.
          </h1>
          <p className='text-muted-foreground text-base text-pretty'>
            Crie a sua conta e comece. Os meses do presente entram sozinhos, e a assinatura só é cobrada depois deles.
          </p>
        </div>

        <CartaoDuplo
          recipientName={gift.recipientName}
          months={gift.months}
          message={gift.message}
          buyerName={gift.buyerName}
          code={gift.code}
        />

        <div className='flex flex-col gap-3 sm:flex-row'>
          <Button type='button' variant='honey' size='cta' onClick={() => start('criar')}>
            Criar conta e começar
          </Button>
          <Button type='button' variant='outline' size='cta' onClick={() => start('entrar')}>
            Já tenho conta
          </Button>
        </div>
      </div>
    )

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex flex-col gap-3'>
        <GiftIcon aria-hidden='true' className='text-earth size-8' strokeWidth={1.5} />
        <h1 className={pageTitleClassName}>Resgatar presente</h1>
        <p className='text-muted-foreground text-base text-pretty'>
          Digite o código que está no cartão. Ele começa com LVH.
        </p>
      </div>

      <form onSubmit={check} className='flex flex-col gap-3'>
        <Label htmlFor='codigo'>Código do presente</Label>
        <Input
          id='codigo'
          value={code}
          onChange={event => setCode(event.target.value)}
          placeholder='LVH-XXXX-XXXX'
          autoComplete='off'
          spellCheck={false}
          className='uppercase'
          required
        />
        {error && (
          <p role='alert' className='text-destructive text-sm'>
            {error}
          </p>
        )}
        <Button type='submit' variant='honey' size='cta' className='w-full sm:w-fit'>
          Ver o meu presente
        </Button>
      </form>

      <p className='text-muted-foreground text-sm'>
        Quer dar um presente?{' '}
        <Link href='/presente' className='text-foreground underline underline-offset-4'>
          Comprar um cartão
        </Link>
      </p>
    </div>
  )
}

export default ResgatarCodigo
