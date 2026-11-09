'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useUser } from '@/components/app/session'

import { getRoleRequest, requestRole } from '@/lib/lvh/api'
import { cn } from '@/lib/utils'

const roles = ['Tio', 'Tia', 'Padrinho', 'Madrinha', 'Amigo', 'Amiga']

// Fica dentro do formulário do onboarding: nada aqui envia o formulário
const AvisePapeis = () => {
  const user = useUser()
  const [open, setOpen] = useState(false)
  const [choice, setChoice] = useState('')
  const [saved, setSaved] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getRoleRequest(user.email).then(request => {
      if (request) setSaved(request.role)
    })
  }, [user.email])

  const confirm = async () => {
    try {
      await requestRole(user.email, choice)
      setSaved(choice)
      setOpen(false)
      setError(null)
    } catch (reason) {
      setError((reason as Error).message)
    }
  }

  if (saved) {
    return (
      <p className='text-muted-foreground text-sm'>
        Combinado! Vamos avisar em <span className='text-foreground'>{user.email}</span> quando o papel de{' '}
        <span className='text-foreground'>{saved.toLowerCase()}</span> chegar.{' '}
        <button
          type='button'
          onClick={() => {
            setChoice(saved)
            setSaved(null)
            setOpen(true)
          }}
          className='text-foreground cursor-pointer underline underline-offset-4'
        >
          Mudar
        </button>
      </p>
    )
  }

  if (!open) {
    return (
      <p className='text-muted-foreground text-sm'>
        Em breve, mais papéis: tio, tia, padrinho, madrinha, amigo e amiga.{' '}
        <button
          type='button'
          onClick={() => setOpen(true)}
          className='text-foreground cursor-pointer underline underline-offset-4'
        >
          Quero receber o aviso
        </button>
      </p>
    )
  }

  return (
    <div className='border-border flex flex-col gap-4 rounded-2xl border p-5 sm:p-6'>
      <div className='flex flex-col gap-1'>
        <p className='text-base font-medium' id='papel-desejado-titulo'>
          Qual papel você gostaria que chegasse primeiro?
        </p>
        <p className='text-muted-foreground text-sm'>Avisamos por e-mail assim que ele estiver pronto.</p>
      </div>

      <div role='radiogroup' aria-labelledby='papel-desejado-titulo' className='flex flex-wrap gap-2'>
        {roles.map(role => (
          <label
            key={role}
            className={cn(
              'has-focus-visible:ring-ring/50 cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors has-focus-visible:ring-3',
              choice === role ? 'bg-moss text-cream border-moss' : 'border-border hover:border-foreground/40'
            )}
          >
            <input
              type='radio'
              name='papel-desejado'
              value={role}
              checked={choice === role}
              onChange={() => setChoice(role)}
              className='sr-only'
            />
            {role}
          </label>
        ))}
      </div>

      {error && <p className='text-destructive text-sm'>{error}</p>}

      <div className='flex items-center gap-4'>
        <Button type='button' variant='honey' className='h-10 px-5' disabled={!choice} onClick={confirm}>
          Avisar quando chegar
        </Button>
        <button
          type='button'
          onClick={() => setOpen(false)}
          className='text-muted-foreground cursor-pointer text-sm underline underline-offset-4'
        >
          Agora não
        </button>
      </div>
    </div>
  )
}

export default AvisePapeis
