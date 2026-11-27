'use client'

import { useEffect, useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { textLinkClassName } from '@/components/app/page-heading'
import { useUser } from '@/components/app/session'
import { useAccess } from '@/components/app/assinatura/acesso'

import { formatCpf, maskCpf } from '@/lib/lvh/cpf'
import { getFiscalData, updateFiscalCpf, type FiscalData } from '@/lib/lvh/nota-fiscal'

// Nota fiscal, na página Assinatura: para qual CPF e qual e-mail ela sai. O CPF é pedido no checkout;
// aqui dá para conferir e corrigir sem passar pelo provedor
const NotaFiscal = () => {
  const user = useUser()
  // O CPF chega com o webhook do pagamento, que também muda a assinatura: relê quando ela muda
  const { access } = useAccess()
  const [data, setData] = useState<FiscalData | null>(null)
  const [editing, setEditing] = useState(false)
  const [cpf, setCpf] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    getFiscalData().then(value => {
      if (active) setData(value)
    })

    return () => {
      active = false
    }
  }, [access])

  if (!data) return null

  const startEditing = () => {
    setCpf(formatCpf(data.cpf ?? ''))
    setError(null)
    setEditing(true)
  }

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setData(await updateFiscalCpf(cpf))
      setEditing(false)
    } catch (reason) {
      setError((reason as Error).message)
    }
  }

  if (editing) {
    return (
      <form onSubmit={save} className='flex flex-col gap-2'>
        <Label htmlFor='cpf-nota' className='text-muted-foreground text-sm font-normal'>
          CPF
        </Label>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
          <Input
            id='cpf-nota'
            value={cpf}
            onChange={event => setCpf(formatCpf(event.target.value))}
            placeholder='000.000.000-00'
            inputMode='numeric'
            autoComplete='off'
            autoFocus
            aria-invalid={Boolean(error)}
            className='tabular-nums sm:max-w-xs'
          />
          <div className='flex items-center gap-4'>
            <Button type='submit' variant='outline' size='lg'>
              Salvar
            </Button>
            <button type='button' onClick={() => setEditing(false)} className={textLinkClassName}>
              Cancelar
            </button>
          </div>
        </div>
        {error ? (
          <p role='alert' className='text-destructive text-sm'>
            {error}
          </p>
        ) : (
          <p className='text-muted-foreground text-sm'>Vale a partir da próxima nota.</p>
        )}
      </form>
    )
  }

  return (
    <div className='flex flex-col gap-3'>
      {data.cpf ? (
        <p className='text-base text-pretty'>
          CPF <span className='tabular-nums'>{maskCpf(data.cpf)}</span>
          {user && <span className='text-muted-foreground'> · enviada para {user.email}</span>}
        </p>
      ) : (
        <p className='text-muted-foreground text-base text-pretty'>
          Ainda sem CPF. Ele é pedido no pagamento, junto com o cartão.
        </p>
      )}
      <button type='button' onClick={startEditing} className={`${textLinkClassName} w-fit`}>
        {data.cpf ? 'Corrigir CPF' : 'Informar CPF agora'}
      </button>
    </div>
  )
}

export default NotaFiscal
